---
title: "Swift Combine 프레임워크 정리"
categories:
  - iOS

---

Combine은 Apple이 제공하는 선언적(declarative) Swift API로, 시간에 따른 값의 처리를 위한 reactive programming 프레임워크입니다.



### 핵심 개념



#### 1. Publisher (발행자)


Publisher는 시간에 따라 값을 방출(emit)할 수 있는 타입입니다.


**주요 특징:**

- 하나 이상의 Subscriber에게 값을 전달
- Output 타입: 방출하는 값의 타입
- Failure 타입: 발생 가능한 에러 타입 (Never면 에러 없음)

**기본 Publisher들:**



{% raw %}
```swift
// Just - 단일 값을 방출하고 완료
let justPublisher = Just(5)

// Future - 비동기 작업의 단일 결과
let futurePublisher = Future<Int, Never> { promise in
    DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
        promise(.success(42))
    }
}

// PassthroughSubject - 수동으로 값을 전송
let subject = PassthroughSubject<String, Never>()

// Published - 프로퍼티 래퍼
@Published var value: Int = 0
```
{% endraw %}




#### 2. Subscriber (구독자)


Subscriber는 Publisher로부터 값을 받는 타입입니다.


**주요 메서드:**

- `sink`: 가장 간단한 구독 방법
- `assign`: 값을 프로퍼티에 자동 할당


{% raw %}
```swift
// sink 사용
let cancellable = publisher
    .sink(
        receiveCompletion: { completion in
            switch completion {
            case .finished:
                print("완료")
            case .failure(let error):
                print("에러: \(error)")
            }
        },
        receiveValue: { value in
            print("값: \(value)")
        }
    )

// assign 사용
let cancellable = publisher
    .assign(to: \.text, on: label)
```
{% endraw %}




#### 3. Operator (연산자)


Operator는 Publisher를 변환, 필터링, 결합하는 메서드들입니다.



#### 변환 Operators



{% raw %}
```swift
// map - 값을 변환
publisher
    .map { $0 * 2 }
    .sink { print($0) }

// flatMap - Publisher를 반환하는 변환
publisher
    .flatMap { value in
        URLSession.shared.dataTaskPublisher(for: url)
    }

// compactMap - nil 값 제거
publisher
    .compactMap { Int($0) }
```
{% endraw %}




#### 필터링 Operators



{% raw %}
```swift
// filter - 조건에 맞는 값만 통과
publisher
    .filter { $0 > 10 }

// removeDuplicates - 연속된 중복 값 제거
publisher
    .removeDuplicates()

// first - 첫 번째 값만
publisher
    .first()

// last - 마지막 값만
publisher
    .last()
```
{% endraw %}




#### 결합 Operators



{% raw %}
```swift
// combineLatest - 두 Publisher의 최신 값을 결합
Publishers.CombineLatest(publisher1, publisher2)
    .sink { value1, value2 in
        print("\(value1), \(value2)")
    }

// merge - 여러 Publisher를 하나로
Publishers.Merge(publisher1, publisher2)

// zip - 각 Publisher에서 하나씩 쌍으로
[Publishers.Zip](http://publishers.zip/)(publisher1, publisher2)
```
{% endraw %}




#### 에러 처리 Operators



{% raw %}
```swift
// catch - 에러를 처리하고 대체 Publisher 제공
publisher
    .catch { error in
        Just(defaultValue)
    }

// retry - 실패 시 재시도
publisher
    .retry(3)

// replaceError - 에러를 특정 값으로 대체
publisher
    .replaceError(with: defaultValue)
```
{% endraw %}




#### 타이밍 Operators



{% raw %}
```swift
// debounce - 지정된 시간 동안 값이 없을 때만 방출
textField.publisher
    .debounce(for: .milliseconds(500), scheduler: RunLoop.main)

// throttle - 지정된 간격으로 값을 제한
publisher
    .throttle(for: .seconds(1), scheduler: RunLoop.main, latest: true)

// delay - 값 방출 지연
publisher
    .delay(for: .seconds(2), scheduler: RunLoop.main)
```
{% endraw %}




#### 4. Subject


Subject는 Publisher이면서 동시에 값을 수동으로 전송할 수 있는 타입입니다.



{% raw %}
```swift
// PassthroughSubject - 값을 저장하지 않음
let passthrough = PassthroughSubject<String, Never>()
passthrough.send("Hello")

// CurrentValueSubject - 현재 값을 저장
let currentValue = CurrentValueSubject<Int, Never>(0)
print(currentValue.value) // 0
currentValue.send(1)
print(currentValue.value) // 1
```
{% endraw %}




#### 5. Cancellable


구독을 관리하고 취소하는 프로토콜입니다.



