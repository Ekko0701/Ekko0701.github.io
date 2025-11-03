---
title: "[Spring MVC 1편] Section6 - Servlet & Spring MVC 발전 과정 정리"
categories:
  - Spring

---


## 목차

1. Servlet MVC
2. Front Controller 패턴 (v1~v5)
3. Spring MVC (old, v1, v2, v3)

---



## Servlet MVC



### 개요


가장 기본적인 MVC 패턴 구현. Controller(Servlet)와 View(JSP)를 분리하여 역할을 명확히 함.



### 구조



{% raw %}
```javascript
Client → Servlet (Controller) → Model 처리 → JSP (View)
```
{% endraw %}




### 코드 예시



#### [MvcMemberFormServlet.java](http://mvcmemberformservlet.java/)



{% raw %}
```java
@WebServlet(name = "mvcMemberFormServlet", urlPatterns = "/servlet-mvc/members/new-form")
public class MvcMemberFormServlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String viewPath = "/WEB-INF/views/new-form.jsp";
        RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
        dispatcher.forward(request, response);
    }
}
```
{% endraw %}




#### [MvcMemberSaveServlet.java](http://mvcmembersaveservlet.java/)



{% raw %}
```java
@WebServlet(name = "mvcMemberSaveServlet", urlPatterns = "/servlet-mvc/members/save")
public class MvcMemberSaveServlet extends HttpServlet {
    private MemberRepository memberRepository = MemberRepository.getInstance();

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String username = request.getParameter("username");
        int age = Integer.parseInt(request.getParameter("age"));

        Member member = new Member(username, age);
        [memberRepository.save](http://memberrepository.save/)(member);

        // Model에 데이터 보관
        request.setAttribute("member", member);

        String view = "/WEB-INF/views/save-result.jsp";
        RequestDispatcher dispatcher = request.getRequestDispatcher(view);
        dispatcher.forward(request, response);
    }
}
```
{% endraw %}




### 특징


**장점**: Controller와 View의 역할 분리


**단점**:

- 중복 코드가 많음 (forward, viewPath)
- 각 기능마다 Servlet 클래스 필요
- View 경로 변경 시 모든 Servlet 수정 필요

---



## Front Controller 패턴



### 전체 발전 과정 요약



{% raw %}
```javascript
v1: Front Controller 도입 (공통 처리)
  ↓
v2: View 분리 (MyView)
  ↓
v3: Model 분리 + Servlet 종속성 제거 + ViewResolver
  ↓
v4: 실용적인 컨트롤러 (단순한 인터페이스)
  ↓
v5: 어댑터 패턴 (다양한 컨트롤러 지원)
```
{% endraw %}



---



## Front Controller v1



### 핵심 개념


**Front Controller 패턴 도입** - 모든 요청을 하나의 서블릿이 받아서 처리



### 구조



{% raw %}
```javascript
Client → FrontControllerServletV1 → ControllerV1 구현체 → JSP (forward)
```
{% endraw %}




### 핵심 코드



#### ControllerV1 인터페이스



{% raw %}
```java
public interface ControllerV1 {
    void process(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException;
}
```
{% endraw %}




#### FrontControllerServletV1



{% raw %}
```java
@WebServlet(name = "frontControllerServletV1", urlPatterns = "/front-controller/v1/*")
public class FrontControllerServletV1 extends HttpServlet {
    private Map<String, ControllerV1> controllerMap = new HashMap<>();

    public FrontControllerServletV1() {
        controllerMap.put("/front-controller/v1/members/new-form", new MemberFormControllerV1());
        controllerMap.put("/front-controller/v1/members/save", new MemberSaveControllerV1());
        controllerMap.put("/front-controller/v1/members", new MemberListControllerV1());
    }

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        ControllerV1 controller = controllerMap.get(requestURI);

        if (controller == null) {
            response.setStatus([HttpServletResponse.SC](http://httpservletresponse.sc/)_NOT_FOUND);
            return;
        }

        controller.process(request, response);
    }
}
```
{% endraw %}




