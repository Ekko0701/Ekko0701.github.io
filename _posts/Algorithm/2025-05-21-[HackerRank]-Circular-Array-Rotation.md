---
title: "[HackerRank] Circular Array Rotation"
categories:
  - Algorithm

tags:
  - Array
  - Implementation

---


## 문제


[https://www.hackerrank.com/challenges/circular-array-rotation/problem?isFullScreen=true](https://www.hackerrank.com/challenges/circular-array-rotation/problem?isFullScreen=true)


정수형 배열 `a`를 `k`만큼 회전시키고 `queries` 배열에 있는 인덱스들의 값을 반환하라



## 풀이


문제를 처음 보고 원형큐가 떠올랐다. 


하지만 문제에서 `enqueue`, `dequeue`가 필요 없기 때문에 원형큐 구현은 투머치라고 생각했다.


회전 시 인덱스 `i`에 있던 값은 `((i + k) % len(a))` 위치에 있게 되는 특성을 이용하자.



{% raw %}
```python
def circularArrayRotation(a, k, queries):
    # Write your code here
    result = []
    
    if k > len(a):
        k = k % len(a)
        
    for query in queries:
        index = (query - k) % len(a)
        result.append(a[index])
    
    return result
```
{% endraw %}



> 시간복잡도: O(N)


> 공간복잡도: O(N)