{% raw %}
```swift
// AnyCancellable로 저장
var cancellables = Set<AnyCancellable>()

publisher
    .sink { value in
        print(value)
    }
    .store(in: &cancellables)

// 수동 취소
cancellable.cancel()

// Set에 저장된 모든 구독 취소
cancellables.removeAll()
```
{% endraw %}




### 실전 사용 예제



#### 1. 네트워크 요청



{% raw %}
```swift
func fetchData(from url: URL) -> AnyPublisher<Data, Error> {
    URLSession.shared.dataTaskPublisher(for: url)
        .map(\.data)
        .mapError { $0 as Error }
        .eraseToAnyPublisher()
}

fetchData(from: url)
    .decode(type: User.self, decoder: JSONDecoder())
    .receive(on: DispatchQueue.main)
    .sink(
        receiveCompletion: { completion in
            if case .failure(let error) = completion {
                print("에러: \(error)")
            }
        },
        receiveValue: { user in
            print("사용자: \(user)")
        }
    )
    .store(in: &cancellables)
```
{% endraw %}




#### 2. 폼 검증



{% raw %}
```swift
class LoginViewModel {
    @Published var username = ""
    @Published var password = ""
    @Published var isValid = false
    
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        Publishers.CombineLatest($username, $password)
            .map { username, password in
                username.count >= 3 && password.count >= 6
            }
            .assign(to: &$isValid)
    }
}
```
{% endraw %}




#### 3. 검색 기능 (디바운싱)



{% raw %}
```swift
class SearchViewModel {
    @Published var searchText = ""
    @Published var results: [String] = []
    
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        $searchText
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .removeDuplicates()
            .filter { !$0.isEmpty }
            .flatMap { text in
                [self.search](http://self.search/)(text)
                    .catch { _ in Just([]) }
            }
            .assign(to: &$results)
    }
    
    func search(_ text: String) -> AnyPublisher<[String], Error> {
        // 실제 검색 로직
        Just(["결과1", "결과2"])
            .setFailureType(to: Error.self)
            .eraseToAnyPublisher()
    }
}
```
{% endraw %}




#### 4. 여러 네트워크 요청 결합



{% raw %}
```swift
func loadUserProfile(userId: String) -> AnyPublisher<UserProfile, Error> {
    let userPublisher = fetchUser(userId)
    let postsPublisher = fetchPosts(userId)
    let friendsPublisher = fetchFriends(userId)
    
    return [Publishers.Zip](http://publishers.zip/)3(userPublisher, postsPublisher, friendsPublisher)
        .map { user, posts, friends in
            UserProfile(user: user, posts: posts, friends: friends)
        }
        .eraseToAnyPublisher()
}
```
{% endraw %}




### 주요 패턴



#### 1. Backpressure 처리



{% raw %}
```swift
publisher
    .buffer(size: 10, prefetch: .byRequest, whenFull: .dropOldest)
```
{% endraw %}




#### 2. 메모리 관리



{% raw %}
```swift
// weak self 사용
publisher
    .sink { [weak self] value in
        self?.handleValue(value)
    }
    .store(in: &cancellables)
```
{% endraw %}




#### 3. Scheduler 활용



{% raw %}
```swift
publisher
    .subscribe(on: [DispatchQueue.global](http://dispatchqueue.global/)()) // 구독을 백그라운드에서
    .receive(on: DispatchQueue.main) // 결과를 메인 스레드에서
    .sink { value in
        // UI 업데이트
    }
```
{% endraw %}




### Combine vs RxSwift


| 항목    | Combine | RxSwift |
| ----- | ------- | ------- |
| 제공자   | Apple   | 커뮤니티    |
| 지원 버전 | iOS 13+ | iOS 8+  |
| 학습 곡선 | 비교적 쉬움  | 가파름     |
| 생태계   | 성장 중    | 성숙함     |
| 성능    | 최적화됨    | 우수함     |

undefined

### 주의사항

1. **메모리 누수**: Cancellable을 적절히 관리하지 않으면 메모리 누수 발생
2. **Scheduler 이해**: UI 업데이트는 반드시 메인 스레드에서
3. **에러 처리**: 에러 타입을 Never로 변환하거나 적절히 처리
4. **강한 참조**: 클로저에서 self를 캡처할 때 weak/unowned 사용


### 유용한 팁

1. `eraseToAnyPublisher()`로 타입을 단순화
2. `share()` 연산자로 중복 작업 방지
3. `print()` 연산자로 디버깅
4. Custom Publisher 만들기로 재사용성 향상


{% raw %}
```swift
// 디버깅
publisher
    .print("Debug")
    .sink { print($0) }

// 공유
let sharedPublisher = expensivePublisher
    .share()

// 여러 구독자가 같은 작업 결과 공유
sharedPublisher.sink { print("1: \($0)") }
sharedPublisher.sink { print("2: \($0)") }
```
{% endraw %}