#### MemberFormControllerV1



{% raw %}
```java
public class MemberFormControllerV1 implements ControllerV1 {
    @Override
    public void process(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String viewPath = "/WEB-INF/views/new-form.jsp";
        RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
        dispatcher.forward(request, response);
    }
}
```
{% endraw %}




### 개선점


✅ URL 매핑을 한 곳에서 관리 (controllerMap)


✅ 공통 처리 로직을 Front Controller에서 처리 가능


✅ 인터페이스 도입으로 일관성 있는 구조



### 한계


❌ 각 컨트롤러에서 ViewPath 지정과 forward 중복


❌ HttpServletRequest, HttpServletResponse에 종속적


---



## Front Controller v2



### 핵심 개념


**View 처리 분리** - MyView 객체 도입으로 View 렌더링 로직 중복 제거



### 구조



{% raw %}
```javascript
Client → FrontControllerServletV2 → ControllerV2 구현체 → MyView 반환
                                                            ↓
                                                     FrontController가 render 호출
```
{% endraw %}




### 핵심 코드



#### MyView 클래스



{% raw %}
```java
public class MyView {
    private String viewPath;

    public MyView(String viewPath) {
        this.viewPath = viewPath;
    }

    public void render(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
        dispatcher.forward(request, response);
    }
}
```
{% endraw %}




#### ControllerV2 인터페이스



{% raw %}
```java
public interface ControllerV2 {
    MyView process(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException;
}
```
{% endraw %}




#### FrontControllerServletV2



{% raw %}
```java
@WebServlet(name = "frontControllerServletV2", urlPatterns = "/front-controller/v2/*")
public class FrontControllerServletV2 extends HttpServlet {
    private Map<String, ControllerV2> controllerMap = new HashMap<>();

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        ControllerV2 controller = controllerMap.get(requestURI);

        if (controller == null) {
            response.setStatus([HttpServletResponse.SC](http://httpservletresponse.sc/)_NOT_FOUND);
            return;
        }

        MyView view = controller.process(request, response);
        view.render(request, response);  // Front Controller에서 render 호출
    }
}
```
{% endraw %}




#### MemberFormControllerV2



{% raw %}
```java
public class MemberFormControllerV2 implements ControllerV2 {
    @Override
    public MyView process(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        return new MyView("/WEB-INF/views/new-form.jsp");  // MyView 반환
    }
}
```
{% endraw %}




### v1 → v2 개선점


✅ View 처리 로직(forward) 중복 제거


✅ 컨트롤러는 MyView만 반환하면 됨


✅ View 경로와 렌더링 로직이 MyView로 캡슐화



### 한계


❌ 여전히 HttpServletRequest, HttpServletResponse에 종속적


❌ View의 물리적 경로(/WEB-INF/views/xxx.jsp) 중복


---



## Front Controller v3



### 핵심 개념


**서블릿 종속성 완전 제거 + Model 분리 + ViewResolver 도입**



### 구조



{% raw %}
```javascript
Client → FrontControllerServletV3 → paramMap 생성 → ControllerV3 구현체
                                                          ↓
                                                     ModelView 반환
                                                          ↓
                                    ViewResolver (논리명 → 물리명)
                                                          ↓
                                                      MyView
                                                          ↓
                                                   render(model)
```
{% endraw %}




### 핵심 코드



#### ModelView 클래스



{% raw %}
```java
public class ModelView {
    private String viewName;  // 논리 이름
    private Map<String, Object> model = new HashMap<>();

    public ModelView(String viewName) {
        this.viewName = viewName;
    }

    public String getViewName() {
        return viewName;
    }

    public Map<String, Object> getModel() {
        return model;
    }
}
```
{% endraw %}




#### ControllerV3 인터페이스



{% raw %}
```java
public interface ControllerV3 {
    ModelView process(Map<String, String> paramMap);  // 서블릿 종속성 제거!
}
```
{% endraw %}




#### FrontControllerServletV3



