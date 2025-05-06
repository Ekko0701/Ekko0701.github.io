// notion-import.js
const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

function escapeCodeBlock(body) {
  return body.replace(/```([\s\S]*?)```/g, (_, htmlBlock) => {
    return `\n{% raw %}\n\```\n${htmlBlock.trim()}\n\```\n{% endraw %}\n`;
  });
}

function replaceTitleOutsideRawBlocks(body) {
  const rawBlocks = [];
  const placeholder = "%%RAW_BLOCK%%";
  body = body.replace(/{% raw %}[\s\S]*?{% endraw %}/g, match => {
    rawBlocks.push(match);
    return placeholder;
  });
  body = body.replace(/\n#[^\n]+\n/g, match => match.replace("\n#", "\n##"));
  rawBlocks.forEach(block => {
    body = body.replace(placeholder, block);
  });
  return body;
}

(async () => {
  const root = "_posts";
  fs.mkdirSync(root, { recursive: true });

  const databaseId = process.env.DATABASE_ID;
  let response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "발행여부",
      checkbox: { equals: false },
    },
  });

  const pages = response.results;
  while (response.has_more) {
    response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: response.next_cursor,
      filter: {
        property: "발행여부",
        checkbox: { equals: false },
      },
    });
    pages.push(...response.results);
  }

  for (const r of pages) {
    const id = r.id;
    let date = moment(r.created_time).format("YYYY-MM-DD");
    const pdate = r.properties?.["날짜"]?.["date"]?.["start"];
    if (pdate) date = moment(pdate).format("YYYY-MM-DD");

    let title = id;
    const ptitle = r.properties?.["게시물"]?.["title"];
    if (ptitle?.length > 0) title = ptitle[0]?.["plain_text"];

    const tags = r.properties?.["태그"]?.["multi_select"].map(t => t.name) || [];
    const cats = r.properties?.["카테고리"]?.["multi_select"].map(t => t.name) || [];

    const fmtags = tags.length > 0 ? `\ntags:\n${tags.map(t => `  - ${t}\n`).join("")}` : "";
    const fmcats = cats.length > 0 ? `\ncategories:\n${cats.map(c => `  - ${c}\n`).join("")}` : "";

    const fm = `---\ntitle: "${title}"${fmcats}${fmtags}\n---\n`;
    const mdblocks = await n2m.pageToMarkdown(id);
    let md = n2m.toMarkdownString(mdblocks).parent;
    if (!md) continue;

    md = escapeCodeBlock(md);
    md = replaceTitleOutsideRawBlocks(md);

    const ftitle = `${date}-${title.replace(/\s+/g, "-").replace(/[^가-힣a-zA-Z0-9-_]/g, "")}.md`;
    const filePath = path.join(root, ftitle);
    if (fs.existsSync(filePath)) {
      console.log(`SKIP: ${filePath} 이미 존재함.`);
      continue;
    }

    let index = 0;
    const edited_md = md.replace(/!\[(.*?)\]\((.*?)\)/g, (_, p1, p2) => {
      const dirname = path.join("assets/img", ftitle);
      fs.mkdirSync(dirname, { recursive: true });
      const filename = path.join(dirname, `${index}.png`);

      axios.get(p2, { responseType: "stream" })
        .then(res => res.data.pipe(fs.createWriteStream(filename)))
        .catch(err => console.log("이미지 다운로드 실패:", err));

      return `![${index++}](/${filename})${p1 ? `_${p1}_` : ""}`;
    });

    await fs.promises.writeFile(filePath, fm + edited_md);
    console.log(`✅ 작성됨: ${filePath}`);
  }
})();



