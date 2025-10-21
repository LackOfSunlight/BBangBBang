import { GamePacket } from '@core/generated/gamePacket';
import { GameSocket } from '@common/types/game.socket';
import { Room } from '@game/models/room.model';
import { CharacterStateType, GlobalFailCode } from '@core/generated/common/enums';
import { GamePacketType } from '@game/enums/gamePacketType';
import { User } from '@game/models/user.model';
import { broadcastDataToRoom } from '@core/network/sockets/notification';
import { C2SFleaMarketPickRequest } from '@core/generated/packet/game_actions';
import {
	fleaMarketNotificationForm,
	fleaMarketResponseForm,
	userUpdateNotificationPacketForm,
} from '@common/converters/packet.form';
import roomManger from '@game/managers/room.manager';

const fleaMarketPickUseCase = (socket: GameSocket, req: C2SFleaMarketPickRequest): GamePacket => {
	try {
		const room = roomManger.getRoom(Number(socket.roomId));
		const userInfo = roomManger.getUserFromRoom(room.id, socket.userId!);

		if (!room || !userInfo || !userInfo.character) {
			return fleaMarketResponseForm(false, GlobalFailCode.ROOM_NOT_FOUND);
		}

		const fleaMarketCards = room.roomFleaMarketCards;
		const pickNumbers = room.fleaMarketPickIndex;

		if (fleaMarketCards === undefined || pickNumbers === undefined) {
			console.log('플리마켓 카드덱에서 에러 발생');
			return fleaMarketResponseForm(false, GlobalFailCode.CHARACTER_NO_CARD);
		}

		const selectedCard = fleaMarketCards[req.pickIndex];
		pickNumbers.push(req.pickIndex);

		const existCard = userInfo.character!.handCards.find((c) => c.type === selectedCard);

		if (existCard) {
			existCard.count += 1;
		} else {
			userInfo.character.handCards.push({ type: selectedCard, count: 1 });
		}

		userInfo.character.handCardsCount += 1;

		userInfo.character.changeState(
			CharacterStateType.FLEA_MARKET_WAIT,
			CharacterStateType.NONE_CHARACTER_STATE,
		);

		for (let i = 0; i < room.users.length; i++) {
			if (room.users[i].id === userInfo.id) {
				let nextIndex = (i + 1) % room.users.length;
				let nextUser = room.users[nextIndex];

				// 죽은 플레이어와 격리된 플레이어를 건너뛰고 살아있는 플레이어 찾기
				while (
					nextUser &&
					nextUser.character &&
					(nextUser.character.hp <= 0 ||
						nextUser.character.stateInfo?.state === CharacterStateType.CONTAINED)
				) {
					nextIndex = (nextIndex + 1) % room.users.length;
					nextUser = room.users[nextIndex];

					// 무한 루프 방지 (한 바퀴 돌았으면 중단)
					if (nextIndex === i) break;
				}

				if (!nextUser || !nextUser.character || !nextUser.character.stateInfo)
					return fleaMarketResponseForm(false, GlobalFailCode.CHARACTER_NOT_FOUND);

				if (nextUser.character.stateInfo.nextState !== CharacterStateType.NONE_CHARACTER_STATE) {
					nextUser.character.changeState(
						CharacterStateType.FLEA_MARKET_TURN,
						CharacterStateType.FLEA_MARKET_WAIT,
						Number(process.env.NEXT_TIME),
					);

					break;
				}
			}
		}

		// 모든 유저가 FLEA_MARKET_WAIT 상태인지 확인 (죽은 플레이어와 감금된 플레이어 제외)
		const allWaiting = room.users
			.filter(
				(u) =>
					u.character?.hp &&
					u.character.hp > 0 &&
					u.character?.stateInfo?.state !== CharacterStateType.CONTAINED,
			)
			.every((u) => u.character?.stateInfo?.state === CharacterStateType.FLEA_MARKET_WAIT);

		if (allWaiting) {
			for (const u of room.users) {
				if (!u || !u.character || !u.character.stateInfo)
					return fleaMarketResponseForm(false, GlobalFailCode.CHARACTER_NOT_FOUND);

				// 감옥에 있는 애들은 상태를 바꾸지 않음
				if (u.character.stateInfo.state === CharacterStateType.CONTAINED) continue;

				u.character.changeState();
			}

			room.fleaMarketPickIndex = [];
			room.roomFleaMarketCards = [];
		}

		const toRoom = room.toData();

		const fleaMarketGamePacket = fleaMarketNotificationForm(fleaMarketCards, pickNumbers);
		const userUpdateGamePacket = userUpdateNotificationPacketForm(toRoom.users);

		broadcastDataToRoom(room.users, fleaMarketGamePacket, GamePacketType.fleaMarketNotification);

		broadcastDataToRoom(room.users, userUpdateGamePacket, GamePacketType.userUpdateNotification);

		return fleaMarketResponseForm(true, GlobalFailCode.NONE_FAILCODE);
	} catch (error) {
		return fleaMarketResponseForm(false, GlobalFailCode.UNKNOWN_ERROR);
	}
};

export default fleaMarketPickUseCase;
