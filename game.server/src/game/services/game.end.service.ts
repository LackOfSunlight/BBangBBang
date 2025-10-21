import { Room } from '@game/models/room.model';
import { RoleType, WinType, RoomStateType } from '@core/generated/common/enums';
import { broadcastDataToRoom } from '@core/network/sockets/notification';
import { GamePacketType } from '@game/enums/gamePacketType';
import gameManager from '@game/managers/game.manager';
import { gameEndNotificationForm } from '@common/converters/packet.form';
import roomManger from '@game/managers/room.manager';

/**
 * 게임 종료 조건을 검사하고 필요시 게임을 종료하는 함수
 */
export async function checkAndEndGameIfNeeded(roomId: number): Promise<void> {
	try {
		const room = roomManger.getRoom(roomId);
		if (!room) {
			console.warn(`[GameEnd] 방을 찾을 수 없습니다: roomId=${roomId}`);
			return;
		}

		// 이미 게임이 종료된 상태면 리턴
		if (room.state !== RoomStateType.INGAME) {
			return;
		}

		// 게임 종료 조건 검사
		const gameResult = evaluateGameEndConditions(room);
		if (gameResult) {
			console.log(
				`[GameEnd] 게임 종료 조건 만족: ${gameResult.winType}, 승리자: ${gameResult.winners.join(', ')}`,
			);
			await endGame(room, gameResult);
		}
	} catch (error) {
		console.error(`[GameEnd] 게임 종료 조건 검사 중 오류 발생:`, error);
	}
}

/**
 * 게임 종료 조건을 평가하는 함수
 */
function evaluateGameEndConditions(room: Room): GameEndResult | null {
	const totalUsers = room.users.length;
	const aliveUsers = room.users.filter((user) => user.character && user.character.hp > 0);
	const aliveCount = aliveUsers.length;

	// 1. 3명 이상이면 승리 불가능
	if (aliveCount >= 3) {
		return null;
	}

	// 2. 역할별로 그룹화 (모든 인원에서 공통)
	const usersByRole = new Map<RoleType, typeof aliveUsers>();
	aliveUsers.forEach((user) => {
		if (user.character) {
			const role = user.character.roleType;
			if (!usersByRole.has(role)) {
				usersByRole.set(role, []);
			}
			usersByRole.get(role)!.push(user);
		}
	});

	// 3. 각 역할별 생존자 수 체크
	const hitmanAlive = usersByRole.get(RoleType.HITMAN)?.length || 0;
	const psychopathAlive = usersByRole.get(RoleType.PSYCHOPATH)?.length || 0;
	const targetAlive = usersByRole.get(RoleType.TARGET)?.length || 0;
	const bodyguardAlive = usersByRole.get(RoleType.BODYGUARD)?.length || 0;

	// 4. 인원별 최적화된 조기 리턴 조건들
	// 4-1. 2인 게임 특별 처리 (타겟1, 히트맨1)
	if (totalUsers === 2) {
		if (targetAlive === 0 && hitmanAlive > 0) {
			// 히트맨 승리
			const hitman = aliveUsers.filter((user) => user.character?.roleType === RoleType.HITMAN);
			return {
				winners: hitman.map((user) => user.id),
				winType: WinType.HITMAN_WIN,
			};
		}
		if (hitmanAlive === 0 && targetAlive > 0) {
			// 타겟 승리
			const target = aliveUsers.filter((user) => user.character?.roleType === RoleType.TARGET);
			return {
				winners: target.map((user) => user.id),
				winType: WinType.TARGET_AND_BODYGUARD_WIN,
			};
		}
		// 그 외의 경우는 게임 계속 진행
		return null;
	}

	// 5. 인원별 승리 조건 검사
	// 5-1. 히트맨 승리 조건: 타겟이 사망
	if (targetAlive === 0 && hitmanAlive > 0) {
		const hitman = aliveUsers.filter((user) => user.character?.roleType === RoleType.HITMAN);
		return {
			winners: hitman.map((user) => user.id),
			winType: WinType.HITMAN_WIN,
		};
	}

	// 5-2. 싸이코패스 승리 조건: 자신을 제외한 모든 플레이어가 사망 (1명만 생존)
	if (aliveCount === 1 && psychopathAlive === 1) {
		const psychopath = aliveUsers.filter(
			(user) => user.character?.roleType === RoleType.PSYCHOPATH,
		);
		return {
			winners: psychopath.map((user) => user.id),
			winType: WinType.PSYCHOPATH_WIN,
		};
	}

	// 5-3. 타겟/보디가드 승리 조건: 히트맨과 싸이코패스가 모두 사망
	if (hitmanAlive === 0 && psychopathAlive === 0) {
		const targetAndBodyguard = aliveUsers.filter(
			(user) =>
				user.character?.roleType === RoleType.TARGET ||
				user.character?.roleType === RoleType.BODYGUARD,
		);

		if (targetAndBodyguard.length > 0) {
			return {
				winners: targetAndBodyguard.map((user) => user.id),
				winType: WinType.TARGET_AND_BODYGUARD_WIN,
			};
		}
	}

	// 6. 그 외의 경우는 게임 계속 진행
	return null;
}

/**
 * 게임을 종료하는 함수
 */
async function endGame(room: Room, gameResult: GameEndResult): Promise<void> {
	try {
		// 방 상태를 종료로 변경
		room.state = RoomStateType.WAIT; // 게임 종료 후 대기 상태로 변경
		// saveRoom(room);

		// 게임 종료 알림 패킷 생성
		const gameEndPacket = gameEndNotificationForm(gameResult.winners, gameResult.winType);

		// 모든 플레이어에게 게임 종료 알림 전송
		await broadcastDataToRoom(room.users, gameEndPacket, GamePacketType.gameEndNotification);

		gameManager.endGame(room);

		gameManager.endGame(room);

		console.log(`[GameEnd] 게임 종료 완료: ${room.id}번 방`);
	} catch (error) {
		console.error(`[GameEnd] 게임 종료 처리 중 오류 발생:`, error);
	}
}

/**
 * 게임 종료 결과 인터페이스
 */
interface GameEndResult {
	winners: string[];
	winType: WinType;
}
