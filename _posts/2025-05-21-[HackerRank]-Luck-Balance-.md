---
title: "[HackerRank] Luck Balance "
categories:
  - Algorithm

tags:
  - Sorting

---


## 문제


[https://www.hackerrank.com/challenges/luck-balance/problem?isFullScreen=true](https://www.hackerrank.com/challenges/luck-balance/problem?isFullScreen=true)

- n개의 contest가 있다.
- 각 contest에는 luck 수치가 있다.
- contest를 이기면 `luck` 수치가 <u>감소</u>하고
- contest를 지면 `luck` 수치가 <u>증가</u>한다.
- contest에는 중요도가 있다.
	- 1 → 중요한 경기
	- 0 → 중요하지 않은 경기
- 최대 k개의 중요한 contest를 질 수 있다.
- 전체 경기를 모두 치르고 나서 가질 수 있는 최대의 luck을 반환하라


## 풀이

- 중요하지 않은 경기는 패배하면 무조건 luck을 얻을 수 있다.
- 중요한 경기 중에서는 luck 수치가 작은 경기는 이겨야 하고, luck 수치가 높은 경기는 패배해야 한다.
	- 중요한 경기 점수를 내림차순으로 정렬해 luck이 높은 k개는 더하고
	- 나머지 경기는 이겨서 luck을 빼자


{% raw %}
```python
def luckBalance(k, contests):
    # Write your code here
    result_score = 0
    important_contest_scores = []
    
    for contest in contests:
        score, is_important = contest
        
        if not is_important:
            result_score += score
        else:
            important_contest_scores.append(score)

    important_contest_scores.sort(reverse=True)
    
    result_score += sum(important_contest_scores[:k])
    result_score -= sum(important_contest_scores[k:])
    
    return result_score
```
{% endraw %}



> 시간복잡도: O(NlogN) - sort()


> 공간복잡도: O(N) - 리스트

