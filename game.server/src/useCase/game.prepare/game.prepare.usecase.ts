import { GameSocket } from '../../type/game.socket.js';
import {
	C2SGamePrepareRequest,
	S2CGamePrepareResponse,
} from '../../generated/packet/game_actions.js';
import { GamePacket } from '../../generated/gamePacket.js';
import {
	CharacterStateType,
	CharacterType,
	GlobalFailCode,
	RoleType,
	RoomStateType,
} from '../../generated/common/enums.js';

import { Room } from '../../models/room.model.js';
import { CharacterData } from '../../generated/common/types.js';
import characterType from '../../data/characterType.json';
import { CharacterInfo } from '../../type/character.info.js';
import { GamePacketType } from '../../enums/gamePacketType.js';
import { broadcastDataToRoom } from '../../utils/notification.util.js';
import { S2CGamePrepareNotification } from '../../generated/packet/notifications.js';
import { getRoom, saveRoom } from '../../utils/room.utils.js';

// 응답 패킷 생성 헬퍼
const createGamePrepareResponsePacket = (payload: S2CGamePrepareResponse): GamePacket => {
	return {
		payload: {
			oneofKind: 'gamePrepareResponse',
			gamePrepareResponse: payload,
		},
	};
};

// 알림 패킷 생성 헬퍼
const createGamePrepareNotificationPacket = (room: Room): GamePacket => {
	const notificationPayload: S2CGamePrepareNotification = {
		room: room,
	};

	return {
		payload: {
			oneofKind: 'gamePrepareNotification',
			gamePrepareNotification: notificationPayload,
		},
	};
};

export const gamePrepareUseCase = async (
	socket: GameSocket,
	req: C2SGamePrepareRequest,
): Promise<GamePacket> => {
	if (!socket.roomId) {
		return createGamePrepareResponsePacket({
			success: false,
			failCode: GlobalFailCode.INVALID_REQUEST,
		});
	}

	try {
		const room: Room | null = getRoom(socket.roomId);

		if (!room) {
			return createGamePrepareResponsePacket({
				success: false,
				failCode: GlobalFailCode.ROOM_NOT_FOUND,
			});
		}

		// 인원 수에 따른 역할 목록 정의
		const roles: Record<number, RoleType[]> = {
			2: [RoleType.TARGET, RoleType.HITMAN],
			3: [RoleType.TARGET, RoleType.PSYCHOPATH, RoleType.HITMAN],
			4: [RoleType.TARGET, RoleType.PSYCHOPATH, RoleType.BODYGUARD, RoleType.HITMAN],
			5: [
				RoleType.TARGET,
				RoleType.PSYCHOPATH,
				RoleType.HITMAN,
				RoleType.BODYGUARD,
				RoleType.BODYGUARD,
			],
			6: [
				RoleType.TARGET,
				RoleType.PSYCHOPATH,
				RoleType.HITMAN,
				RoleType.BODYGUARD,
				RoleType.BODYGUARD,
				RoleType.BODYGUARD,
			],
			7: [
				RoleType.TARGET,
				RoleType.PSYCHOPATH,
				RoleType.HITMAN,
				RoleType.HITMAN,
				RoleType.BODYGUARD,
				RoleType.BODYGUARD,
				RoleType.BODYGUARD,
			],
		};

		const role = roles[room.users.length];
		if (!role) {
			// 지원하지 않는 인원 수에 대한 처리
			return createGamePrepareResponsePacket({
				success: false,
				failCode: GlobalFailCode.INVALID_REQUEST,
			});
		}

		// 캐릭터 정보 로드
		const characterList: CharacterInfo[] = (characterType as any[]).map((char) => ({
			...char,
			characterType: CharacterType[char.characterType as keyof typeof CharacterType],
		}));

		// 모든 유저에게 역할과 캐릭터 할당
		room.users.forEach((user) => {
			const randomRoleIndex = Math.floor(Math.random() * role.length);
			const randomCharacterIndex = Math.floor(Math.random() * characterList.length);

			const characterData: CharacterData = {
				characterType: characterList[randomCharacterIndex].characterType,
				roleType: role[randomRoleIndex],
				hp: characterList[randomCharacterIndex].hp,
				stateInfo: {
					state: CharacterStateType.NONE_CHARACTER_STATE,
					nextState: CharacterStateType.NONE_CHARACTER_STATE,
					nextStateAt: '0',
					stateTargetUserId: '0',
				},
				weapon: 0,
				equips: [],
				debuffs: [],
				handCards: [],
				bbangCount: 0,
				handCardsCount: 0,
			};

			user.character = characterData;

			// 중복 할당을 막기 위해 사용한 역할과 캐릭터는 목록에서 제거
			role.splice(randomRoleIndex, 1);
			characterList.splice(randomCharacterIndex, 1);
		});

		// 방 상태를 INGAME으로 변경
		room.state = RoomStateType.INGAME;

		saveRoom(room);

		// 모든 유저에게 게임 준비 완료 알림 전송
		const notificationPacket = createGamePrepareNotificationPacket(room);
		broadcastDataToRoom(room.users, notificationPacket, GamePacketType.gamePrepareNotification);

		// 요청자에게 성공 응답 반환
		return createGamePrepareResponsePacket({
			success: true,
			failCode: GlobalFailCode.NONE_FAILCODE,
		});
	} catch (error) {
		console.error('Error in gamePrepareUseCase:', error);
		return createGamePrepareResponsePacket({
			success: false,
			failCode: GlobalFailCode.UNKNOWN_ERROR,
		});
	}
};
