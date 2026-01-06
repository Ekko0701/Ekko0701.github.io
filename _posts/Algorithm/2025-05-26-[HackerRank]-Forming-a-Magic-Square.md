---
title: "[HackerRank] Forming a Magic Square"
categories:
  - Algorithm

tags:
  - Implementation
  - Brute Force

---


## 문제 [(Link)](https://www.hackerrank.com/challenges/magic-square-forming/problem?isFullScreen=true)


`3 * 3` 정사각형이 주어졌을 때, 이 정사각형을 `마방진(Magic Square)`으로 바꾸는 최소 비용을 반환하라.


`마방진`의 조건은 다음과 같다.

- 1 ~ 9까지의 숫자를 한 번씩만 사용
- 행, 열, 대각선의 합이 모두 같다


{% raw %}
```python
8 1 6
3 5 7
4 9 2
```
{% endraw %}



`마방진`이 아닌 정사각형의 원소들을 교체할 수 있으며, 이때 `|바뀔 숫자 - 원래 숫자|`만큼의 비용이 발생한다.



## 풀이

- `마방진`인 경우 각 행, 열, 대각선의 합은 `15`이다.
- `3 * 3 마방진`인 경우 총 8가지 경우의 수만 존재한다.


{% raw %}
```python
magic_squares = [
        [[8, 1, 6], [3, 5, 7], [4, 9, 2]],
        [[6, 1, 8], [7, 5, 3], [2, 9, 4]],
        [[4, 9, 2], [3, 5, 7], [8, 1, 6]],
        [[2, 9, 4], [7, 5, 3], [6, 1, 8]],
        [[6, 7, 2], [1, 5, 9], [8, 3, 4]],
        [[2, 7, 6], [9, 5, 1], [4, 3, 8]],
        [[4, 3, 8], [9, 5, 1], [2, 7, 6]],
        [[8, 3, 4], [1, 5, 9], [6, 7, 2]]
    ]
```
{% endraw %}


- Input인 정사각형과 magic_squares들을 비교해 마방진이 되기 위한 최소 비용을 찾자


{% raw %}
```python
def getCost(arr, magic):
    cost = 0
    for i in range(3):
        for j in range(3):
            cost += abs(arr[i][j] - magic[i][j])
            
    return cost
            
def formingMagicSquare(s):
    # Write your code here
    magic_squares = [
        [[8, 1, 6], [3, 5, 7], [4, 9, 2]],
        [[6, 1, 8], [7, 5, 3], [2, 9, 4]],
        [[4, 9, 2], [3, 5, 7], [8, 1, 6]],
        [[2, 9, 4], [7, 5, 3], [6, 1, 8]],
        [[6, 7, 2], [1, 5, 9], [8, 3, 4]],
        [[2, 7, 6], [9, 5, 1], [4, 3, 8]],
        [[4, 3, 8], [9, 5, 1], [2, 7, 6]],
        [[8, 3, 4], [1, 5, 9], [6, 7, 2]]
    ]
    
    minCost = sys.maxsize
    
    for square in magic_squares:
        cost = getCost(square, s)
        minCost = min(minCost, cost)
    
    return minCost
```
{% endraw %}



> 시간복잡도: O(1)


> 공간복잡도: O(1)

