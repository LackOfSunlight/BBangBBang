# 빵빵(BBangBBang) 게임 서버
<div>
    <img src="https://img.notionusercontent.com/s3/prod-files-secure%2F83c75a39-3aba-4ba4-a792-7aefe4b07895%2F78736263-bc80-4ea6-a07e-fa79baf1b334%2F%EB%B8%8C%EB%A1%9C%EC%85%94_%EC%BB%A4%EB%B2%84.png/size/w=2000?exp=1759391787&sig=HPP2qn9zx6t8vFcP9jz6EpNSzpEJrmpeKJo1O9WhmcM&id=2722dc3e-f514-8027-a43c-f89fc2316c7f&table=block&userId=c4aa14a7-9c9f-42d3-a550-c64ab823db2b"/>
</div>

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

- TCP 소켓을 이용한 실시간 멀티플레이어 게임 플레이
- 방 생성, 참여, 목록 조회를 포함한 룸 기반 로비 시스템
- 다양한 효과를 가진 카드 기반의 게임 로직
- Protocol Buffers를 활용한 효율적인 패킷 기반 통신
- Prisma를 이용한 데이터베이스 관리

좋습니다 👍
제가 첨부된 프로젝트 문서들을 참고해서 README 속 **🕹️ 게임 소개** 부분을 끝까지 채워드릴게요. 현재 문장은 **승리 조건은 다음과 같습니다.**에서 끊겨 있었죠.

---

## 🕹️ 게임 소개

**BBangBBang**은 각기 다른 **역할(Role)**과 **캐릭터(Character)**를 부여받은 플레이어들이, 제한된 카드와 전략적 선택을 통해 최후의 승자를 가리는 **멀티플레이 카드 액션 게임**입니다.

게임은 방(Room)을 생성하거나 참가한 플레이어들이 준비를 마치면 시작됩니다. 시작 시, 인원 수에 따라 다음과 같은 **역할(Role)**이 자동 배정됩니다:

* **타겟(Target)** : 히트맨의 공격 대상이 되는 핵심 인물
* **보디가드(Bodyguard)** : 타겟을 보호하는 역할
* **히트맨(Hitman)** : 타겟을 제거하는 암살자
* **싸이코패스(Psychopath)** : 자신을 제외한 모든 플레이어를 제거해야 하는 혼돈의 존재

### 🎯 승리 조건

* **타겟 & 보디가드**: 히트맨과 싸이코패스가 모두 사망 시 승리
* **히트맨**: 타겟을 제거하면 승리
* **싸이코패스**: 자신을 제외한 모든 플레이어가 제거되면 승리

### 🎴 카드 시스템

게임의 핵심은 **23종의 카드**입니다. 카드에는 공격, 방어, 회복, 장비, 디버프 등 다양한 효과가 있으며, 대표적인 예시는 다음과 같습니다:

* **빵야!(BBANG)**: 가장 기본이 되는 공격 카드
* **쉴드(Shield)**: 공격을 방어
* **현피(Death Match)**: 1:1 대결 모드 강제 돌입 
* **흡수(Absorb)**: 상대의 카드를 강제로 가져오기 
* **폭탄 돌리기(Bomb)**: 일정 시간 후 폭발하는 디버프 설치 

카드 덱은 시작 시 셔플되며, **매 페이즈마다 플레이어들은 새로운 카드를 지급**받습니다. 사용된 카드는 다시 덱 뒤로 돌아가므로, **장기적인 카드 운영 전략**도 중요합니다.

### ⏳ 게임 진행

게임은 **페이즈(Phase)** 단위 진행됩니다:

1. **DAY (3분)**: 이동 및 카드 사용, 전투가 벌어지는 메인 시간
2. **EVENING (30초)**: 체력보다 많은 카드를 버려야 하는 정리 단계
3. **END**: 하루 종료, 승리 조건 체크

### 🧍 캐릭터와 스폰

플레이어들은 고유한 능력이 있는 **캐릭터(예: 빨강이, 상어군, 말랑이, 핑크군 등)**를 랜덤 부여받으며, 시작 시 맵 내 **스폰 포인트**(총 20곳) 중 하나에서 등장합니다.


## 📢 게임 방법

