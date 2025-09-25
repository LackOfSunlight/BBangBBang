# 빵빵(BBangBBang) 게임 서버

이 프로젝트는 Node.js와 TypeScript로 구축된 실시간 멀티플레이어 카드 게임 서버입니다.

## ✨ 주요 기능

- TCP 소켓을 이용한 실시간 멀티플레이어 게임 플레이
- 방 생성, 참여, 목록 조회를 포함한 룸 기반 로비 시스템
- 다양한 효과를 가진 카드 기반의 게임 로직
- Protocol Buffers를 활용한 효율적인 패킷 기반 통신
- Prisma를 이용한 데이터베이스 관리

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