{% raw %}
```java
@WebServlet(name = "frontControllerServletV3", urlPatterns = "/front-controller/v3/*")
public class FrontControllerServletV3 extends HttpServlet {
    private Map<String, ControllerV3> controllerMap = new HashMap<>();

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        ControllerV3 controller = controllerMap.get(requestURI);

        if (controller == null) {
            response.setStatus([HttpServletResponse.SC](http://httpservletresponse.sc/)_NOT_FOUND);
            return;
        }

        // paramMap 생성 (서블릿 기술을 Map으로 변환)
        Map<String, String> paramMap = createParamMap(request);
        
        // ModelView 반환
        ModelView mv = controller.process(paramMap);

        // ViewResolver: 논리 이름 → 물리 이름
        String viewName = mv.getViewName();  // "new-form"
        MyView view = viewResolver(viewName);  // "/WEB-INF/views/new-form.jsp"

        // Model을 request에 담아서 렌더링
        view.render(mv.getModel(), request, response);
    }

    private static MyView viewResolver(String viewName) {
        return new MyView("/WEB-INF/views/" + viewName + ".jsp");
    }

    private static Map<String, String> createParamMap(HttpServletRequest request) {
        Map<String, String> paramMap = new HashMap<>();
        request.getParameterNames().asIterator()
                .forEachRemaining(paramName -> paramMap.put(paramName, request.getParameter(paramName)));
        return paramMap;
    }
}
```
{% endraw %}




#### MemberFormControllerV3



{% raw %}
```java
public class MemberFormControllerV3 implements ControllerV3 {
    @Override
    public ModelView process(Map<String, String> paramMap) {
        return new ModelView("new-form");  // 논리 이름만 반환!
    }
}
```
{% endraw %}




### v2 → v3 개선점


✅ **서블릿 종속성 완전 제거**: HttpServletRequest, Response 사용 안 함


✅ **ViewResolver 도입**: 논리 이름만 사용 ("new-form" → "/WEB-INF/views/new-form.jsp")


✅ **Model 분리**: ModelView 객체로 View 이름과 Model을 함께 관리


✅ 테스트 코드 작성 용이 (순수 자바 객체)



### 한계


❌ 컨트롤러가 ModelView 객체를 생성하고 반환하는 것이 번거로움


❌ 실용성 측면에서 개선 여지 있음


---



## Front Controller v4



### 핵심 개념


**실용적인 컨트롤러** - ModelView 대신 ViewName(String)만 반환



### 구조



{% raw %}
```javascript
Client → FrontControllerServletV4 → paramMap, model 생성 → ControllerV4 구현체
                                                                    ↓
                                                            viewName(String) 반환
                                                                    ↓
                                              ViewResolver (논리명 → 물리명)
                                                                    ↓
                                                                MyView
                                                                    ↓
                                                             render(model)
```
{% endraw %}




### 핵심 코드



#### ControllerV4 인터페이스



{% raw %}
```java
public interface ControllerV4 {
    /**
     * @param paramMap
     * @param model
     * @return viewName (String)
     */
    String process(Map<String, String> paramMap, Map<String, Object> model);
}
```
{% endraw %}




#### FrontControllerServletV4



{% raw %}
```java
@WebServlet(name = "frontControllerServletV4", urlPatterns = "/front-controller/v4/*")
public class FrontControllerServletV4 extends HttpServlet {
    private Map<String, ControllerV4> controllerMap = new HashMap<>();

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        ControllerV4 controller = controllerMap.get(requestURI);

        if (controller == null) {
            response.setStatus([HttpServletResponse.SC](http://httpservletresponse.sc/)_NOT_FOUND);
            return;
        }

        Map<String, String> paramMap = createParamMap(request);
        Map<String, Object> model = new HashMap<>();  // 빈 model 생성
        
        // viewName(String)만 반환
        String viewName = controller.process(paramMap, model);

        MyView view = viewResolver(viewName);
        view.render(model, request, response);
    }

    private static MyView viewResolver(String viewName) {
        return new MyView("/WEB-INF/views/" + viewName + ".jsp");
    }

    private static Map<String, String> createParamMap(HttpServletRequest request) {
        Map<String, String> paramMap = new HashMap<>();
        request.getParameterNames().asIterator()
                .forEachRemaining(paramName -> paramMap.put(paramName, request.getParameter(paramName)));
        return paramMap;
    }
}
```
{% endraw %}