### 🟢 게임 시작
- 게임이 시작되면 각 플레이어는 **고유한 역할(Role)**과 **캐릭터(Character)**를 무작위로 부여받고, **맵 내 지정된 스폰 포인트**(총 20곳) 중 하나에서 생성됩니다.
- 플레이어는 화면 좌측 하단의 **조이스틱 UI**를 사용하여 자유롭게 이동할 수 있으며, **위치 정보는 서버와 실시간 동기화**됩니다.
- 시작과 동시에 **체력만큼 초기 카드**가 지급됩니다.

<!-- 이미지: 역할·캐릭터 부여 및 스폰 장면 -->

---

### 🟡 카드 사용
- 상단의 **덱 버튼**을 통해 현재 보유한 카드를 확인하고 사용할 수 있습니다.
- 카드는 **공격 · 방어 · 회복 · 무기 · 장비 · 디버프** 등 다양한 종류가 있으며, 상황에 맞게 전략적으로 사용해야 합니다.
- 사용된 카드는 다시 **덱의 뒤로 돌아가 재사용**되므로, 장기적인 카드 운영도 중요합니다.
- 매 낮이 시작될 때마다 **카드 2장이 자동 지급**됩니다.

<!-- 이미지: 카드 선택 및 사용 UI -->

---

### 🔴 전투 및 대응
- 다른 플레이어로부터 공격을 받으면, **방어 카드(예: 쉴드)**를 사용할지, **피해를 받을지**를 즉시 선택할 수 있는 팝업이 나타납니다.
- 특정 카드(예: 현피, 흡수, 신기루, 게릴라)는 **대상 지정 후 즉시 발동**되며, 반응 기회를 주지 않습니다.
- **무기/장비 카드**는 전투 판도에 큰 영향을 미칩니다.  
  - 예: `데저트이글` → 데미지 2배 / `자동쉴드` → 25% 확률 자동방어

<!-- 이미지: 전투 대응 팝업 -->

---

### 🔄 정보 업데이트
- 카드 사용, 체력 변화, 상태 이상 등 유저의 게임 상태가 변할 때마다 서버는 모든 클라이언트에게 실시간 **S2CUserUpdateNotification** 패킷을 통해 동기화합니다.
- 위치, 체력, 장비, 디버프 등 모든 상태는 항상 최신 상태로 유지됩니다.

<!-- 이미지: 정보 업데이트 장면 -->

---

### 🏁 게임 종료
- 특정 역할의 **승리 조건**이 충족되면 게임이 자동 종료되며, 서버는 **S2CGameEndNotification**을 발송하고 승리자를 발표합니다.
- 예시:
  - 🎯 타겟 & 보디가드 → 히트맨 + 싸이코패스 제거 시
  - 🔫 히트맨 → 타겟 제거 시
  - ☠️ 싸이코패스 → 자신을 제외한 모든 유저 제거 시
- 종료 후 결과 화면에서 승리 역할과 플레이어가 표시됩니다.

<!-- 이미지: 승리자 발표 화면 -->


## 📂 프로젝트 구조

```
BBangBBang/
├── game.server/
│   ├── src/
│   │   ├── card/         # 각 카드의 고유 효과 로직 구현
│   │   ├── data/         # 게임 데이터 (카드 정보, 스폰 위치 등)
│   │   ├── dispatcher/   # 수신된 패킷을 핸들러로 분배
│   │   ├── enums/        # 게임에서 사용되는 열거형 타입
│   │   ├── factory/      # 응답 패킷 생성을 중앙화
│   │   ├── generated/    # .proto 파일로부터 자동 생성된 TypeScript 코드
│   │   ├── handlers/     # 클라이언트로부터 받은 패킷을 직접 처리
│   │   ├── managers/     # 게임의 주요 상태 관리 (카드 덱, 게임 흐름 등)
│   │   ├── models/       # 게임 엔티티(User, Room 등)의 데이터 모델
│   │   ├── proto/        # Protocol Buffers 정의 파일
│   │   ├── services/     # 보조 비즈니스 로직 (데미지 계산 등)
│   │   ├── sockets/      # 소켓 연결 및 데이터 수신/종료/에러 처리
│   │   ├── useCase/      # 각 요청에 대한 핵심 비즈니스 로직
│   │   └── utils/        # 공통 유틸리티 함수
│   └── app.ts            # 서버 시작점
├── prisma/
│   └── schema.prisma     # 데이터베이스 스키마 정의
├── scripts/              # 빌드 관련 보조 스크립트
├── jest.config.cjs       # Jest 테스트 설정
├── package.json          # 프로젝트 의존성 및 스크립트
└── tsconfig.json         # TypeScript 컴파일러 설정
```

