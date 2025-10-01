# 빵빵(BBangBBang) 게임 서버

<p align="center">
  <img src="https://img.notionusercontent.com/s3/prod-files-secure%2F83c75a39-3aba-4ba4-a792-7aefe4b07895%2F78736263-bc80-4ea6-a07e-fa79baf1b334%2F%EB%B8%8C%EB%A1%9C%EC%85%94_%EC%BB%A4%EB%B2%84.png/size/w=2000?exp=1759391787&sig=HPP2qn9zx6t8vFcP9jz6EpNSzpEJrmpeKJo1O9WhmcM&id=2722dc3e-f514-8027-a43c-f89fc2316c7f&table=block&userId=c4aa14a7-9c9f-42d3-a550-c64ab823db2b" alt="BBangBBang cover" />
</p>

<table align="center"><tr><td>
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white" alt="Node.js" />&nbsp;
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />&nbsp;
  <img src="https://img.shields.io/badge/Protobuf-4285F4?style=flat&logo=google&logoColor=white" alt="Protobuf" />&nbsp;
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white" alt="Prisma" />&nbsp;
  <img src="https://img.shields.io/badge/TCP_Socket-Real--time-success?style=flat" alt="TCP Socket" />&nbsp;
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=flat" alt="Status" />
</td></tr></table>

이 프로젝트는 Node.js와 TypeScript로 구축된 실시간 멀티플레이어 카드 게임 서버입니다.

## 📜 주요 기능

<table>
<tr>
<td width="25%" valign="top">

**🎯 실시간 멀티플레이어**

* TCP 소켓 기반 실시간 통신
* 방 생성/참여/목록 조회
* 저지연 위치 동기화(주기 브로드캐스트)

</td>
<td width="25%" valign="top">

**🃏 전략적 카드 게임**

* **23종**의 카드 효과
* 역할 기반 승리 조건
* 페이즈 시스템(DAY/EVENING/END)

</td>
<td width="25%" valign="top">

**⚡ 고성능 아키텍처**

* Protocol Buffers 통신
* 메모리 기반 상태 관리
* 싱글톤 매니저 패턴

</td>
<td width="25%" valign="top">

**🔧 안정적인 구조**

* Prisma ORM + **MySQL**
* TypeScript Strict Mode
* Jest 테스트 환경

</td>
</tr>
</table>

<br/>

## 🕹️ 게임 소개

**BBangBBang**은 각기 다른 **역할(Role)**과 **캐릭터(Character)**를 부여받은 플레이어들이, 제한된 카드와 전략적 선택을 통해 최후의 승자를 가리는 **멀티플레이 카드 액션 게임**입니다.

### 👥 역할 시스템

게임은 방(Room)을 생성하거나 참가한 플레이어들이 준비를 마치면 시작됩니다. 시작 시, 인원 수에 따라 다음과 같은 **역할(Role)**이 자동 배정됩니다.

* **타겟(Target)**: 히트맨의 공격 대상
* **보디가드(Bodyguard)**: 타겟을 보호
* **히트맨(Hitman)**: 타겟을 제거하는 암살자
* **싸이코패스(Psychopath)**: 자신을 제외한 모든 플레이어 제거

### 🎯 승리 조건

* **타겟 & 보디가드**: 히트맨과 싸이코패스가 모두 사망 시 승리
* **히트맨**: 타겟 제거 시 승리
* **싸이코패스**: 자신을 제외한 모든 플레이어 제거 시 승리

### 🎴 카드 시스템

게임의 핵심은 **23종의 카드**입니다. 카드에는 공격, 방어, 회복, 무기, 장비, 디버프 등 다양한 효과가 있으며, 대표적인 예시는 다음과 같습니다.

* **빵야!(BBANG)**: 기본 공격 카드
* **쉴드(Shield)**: 공격 방어
* **현피(Death Match)**: 1:1 대결 모드 강제
* **흡수(Absorb)**: 상대의 카드를 강제로 가져오기
* **폭탄 돌리기(Bomb)**: 일정 시간 후 폭발하는 디버프

덱은 시작 시 셔플되며, **매 ‘낮(DAY)’ 시작 시 카드 2장**이 지급됩니다. 사용된 카드는 **덱 뒤로 되돌아가 재사용**되므로 **장기 운영 전략**이 중요합니다.

### ⏳ 게임 진행

게임은 **페이즈(Phase)** 단위로 진행됩니다.

1. **DAY (3분)**: 이동 및 카드 사용, 전투가 벌어지는 메인 시간
2. **EVENING (30초)**: 체력보다 많은 카드를 버리는 정리 단계
3. **END**: 하루 종료 및 승리 조건 체크

### 🧍 캐릭터와 스폰

플레이어는 **캐릭터(예: 빨강이, 상어군, 말랑이, 핑크군 등)**를 무작위로 부여받고, 시작 시 맵 내 **스폰 포인트(총 20곳)** 중 하나에서 등장합니다.

## 📢 게임 방법

### 🟢 게임 시작