#### MemberFormControllerV4



{% raw %}
```java
public class MemberFormControllerV4 implements ControllerV4 {
    @Override
    public String process(Map<String, String> paramMap, Map<String, Object> model) {
        return "new-form";  // 단순히 String 반환!
    }
}
```
{% endraw %}




### v3 → v4 개선점


✅ **단순한 인터페이스**: ModelView 객체 생성 불필요


✅ **실용성 향상**: ViewName(String)만 반환하면 됨


✅ **Model을 파라미터로 전달**: Front Controller가 생성해서 넣음


✅ 컨트롤러 구현이 더욱 간단해짐



### v3 vs v4 비교


| 항목       | v3        | v4                   |
| -------- | --------- | -------------------- |
| 반환 타입    | ModelView | String               |
| Model 관리 | 컨트롤러가 생성  | Front Controller가 생성 |
| 코드 간결성   | 보통        | 우수                   |
| 구조적 명확성  | 우수        | 보통                   |

undefined

### 한계


❌ 하나의 컨트롤러 인터페이스만 지원 (ControllerV4)


❌ V3 방식을 선호하는 개발자는 사용 불가


---



## Front Controller v5



### 핵심 개념


**어댑터 패턴 도입** - 다양한 종류의 컨트롤러를 모두 지원



### 구조



{% raw %}
```javascript
Client → FrontControllerServletV5
            ↓
       Handler 조회 (Object)
            ↓
     HandlerAdapter 조회
            ↓
       Adapter.handle() 호출
            ↓
     ControllerV3 or V4 실행
            ↓
        ModelView 반환
            ↓
       ViewResolver
            ↓
         MyView
            ↓
        render()
```
{% endraw %}




### 핵심 코드



#### MyHandlerAdapter 인터페이스



{% raw %}
```java
public interface MyHandlerAdapter {
    boolean supports(Object handler);  // 처리 가능한 핸들러인지 확인
    
    ModelView handle(HttpServletRequest request, HttpServletResponse response, 
                    Object handler) throws ServletException, IOException;
}
```
{% endraw %}




#### ControllerV3HandlerAdapter



{% raw %}
```java
public class ControllerV3HandlerAdapter implements MyHandlerAdapter {
    @Override
    public boolean supports(Object handler) {
        return (handler instanceof ControllerV3);
    }

    @Override
    public ModelView handle(HttpServletRequest request, HttpServletResponse response, 
                           Object handler) throws ServletException, IOException {
        ControllerV3 controller = (ControllerV3) handler;

        Map<String, String> paramMap = createParamMap(request);
        ModelView mv = controller.process(paramMap);

        return mv;
    }

    private static Map<String, String> createParamMap(HttpServletRequest request) {
        Map<String, String> paramMap = new HashMap<>();
        request.getParameterNames().asIterator()
                .forEachRemaining(paramName -> 
                    paramMap.put(paramName, request.getParameter(paramName)));
        return paramMap;
    }
}
```
{% endraw %}




#### ControllerV4HandlerAdapter



{% raw %}
```java
public class ControllerV4HandlerAdapter implements MyHandlerAdapter {
    @Override
    public boolean supports(Object handler) {
        return (handler instanceof ControllerV4);
    }

    @Override
    public ModelView handle(HttpServletRequest request, HttpServletResponse response, 
                           Object handler) throws ServletException, IOException {
        ControllerV4 controller = (ControllerV4) handler;

        Map<String, String> paramMap = createParamMap(request);
        Map<String, Object> model = new HashMap<>();

        String viewName = controller.process(paramMap, model);

        // V4는 String을 반환하므로 ModelView로 변환
        ModelView mv = new ModelView(viewName);
        mv.setModel(model);
        return mv;
    }

    private static Map<String, String> createParamMap(HttpServletRequest request) {
        Map<String, String> paramMap = new HashMap<>();
        request.getParameterNames().asIterator()
                .forEachRemaining(paramName -> 
                    paramMap.put(paramName, request.getParameter(paramName)));
        return paramMap;
    }
}
```
{% endraw %}




