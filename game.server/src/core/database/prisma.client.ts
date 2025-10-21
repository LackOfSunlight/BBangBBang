import { PrismaClient } from '@core/generated/prisma/index';

// 공용 Prisma 인스턴스 재노출: 중복 생성을 피하기 위해 싱글톤으로 사용
export const prisma = new PrismaClient();

export default prisma;