## 🌊 아키텍처 및 데이터 흐름

1.  **소켓 연결**: 클라이언트가 서버에 TCP 소켓으로 연결합니다 (`sockets/on.connection.ts`).
2.  **패킷 수신 및 디코딩**: 서버는 클라이언트로부터 원시 데이터 버퍼를 수신하고(`sockets/on.data.ts`), 이를 Protocol Buffers를 통해 `GamePacket` 객체로 디코딩합니다.
3.  **패킷 분배**: `GamePacketDispatcher` (`dispatcher/game.packet.dispatcher.ts`)는 패킷의 종류(`GamePacketType`)를 확인하고, 사전에 정의된 맵을 통해 적절한 핸들러로 패킷을 전달합니다.
4.  **요청 처리**:
    - **Handler**: 각 `handlers/*.handler.ts` 파일은 담당 패킷을 받아 `UseCase`를 호출합니다.
    - **UseCase**: `useCase/**/*.usecase.ts` 파일은 요청에 대한 핵심 비즈니스 로직을 수행합니다. 이 과정에서 `Managers`를 통해 게임 상태를 변경하거나 `Models`의 데이터를 조작합니다.
    - **Factory**: `UseCase` 또는 `Handler`는 `factory/packet.pactory.ts`를 사용하여 클라이언트에게 보낼 응답 패킷을 생성합니다.
5.  **응답 및 알림**:
    - 생성된 응답 패킷은 요청을 보낸 클라이언트에게 전송됩니다 (`utils/send.data.ts`).
    - 게임 상태 변경 등, 방 안의 모든 플레이어에게 알려야 할 정보는 `utils/notification.util.ts`을 통해 브로드캐스트됩니다.

## ⚙️ 주요 컴포넌트

- **Packet Dispatcher**: `Map` 자료구조를 사용하여 패킷 타입과 핸들러 함수를 1:1로 매핑하여, 새로운 패킷 종류가 추가되어도 쉽게 확장할 수 있는 구조입니다.
- **Card Effect System**: 각 카드의 효과는 `src/card/` 디렉토리 아래에 개별 파일로 모듈화되어 있으며, `applyCardEffect` 유틸리티 함수를 통해 동적으로 적용됩니다.
- **Game Manager**: 게임의 전체적인 흐름(페이즈, 타이머 등)을 관리합니다. 싱글톤 패턴으로 구현되어 프로젝트 전역에서 단일 인스턴스로 접근합니다.
- **Card Manager**: 게임에 사용되는 덱과 카드를 관리합니다. 마찬가지로 싱글톤 패턴으로 구현되어 있습니다.
- **State Management**: 룸, 유저, 덱과 같은 주요 게임 상태는 `managers`와 `utils/room.utils.ts` 내의 `Map` 객체를 통해 메모리에 저장 및 관리됩니다.

## 🚀 실행 및 테스트 방법

### 의존성 설치

```bash
npm install
```

### 프로토콜 버퍼 코드 생성

`.proto` 파일 수정 후에는 아래 명령어를 실행하여 TypeScript 코드를 다시 생성해야 합니다.

```bash
npm run protoc
```

### 개발 서버 실행

`tsx`를 사용하여 TypeScript 파일을 직접 실행하며, 파일 변경 시 자동으로 재시작됩니다.

```bash
npm run dev
```

### 프로덕션 빌드 및 실행

1.  **빌드**: TypeScript 코드를 JavaScript로 컴파일하고, 필요한 에셋을 `dist` 폴더로 복사합니다.
    ```bash
    npm run build
    ```
2.  **서버 시작**: 빌드된 JavaScript 파일을 실행합니다.
    ```bash
    npm start
    ```

### 테스트 실행

Jest를 사용하여 유닛 및 통합 테스트를 실행합니다.

```bash
npm test
```