#### FrontControllerServletV5



{% raw %}
```java
@WebServlet(name = "frontControllerServletV5", urlPatterns = "/front-controller/v5/*")
public class FrontControllerServletV5 extends HttpServlet {
    private final Map<String, Object> handlerMappingMap = new HashMap<>();  // Object!
    private final List<MyHandlerAdapter> handlerAdapters = new ArrayList<>();

    public FrontControllerServletV5() {
        initHandlerMappingMap();
        initHandlerAdapters();
    }

    private void initHandlerMappingMap() {
        // V3 컨트롤러
        handlerMappingMap.put("/front-controller/v5/v3/members/new-form", 
                             new MemberFormControllerV3());
        handlerMappingMap.put("/front-controller/v5/v3/members/save", 
                             new MemberSaveControllerV3());
        handlerMappingMap.put("/front-controller/v5/v3/members", 
                             new MemberListControllerV3());

        // V4 컨트롤러
        handlerMappingMap.put("/front-controller/v5/v4/members/new-form", 
                             new MemberFormControllerV4());
        handlerMappingMap.put("/front-controller/v5/v4/members/save", 
                             new MemberSaveControllerV4());
        handlerMappingMap.put("/front-controller/v5/v4/members", 
                             new MemberListControllerV4());
    }

    private void initHandlerAdapters() {
        handlerAdapters.add(new ControllerV3HandlerAdapter());
        handlerAdapters.add(new ControllerV4HandlerAdapter());
    }

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        // 1. 핸들러 조회
        Object handler = getHandler(request);

        if (handler == null) {
            response.setStatus([HttpServletResponse.SC](http://httpservletresponse.sc/)_NOT_FOUND);
            return;
        }

        // 2. 핸들러 어댑터 조회
        MyHandlerAdapter adapter = getHandlerAdapter(handler);

        // 3. 어댑터를 통해 핸들러 실행
        ModelView mv = adapter.handle(request, response, handler);

        // 4. ViewResolver
        String viewName = mv.getViewName();
        MyView view = viewResolver(viewName);

        // 5. 렌더링
        view.render(mv.getModel(), request, response);
    }

    private MyHandlerAdapter getHandlerAdapter(Object handler) {
        for (MyHandlerAdapter adapter : handlerAdapters) {
            if (adapter.supports(handler)) {
                return adapter;
            }
        }
        throw new IllegalArgumentException("No handler adapter found for handler " + handler);
    }

    private Object getHandler(HttpServletRequest request) {
        String requestURI = request.getRequestURI();
        return handlerMappingMap.get(requestURI);
    }

    private static MyView viewResolver(String viewName) {
        return new MyView("/WEB-INF/views/" + viewName + ".jsp");
    }
}
```
{% endraw %}




### v4 → v5 개선점


✅ **유연한 컨트롤러 지원**: V3, V4 모두 사용 가능


✅ **확장성**: 새로운 컨트롤러 타입 추가 용이 (어댑터만 추가)


✅ **OCP(Open-Closed Principle)**: 기능 확장에는 열려있고 변경에는 닫혀있음


✅ **어댑터 패턴**: 호환되지 않는 인터페이스를 함께 사용 가능



### 어댑터 패턴의 핵심



{% raw %}
```javascript
FrontController는 ModelView만 받으면 됨
     ↓
ControllerV3 → ModelView 직접 반환
ControllerV4 → String 반환 → Adapter가 ModelView로 변환
     ↓
결과적으로 FrontController는 항상 ModelView를 받음
```
{% endraw %}




