# lottery-smart-contract
ethereum smart contract based solidity

# 프로젝트명
> 간략한 프로젝트 소개 문구를 작성합니다.

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads Stats][npm-downloads]][npm-url]

한 두 문단으로 프로젝트 소개 글을 작성합니다.

![](../header.png)

## 설치 방법

OS X & 리눅스:

```sh
npm install my-crazy-module --save
```


윈도우:

```sh
edit autoexec.bat
```

## 사용 예제

스크린 샷과 코드 예제를 통해 사용 방법을 자세히 설명합니다.

_더 많은 예제와 사용법은 [Wiki][wiki]를 참고하세요._

## 개발 환경 설정

모든 개발 의존성 설치 방법과 자동 테스트 슈트 실행 방법을 운영체제 별로 작성합니다.

## Prerequisites
* ganache-cli
* truffle

## Setup & Test
Ganache-cli command
```
$ ganache-cli -d -m tutorial
```

Truffle command
```
$ truffle migrate --reset
$ truffle console
```

In terminal 1
```
$ ganache-cli
```

In project directory, terminal 2
```
$ npm install
$ truffle test
```


## 업데이트 내역

* 0.2.1
    * 수정: 문서 업데이트 (모듈 코드 동일)
* 0.2.0
    * 수정: `setDefaultXYZ()` 메서드 제거
    * 추가: `init()` 메서드 추가
* 0.1.1
    * 버그 수정: `baz()` 메서드 호출 시 부팅되지 않는 현상 (@컨트리뷰터 감사합니다!)
* 0.1.0
    * 첫 출시
    * 수정: `foo()` 메서드 네이밍을 `bar()`로 수정
* 0.0.1
    * 작업 진행 중
