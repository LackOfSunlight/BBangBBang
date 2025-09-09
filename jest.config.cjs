// jest.config.js
/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/game.server/src'], // 테스트 파일 root 경로
  moduleNameMapper: { // 모듈 이름 매핑
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: { // TS파일을 변환해주는 역할
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'], // 테스트 파일의 확장자를 설정
};