### 실제 Spring MVC와의 연관성

- **DispatcherServlet**: FrontControllerServletV5
- **HandlerMapping**: handlerMappingMap
- **HandlerAdapter**: MyHandlerAdapter
- **ViewResolver**: viewResolver()

---



## Spring MVC



### 전체 발전 과정



{% raw %}
```javascript
old: 스프링 레거시 인터페이스 (Controller, HttpRequestHandler)
  ↓
v1: @Controller + @RequestMapping (기본)
  ↓
v2: 클래스 레벨 @RequestMapping (중복 제거)
  ↓
v3: 실용적인 방식 (Model, @RequestParam, @GetMapping/@PostMapping)
```
{% endraw %}



---



## Spring MVC - old



### 개요


스프링 초기 버전에서 사용하던 방식. 인터페이스 기반.



### 1. Controller 인터페이스 방식



#### [OldController.java](http://oldcontroller.java/)



{% raw %}
```java
@Component("/springmvc/old-controller")  // 빈 이름이 URL!
public class OldController implements Controller {
    @Override
    public ModelAndView handleRequest(HttpServletRequest request, 
                                     HttpServletResponse response) throws Exception {
        System.out.println("OldController.handleRequest");
        return new ModelAndView("new-form");
    }
}
```
{% endraw %}




#### 동작 방식

1. `@Component("/springmvc/old-controller")` - 빈 이름으로 URL 매핑
2. `BeanNameUrlHandlerMapping`이 빈 이름으로 핸들러 찾기
3. `SimpleControllerHandlerAdapter`가 Controller 인터페이스 실행


### 2. HttpRequestHandler 인터페이스 방식



#### [MyHttpRequestHandler.java](http://myhttprequesthandler.java/)



{% raw %}
```java
@Component("/springmvc/request-handler")
public class MyHttpRequestHandler implements HttpRequestHandler {
    @Override
    public void handleRequest(HttpServletRequest request, 
                             HttpServletResponse response) 
            throws ServletException, IOException {
        System.out.println("MyHttpRequestHandler.handleRequest");
    }
}
```
{% endraw %}




#### 동작 방식

1. `BeanNameUrlHandlerMapping`으로 핸들러 찾기
2. `HttpRequestHandlerAdapter`가 HttpRequestHandler 인터페이스 실행


### 특징

- 과거 방식으로 현재는 거의 사용 안 함
- 빈 이름으로 URL 매핑
- 스프링이 제공하는 HandlerMapping과 HandlerAdapter가 자동으로 작동

---



## Spring MVC - v1



### 핵심 개념


`@Controller`와 `@RequestMapping` 애노테이션 사용



### 코드 예시



#### [SpringMemberFormControllerV1.java](http://springmemberformcontrollerv1.java/)



{% raw %}
```java
@Controller
public class SpringMemberFormControllerV1 {
    @RequestMapping("/springmvc/v1/members/new-form")
    public ModelAndView process() {
        return new ModelAndView("new-form");
    }
}
```
{% endraw %}




#### [SpringMemberSaveControllerV1.java](http://springmembersavecontrollerv1.java/)



{% raw %}
```java
@Controller
public class SpringMemberSaveControllerV1 {
    private MemberRepository memberRepository = MemberRepository.getInstance();

    @RequestMapping("/springmvc/v1/members/save")
    public ModelAndView process(HttpServletRequest request, HttpServletResponse response) {
        String username = request.getParameter("username");
        int age = Integer.parseInt(request.getParameter("age"));

        Member member = new Member(username, age);
        [memberRepository.save](http://memberrepository.save/)(member);

        ModelAndView mv = new ModelAndView("save-result");
        mv.addObject("member", member);
        return mv;
    }
}
```
{% endraw %}




#### [SpringMemberListControllerV1.java](http://springmemberlistcontrollerv1.java/)



