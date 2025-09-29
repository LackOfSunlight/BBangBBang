import { prisma } from '../Utils/db.js';

/**
 * 서버 시작 시 모든 토큰을 정리하는 서비스
 * 서버가 갑자기 종료되었을 때 남아있는 토큰들을 정리합니다.
 */
export const cleanupAllTokens = async (): Promise<void> => {
	try {
		const result = await prisma.user.updateMany({
			where: {
				token: { not: null },
			},
			data: {
				token: null,
			},
		});

		console.log(`토큰 정리 완료: ${result.count}개의 토큰이 정리되었습니다.`);
	} catch (error) {
		console.error('토큰 정리 중 오류 발생:', error);
		throw error;
	}
};

/**
 * 특정 사용자의 토큰을 정리하는 서비스
 */
export const cleanupUserToken = async (userId: number): Promise<void> => {
	try {
		await prisma.user.update({
			where: { id: userId },
			data: { token: null },
		});
		console.log(`사용자 ${userId}의 토큰이 정리되었습니다.`);
	} catch (error) {
		console.error(`사용자 ${userId} 토큰 정리 중 오류 발생:`, error);
		throw error;
	}
};
