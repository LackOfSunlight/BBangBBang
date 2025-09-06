# Node.js 20 LTS 버전의 Alpine 리눅스 이미지를 기반으로 합니다.
# Alpine은 경량 리눅스 배포판으로 이미지 크기를 줄이는 데 도움이 됩니다.
FROM node:22-alpine

# 컨테이너 내부의 작업 디렉토리를 설정합니다.
WORKDIR /usr/src/app

# package.json과 package-lock.json을 복사하여 종속성 설치 레이어를 캐시합니다.
# 이렇게 하면 소스 코드가 변경되어도 종속성이 변경되지 않으면 npm install을 다시 실행하지 않습니다.
COPY package*.json ./

# 프로젝트 종속성을 설치합니다.
# npm ci는 package-lock.json에 따라 정확한 버전의 종속성을 설치하여 빌드의 일관성을 보장합니다.
RUN npm ci

# wait-for-it.sh 스크립트를 컨테이너에 복사합니다.
COPY wait-for-it.sh /usr/wait-for-it.sh 

RUN chmod +x /usr/wait-for-it.sh 

# 현재 디렉토리의 모든 파일을 컨테이너의 작업 디렉토리로 복사합니다.
COPY . .

# TypeScript 소스 코드를 JavaScript로 빌드합니다.
# package.json의 "build" 스크립트를 사용합니다.
RUN npm run build

# 애플리케이션이 8080 포트에서 수신 대기함을 Docker에 알립니다.
# 이는 문서화 목적이며, 실제로 포트를 게시하지는 않습니다.
EXPOSE 8080

# 컨테이너가 시작될 때 실행될 명령을 정의합니다.
# package.json의 "start" 스크립트를 사용합니다.
CMD ["node", "game.server/dist/app.js"]