<img src="https://img.notionusercontent.com/s3/prod-files-secure%2F83c75a39-3aba-4ba4-a792-7aefe4b07895%2F2881c8d1-9239-4846-a592-c2f8fda06a35%2Fimage.png/size/w=1230?exp=1759393032&sig=CkFvTL4A-P6uNSCiPfR-e9-3TUQ1CWB1gykk5jLkHwE&id=27b2dc3e-f514-805e-bb8b-c8e7814c452b&table=block&userId=c4aa14a7-9c9f-42d3-a550-c64ab823db2b" width="700" alt="게임 시작 1"/>
<img src="https://img.notionusercontent.com/s3/prod-files-secure%2F83c75a39-3aba-4ba4-a792-7aefe4b07895%2F84d73975-4b9c-4a09-a0ea-53372f15b93a%2Fimage.png/size/w=1230?exp=1759393168&sig=iCuA9izfn9nUahE28sNuJbXLcDbhxwvIYS6-_2-D180&id=27b2dc3e-f514-805b-a45d-e6f637bb0621&table=block&userId=c4aa14a7-9c9f-42d3-a550-c64ab823db2b" width="700" alt="게임 시작 2"/>

* 게임 시작 시 각 플레이어는 **역할(Role)**과 **캐릭터(Character)**를 무작위로 부여받고, **스폰 포인트**에서 생성됩니다.
* 좌하단 **조이스틱 UI**로 이동하며, **위치는 서버와 실시간 동기화**됩니다.
* 시작과 동시에 **체력만큼 초기 카드**가 지급됩니다.

---

### 🟡 카드 사용

<img src="https://img.notionusercontent.com/s3/prod-files-secure%2F83c75a39-3aba-4ba4-a792-7aefe4b07895%2F2ed54d3e-9a63-4fc0-8064-495659392bf9%2Fimage.png/size/w=1230?exp=1759393204&sig=uFs5YF5WtYxJi00Iq3jD3P61uxQ5fkI6aeYx7ze_FIk&id=27b2dc3e-f514-80cc-870d-c6c60fc1414f&table=block&userId=c4aa14a7-9c9f-42d3-a550-c64ab823db2b" width="700" alt="카드 사용 UI"/>

* 상단 **덱 버튼**으로 보유 카드를 확인·사용합니다.
* 카드는 **공격 · 방어 · 회복 · 무기 · 장비 · 디버프**로 구분되며, 상황에 맞는 전략이 필요합니다.
* 사용된 카드는 **덱 뒤로** 돌아가 **재사용**됩니다.
* **낮(DAY) 시작마다 카드 2장**이 자동 지급됩니다.

---

### 🔴 전투 및 대응

<img src="https://img.notionusercontent.com/s3/prod-files-secure%2F83c75a39-3aba-4ba4-a792-7aefe4b07895%2F5727f1e5-08c9-494b-8068-0f9359bc8942%2Fimage.png/size/w=1230?exp=1759393240&sig=VCrulXy9AE2tSVlF4mzalRCa2v2MQtUkOSeLA6o1fzE&id=27b2dc3e-f514-80b9-9af1-f951285ba2c3&table=block&userId=c4aa14a7-9c9f-42d3-a550-c64ab823db2b" width="700" alt="전투 대응"/>

* 공격을 받으면 **방어 카드(예: 쉴드)**를 사용할지 또는 **피해 수락**을 선택합니다.
* 카드별 대응 방식이 다릅니다.

  * 예: **빵야!** ↔ **쉴드**로 방어, **게릴라**는 **빵야!**로 대응 가능, **현피/흡수/신기루**는 대상 지정 후 효과 적용.
* **무기/장비 카드**는 전투 판도에 큰 영향을 줍니다.

  * `데저트이글` → 데미지 2배 / `자동 쉴드` → 25% 확률 자동 방어

---

### 🔄 정보 업데이트

<img src="https://file.notion.so/f/f/83c75a39-3aba-4ba4-a792-7aefe4b07895/7a653909-b592-43b3-8492-a9f1661b6d47/%ED%94%BC%EA%B2%A9.gif?table=block&id=27d2dc3e-f514-806b-ad6a-c0a0a2642c4e&spaceId=83c75a39-3aba-4ba4-a792-7aefe4b07895&expirationTimestamp=1759334400000&signature=aOiT6dD4_07OpXzdHYMZ-b695FQkMgM-q29UsJw6O-I" width="700" alt="정보 업데이트"/>

* 카드 사용·체력 변화·상태 이상 등 변경 시 서버가 **S2CUserUpdateNotification**으로 모든 클라이언트를 **실시간 동기화**합니다.
* 위치, 체력, 장비, 디버프 등 모든 상태가 항상 최신으로 유지됩니다.

---

### 🏁 게임 종료