{% raw %}
```java
@Controller
public class SpringMemberListControllerV1 {
    private MemberRepository memberRepository = MemberRepository.getInstance();

    @RequestMapping("/springmvc/v1/members")
    public ModelAndView process(Map<String, String> paramMap) {
        List<Member> members = memberRepository.findAll();
        ModelAndView mv = new ModelAndView("members");
        mv.addObject("members", members);

        return mv;
    }
}
```
{% endraw %}




### 특징


✅ `@Controller`: 스프링이 자동으로 빈 등록 + 컨트롤러로 인식


✅ `@RequestMapping`: URL 매핑


✅ `RequestMappingHandlerMapping`, `RequestMappingHandlerAdapter` 사용


✅ 유연한 파라미터 (HttpServletRequest, Map 등)



### 한계


❌ 각 기능마다 별도 클래스 필요


❌ URL 경로에 중복이 많음 (`/springmvc/v1/members/...`)


---



## Spring MVC - v2



### 핵심 개념


**클래스 레벨** **`@RequestMapping`** 으로 중복 제거 + 메서드 통합



### 코드 예시



#### [SpringMemberControllerV2.java](http://springmembercontrollerv2.java/)



{% raw %}
```java
@Controller
@RequestMapping("/springmvc/v2/members")  // 클래스 레벨
public class SpringMemberControllerV2 {
    private MemberRepository memberRepository = MemberRepository.getInstance();

    @RequestMapping("/new-form")
    public ModelAndView newForm() {
        return new ModelAndView("new-form");
    }

    @RequestMapping("")  // /springmvc/v2/members
    public ModelAndView members(Map<String, String> paramMap) {
        List<Member> members = memberRepository.findAll();
        ModelAndView mv = new ModelAndView("members");
        mv.addObject("members", members);
        return mv;
    }

    @RequestMapping("/save")
    public ModelAndView save(HttpServletRequest request, HttpServletResponse response) {
        String username = request.getParameter("username");
        int age = Integer.parseInt(request.getParameter("age"));

        Member member = new Member(username, age);
        [memberRepository.save](http://memberrepository.save/)(member);

        ModelAndView mv = new ModelAndView("save-result");
        mv.addObject("member", member);
        return mv;
    }
}
```
{% endraw %}




### v1 → v2 개선점


✅ **클래스 레벨 매핑**: 공통 URL 경로를 한 번만 선언


✅ **하나의 클래스에 통합**: 관련 기능들이 한 곳에 모임


✅ **조합 매핑**: 클래스 레벨 + 메서드 레벨 URL 조합



{% raw %}
```javascript
클래스: @RequestMapping("/springmvc/v2/members")
메서드: @RequestMapping("/new-form")
결과: /springmvc/v2/members/new-form
```
{% endraw %}




### 한계


❌ 여전히 ModelAndView 객체 생성 필요


❌ request.getParameter() 직접 호출


❌ HTTP 메서드 구분 없음


---



## Spring MVC - v3



### 핵심 개념


**가장 실용적인 방식** - Model 파라미터, @RequestParam, @GetMapping/@PostMapping



### 코드 예시



#### [SpringMemberControllerV3.java](http://springmembercontrollerv3.java/)



{% raw %}
```java
@Controller
@RequestMapping("/springmvc/v3/members")
public class SpringMemberControllerV3 {
    private MemberRepository memberRepository = MemberRepository.getInstance();

    @RequestMapping(value = "/new-form", method = RequestMethod.GET)
    // 또는 @GetMapping("/new-form")
    public String newForm() {
        return "new-form";  // ViewName(String)만 반환!
    }

    @PostMapping("/save")
    public String save(
            @RequestParam("username") String username,
            @RequestParam("age") int age,
            Model model) {

        Member member = new Member(username, age);
        [memberRepository.save](http://memberrepository.save/)(member);

        model.addAttribute("member", member);
        return "save-result";  // ViewName(String)만 반환!
    }

    @GetMapping("")
    public String members(Model model) {
        List<Member> members = memberRepository.findAll();
        model.addAttribute("members", members);
        return "members";
    }
}
```
{% endraw %}




### v2 → v3 개선점


