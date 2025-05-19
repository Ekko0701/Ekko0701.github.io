---
title: "[Programmers] 프로세스"
categories:
  - Algorithm

tags:
  - Queue

---


### 문제


[bookmark](https://school.programmers.co.kr/learn/courses/30/lessons/42587)



{% raw %}
```text
1. 실행 대기 큐(Queue)에서 대기중인 프로세스 하나를 꺼냅니다.
2. 큐에 대기중인 프로세스 중 우선순위가 더 높은 프로세스가 있다면 방금 꺼낸 프로세스를 다시 큐에 넣습니다.
3. 만약 그런 프로세스가 없다면 방금 꺼낸 프로세스를 실행합니다.
  3.1 한 번 실행한 프로세스는 다시 큐에 넣지 않고 그대로 종료됩니다.
```
{% endraw %}



숫자가 클 수록 우선 순위가 높다.


ex1) 


priorities = [2, 1, 3, 2], location = 2


2번 인덱스인 C는 몇 번째로 실행 되는가?


[A, B, C, D] → [C, D, A, B] → [3, 2, 2, 1]


ex2)


priorities = [1, 1, 9, 1, 1, 1], location = 0


0번 인덱스인 A는 몇 번째로 실행 되는가?


[C, D, E, F, A, B] 순서로 실행되고 A는 5 번째로 실행 됨


---



### 예상 풀이

- <u>list</u>형태의 `priorities`를 <u>deque</u>으로 만든다.
- `priorities`의 <u>max</u> 값을 구한다.
- max인 원소가 나올 때 까지 `priorities`의 앞쪽에서 부터 원소를 뽑는다.
	- max가 나오기 전 까지는 원소를 뽑는 즉시 `priorities`에 다시 넣는다.
- max가 나오면 정답 리스트에 저장한다.
- 원하는 location에 있는 원소가 실행될 때까지 반복한다.

---



### 내 정답



{% raw %}
```python
from collections import deque

def solution(priorities, location):
    queue = deque([(priority, idx) for idx, priority in enumerate(priorities)])
    count = 0

    while queue:
        current = queue.popleft()
        
        # 큐의 최대 우선순위와 비교하여 더 높은 우선순위가 있는지 확인
        if current[0] < max(queue, default=(0,))[0]:
            queue.append(current)
        else:
            # 현재 프로세스를 실행
            count += 1
            if current[1] == location:
                return count
```
{% endraw %}



---



### 다른 사람의 정답

- `any()` 메서드를 사용해 리스트에 우선순위가 더 높은 값이 존재 하는지 확인했다.


{% raw %}
```python
from collections import deque

def solution(priorities, location):
    queue = deque([(priority, idx) for idx, priority in enumerate(priorities)])
    count = 0

    while queue:
        current = queue.popleft()
        
        if any(current[0] < item[0] for item in queue):
            queue.append(current)
        else:
            count += 1
            if current[1] == location:
                return count
```
{% endraw %}




{% raw %}
```python
def solution(priorities, location):
    jobs = len(priorities)  # 대기 중인 작업 수
    answer = 0               # 실행된 프로세스 수 (순서)
    cursor = 0               # 현재 위치를 추적하는 변수

    while True:
        # 현재 큐에서 가장 높은 우선순위가 현재 프로세스의 우선순위와 같은지 확인
        if max(priorities) == priorities[cursor % jobs]:
            # 현재 프로세스의 우선순위를 0으로 설정하여 실행 완료 표시
            priorities[cursor % jobs] = 0
            answer += 1  # 실행된 순서 증가

            # 실행된 프로세스가 원하는 위치에 있는 경우
            if cursor % jobs == location:
                break  # 종료하고 answer 반환

        # 우선순위가 높은 프로세스가 있다면 다음 프로세스로 이동
        cursor += 1   

    return answer
```
{% endraw %}