<img src="https://img.notionusercontent.com/s3/prod-files-secure%2F83c75a39-3aba-4ba4-a792-7aefe4b07895%2Ff0cbeb8f-beb3-4fc8-8e8e-680bbe5af8ef%2Fimage.png/size/w=1230?exp=1759393304&sig=w6pmknNYDJk_VYdLZT0lNCK_tFN9uUmvVamVXByDJF4&id=27b2dc3e-f514-80b1-8f63-e8c7745af600&table=block&userId=c4aa14a7-9c9f-42d3-a550-c64ab823db2b" width="700" alt="게임 종료"/>

* 특정 역할의 **승리 조건**이 충족되면 게임이 자동 종료되며, 서버는 **S2CGameEndNotification**을 발송하고 승리자를 발표합니다.
* 예시

  * 🎯 타겟 & 보디가드 → 히트맨 + 싸이코패스 제거 시
  * 🔫 히트맨 → 타겟 제거 시
  * ☠️ 싸이코패스 → 자신을 제외한 모든 유저 제거 시
* 종료 후 결과 화면에서 승리 역할과 플레이어가 표시됩니다.

## 📂 프로젝트 구조

```
BBangBBang/
├── game.server/
│   ├── src/
│   │   ├── card/         # 각 카드의 고유 효과 로직
│   │   ├── data/         # 게임 데이터(카드/스폰 등)
│   │   ├── dispatcher/   # 패킷 → 핸들러 분배
│   │   ├── enums/        # 열거형 타입
│   │   ├── factory/      # 응답 패킷 생성
│   │   ├── generated/    # .proto → TS 생성물
│   │   ├── handlers/     # 클라 요청 처리
│   │   ├── managers/     # 게임 상태 관리
│   │   ├── models/       # 엔티티(User, Room 등)
│   │   ├── proto/        # Protocol Buffers 정의
│   │   ├── services/     # 보조 비즈니스 로직
│   │   ├── sockets/      # 소켓 연결/수신/에러 처리
│   │   ├── useCase/      # 핵심 비즈니스 로직
│   │   └── utils/        # 공통 유틸 함수
│   └── app.ts            # 서버 엔트리포인트
├── prisma/
│   └── schema.prisma     # DB 스키마 정의
├── scripts/              # 빌드 보조 스크립트
├── jest.config.cjs       # Jest 설정
├── package.json          # 의존성/스크립트
└── tsconfig.json         # TypeScript 설정
```

## 🌊 아키텍처 및 데이터 흐름

<img src="https://img.notionusercontent.com/s3/prod-files-secure%2F83c75a39-3aba-4ba4-a792-7aefe4b07895%2F26d5a5c0-f9dd-404f-b021-d2e3c632f980%2FFlow_Chart.png/size/w=2000?exp=1759394323&sig=Gld4ALMe4PQmpNdCKwnYIXy9Y53S29PyTuKtMeZ6ZJw&id=2792dc3e-f514-8082-9686-fc092d168c31&table=block&userId=c4aa14a7-9c9f-42d3-a550-c64ab823db2b">


1. **소켓 연결**: 클라이언트가 TCP 소켓으로 연결합니다(`sockets/on.connection.ts`).
2. **패킷 수신·디코딩**: 원시 버퍼 수신 → Protocol Buffers로 `GamePacket` 디코딩(`sockets/on.data.ts`).
3. **패킷 분배**: `GamePacketDispatcher`가 타입(`GamePacketType`)을 확인해 핸들러로 라우팅(`dispatcher/game.packet.dispatcher.ts`).
4. **요청 처리**

   * **Handler**: `handlers/*.handler.ts`가 요청을 받아 `UseCase` 호출
   * **UseCase**: `useCase/**/*.usecase.ts`에서 핵심 로직 수행(Managers/Models 조작)
   * **Factory**: `factory/packet.factory.ts`로 응답 패킷 생성
5. **응답·알림**

   * 응답은 요청자에게 전송(`utils/send.data.ts`)
   * 방 전체 공지는 브로드캐스트(`utils/notification.util.ts`)

## ⚙️ 주요 컴포넌트

* **Packet Dispatcher**: `Map`으로 패킷 타입 ↔ 핸들러 1:1 매핑, 신규 패킷 확장 용이
* **Card Effect System**: `src/card/`에 카드별 모듈, `applyCardEffect`로 동적 적용
* **Game Manager**: 페이즈/타이머 등 전체 흐름 관리(싱글톤)
* **Card Manager**: 덱/드로우/셔플 관리(싱글톤)
* **State Management**: 룸/유저/덱 상태를 메모리(Map)로 관리

## 🚀 실행 및 테스트 방법

### 의존성 설치

```bash
npm install
```

### 프로토콜 버퍼 코드 생성

`.proto` 변경 후 TS 생성물을 갱신합니다.

```bash
npm run protoc
```

### 개발 서버 실행

`tsx`로 TS를 직접 실행하며 변경 시 자동 재시작됩니다.

```bash
npm run dev
```

### 프로덕션 빌드 및 실행

```bash
npm run build   # TS → JS 컴파일
npm start       # 빌드 산출물 실행
```

### 테스트 실행

```bash
npm test
```