✅ **ViewName(String) 반환**: ModelAndView 객체 생성 불필요


✅ **Model 파라미터**: 스프링이 자동으로 생성해서 주입


✅ **@RequestParam**: 파라미터 자동 바인딩 (타입 변환 포함)


✅ **@GetMapping, @PostMapping**: HTTP 메서드 구분


✅ **가장 실용적**: 현재 실무에서 가장 많이 사용하는 방식



### 스프링의 자동 처리



{% raw %}
```java
@GetMapping("/save")
public String save(
    @RequestParam("username") String username,  // 자동 바인딩
    @RequestParam("age") int age,               // 자동 타입 변환
    Model model) {                              // 자동 주입
    
    model.addAttribute("member", member);
    return "save-result";  // ViewResolver가 자동으로 처리
}
```
{% endraw %}




### 실무 권장 방식


이것이 **현재 스프링 MVC의 표준 방식**입니다.


---



## 전체 발전 과정 정리



### 1단계: Servlet MVC

- Controller와 View 분리
- 중복 코드 많음


### 2단계: Front Controller v1~v5

- **v1**: Front Controller 도입
- **v2**: View 분리 (MyView)
- **v3**: Model 분리 + 서블릿 종속성 제거
- **v4**: 실용적인 컨트롤러
- **v5**: 어댑터 패턴 (유연한 구조)


### 3단계: Spring MVC

- **old**: 레거시 인터페이스 방식
- **v1**: @Controller + @RequestMapping
- **v2**: 클래스 레벨 매핑
- **v3**: 가장 실용적 (현재 표준)

---



## Spring MVC의 핵심 구조



{% raw %}
```javascript
DispatcherServlet (Front Controller)
        ↓
HandlerMapping (URL → Handler)
        ↓
HandlerAdapter (Handler 실행)
        ↓
Controller 실행
        ↓
ViewResolver (논리명 → 물리명)
        ↓
View 렌더링
```
{% endraw %}



---



## 학습 포인트



### 1. 공통 처리의 중요성


Front Controller 패턴을 통해 모든 요청을 한 곳에서 처리하고, 공통 로직을 효율적으로 관리합니다.



### 2. 관심사의 분리

- **View**: 화면 렌더링
- **Model**: 데이터 전달
- **Controller**: 비즈니스 로직 처리

각각의 역할을 명확히 분리하여 구조를 개선했습니다.



### 3. 인터페이스와 다형성


인터페이스를 통해 일관성 있는 구조를 만들고, 다형성을 활용하여 유연한 설계를 구현했습니다.



### 4. 어댑터 패턴


호환되지 않는 인터페이스들을 함께 사용할 수 있도록 변환하는 패턴입니다. Spring MVC의 HandlerAdapter가 바로 이 패턴을 사용합니다.



### 5. 점진적 개선


작은 개선들이 모여 완성도 높은 프레임워크가 되었습니다. 한 번에 모든 것을 바꾸는 것이 아니라, 단계별로 문제를 해결하며 발전했습니다.


---



## 주요 개념 요약



### Front Controller Pattern


모든 요청을 하나의 컨트롤러가 받아 처리하는 패턴



### Adapter Pattern


호환되지 않는 인터페이스를 함께 사용할 수 있게 변환하는 패턴



### ViewResolver


논리적 뷰 이름을 물리적 경로로 변환하는 역할



### HandlerMapping


URL과 핸들러(컨트롤러)를 매핑하는 역할



### HandlerAdapter


다양한 종류의 핸들러를 실행할 수 있게 어댑터를 제공하는 역할


---



## 정리


Servlet MVC에서 시작하여 Front Controller 패턴을 거쳐 Spring MVC까지의 발전 과정을 학습했습니다. 각 단계마다 해결하려는 문제와 개선 방향을 이해하는 것이 중요합니다.


Spring MVC는 이러한 모든 개선 사항들을 프레임워크로 제공하며, 개발자는 비즈니스 로직에만 집중할 수 있게 해줍니다.

