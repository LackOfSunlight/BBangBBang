// cardType = 10
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { CardType, CharacterStateType } from '../../generated/common/enums.js';
import { GamePacket } from '../../generated/gamePacket';
import { GamePacketType } from '../../enums/gamePacketType';
import { drawDeck, fleaMarketPickIndex, roomFleaMarketCards } from '../../managers/card.manager';
import { broadcastDataToRoom } from '../../utils/notification.util';

const cardFleaMarketEffect = (roomId: number, userId: string, targetUserId: string): boolean => {
	// 방 정보 가져오기
	const room = getRoom(roomId);
	const user = getUserFromRoom(roomId,userId);
	if (!room) throw new Error(`Room ${roomId} not found`);
	if(!user) throw new Error(`User ${userId} not found`);

	// 방에 유저들 정보 가져오기
	const users = room.users;
	if (!users || users.length === 0) throw new Error('No users in room');

	// 방 수 만큼 카드 드로우
	const selectedCards = drawDeck(room.id, users.length);
	roomFleaMarketCards.set(roomId,selectedCards);
	fleaMarketPickIndex.set(roomId,[]);
	// const pickIndex = selectedCards.map((_, index) => index);

	user.character!.stateInfo!.state =  CharacterStateType.FLEA_MARKET_TURN;
	user.character!.stateInfo!.nextState = CharacterStateType.FLEA_MARKET_WAIT;
	user.character!.stateInfo!.nextStateAt ='5',
	user.character!.stateInfo!.stateTargetUserId = '0';

	for(let i = 0; i < room.users.length; i++){
		if(room.users[i].id === userId){
			continue;
		}
		room.users[i].character!.stateInfo!.state = CharacterStateType.FLEA_MARKET_WAIT;
		room.users[i].character!.stateInfo!.nextState = CharacterStateType.FLEA_MARKET_TURN;
		room.users[i].character!.stateInfo!.nextStateAt = '0';
		room.users[i].character!.stateInfo!.stateTargetUserId = '0';
	}
	
	// 패킷으로 포장
	const gamePacket = setFleaMarketNotification(selectedCards, []);

	// 전체 방에 공지
	broadcastDataToRoom(users, gamePacket, GamePacketType.fleaMarketNotification);
	return true;
};

export default cardFleaMarketEffect;

const setFleaMarketNotification = (cardTypes: CardType[], pickIndex: number[]): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.fleaMarketNotification,
			fleaMarketNotification: {
				cardTypes,
				pickIndex,
			},
		},
	};

	return newGamePacket;
};
