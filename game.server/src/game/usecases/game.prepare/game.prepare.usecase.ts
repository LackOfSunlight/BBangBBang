import { GameSocket } from '@common/types/game.socket.js';
import { C2SGamePrepareRequest } from '@core/generated/packet/game_actions.js';
import { GamePacket } from '@core/generated/gamePacket.js';
import {
	CharacterStateType,
	CharacterType,
	GlobalFailCode,
	RoleType,
	RoomStateType,
} from '@core/generated/common/enums.js';

import { Room } from '@game/models/room.model.js';
import { CharacterData } from '@core/generated/common/types.js';
import characterType from '@data/characterType.json';
import { CharacterInfo } from '@common/types/character.info.js';
import { GamePacketType } from '@game/enums/gamePacketType.js';
import { broadcastDataToRoom } from '@core/network/sockets/notification.js';
import {
	gamePrepareNotificationPacketForm,
	gamePrepareResponsePacketForm,
} from '@common/converters/packet.form.js';
import roomManger from '@game/managers/room.manager.js';
// RoomService 제거: 엔티티 메서드 직접 사용
import { Character } from '@game/models/character.model.js';

export const gamePrepareUseCase = (socket: GameSocket, req: C2SGamePrepareRequest): GamePacket => {
	if (!socket.roomId) {
		return gamePrepareResponsePacketForm({
			success: false,
			failCode: GlobalFailCode.INVALID_REQUEST,
		});
	}

	try {
		const room: Room | null = roomManger.getRoom(socket.roomId);

		if (!room) {
			return gamePrepareResponsePacketForm({
				success: false,
				failCode: GlobalFailCode.ROOM_NOT_FOUND,
			});
		}

		// 인원 수에 따른 역할 목록 정의
		const roles: Record<number, RoleType[]> = {
			2: [RoleType.TARGET, RoleType.HITMAN],
			3: [RoleType.TARGET, RoleType.PSYCHOPATH, RoleType.HITMAN],
			4: [RoleType.TARGET, RoleType.PSYCHOPATH, RoleType.HITMAN, RoleType.HITMAN],
			5: [
				RoleType.TARGET,
				RoleType.PSYCHOPATH,
				RoleType.HITMAN,
				RoleType.HITMAN,
				RoleType.BODYGUARD,
			],
			6: [
				RoleType.TARGET,
				RoleType.PSYCHOPATH,
				RoleType.HITMAN,
				RoleType.HITMAN,
				RoleType.HITMAN,
				RoleType.BODYGUARD,
			],
			7: [
				RoleType.TARGET,
				RoleType.PSYCHOPATH,
				RoleType.HITMAN,
				RoleType.HITMAN,
				RoleType.HITMAN,
				RoleType.BODYGUARD,
				RoleType.BODYGUARD,
			],
		};

		// 시작 가능 여부 확인: 엔티티 메서드 활용
		if (!room.canStartGame()) {
			return gamePrepareResponsePacketForm({
				success: false,
				failCode: GlobalFailCode.INVALID_REQUEST,
			});
		}

		const role = roles[room.users.length];
		if (!role) {
			// 지원하지 않는 인원 수에 대한 처리
			return gamePrepareResponsePacketForm({
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
				hp: 4,
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

			user.setCharacter(characterData);

			// 중복 할당을 막기 위해 사용한 역할과 캐릭터는 목록에서 제거
			role.splice(randomRoleIndex, 1);
			characterList.splice(randomCharacterIndex, 1);
		});

		// 방 상태를 INGAME으로 변경
		room.state = RoomStateType.INGAME;

		const toRoom = room.toData();

		// 모든 유저에게 게임 준비 완료 알림 전송
		const notificationPacket = gamePrepareNotificationPacketForm(toRoom);
		broadcastDataToRoom(toRoom.users, notificationPacket, GamePacketType.gamePrepareNotification);

		// 요청자에게 성공 응답 반환
		return gamePrepareResponsePacketForm({
			success: true,
			failCode: GlobalFailCode.NONE_FAILCODE,
		});
	} catch (error) {
		console.error('Error in gamePrepareUseCase:', error);
		return gamePrepareResponsePacketForm({
			success: false,
			failCode: GlobalFailCode.UNKNOWN_ERROR,
		});
	}
};
