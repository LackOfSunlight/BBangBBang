import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import {
	CardType,
	CharacterStateType,
	CharacterType,
	RoleType,
	RoomStateType,
} from '../generated/common/enums';
import useCardHandler from '../handlers/use.card.handler';
import { Room } from '../models/room.model';
import { User } from '../models/user.model';
import { Character } from '../models/character.model';
import { CharacterStateInfoData } from '../generated/common/types';
import roomManager from '../managers/room.manager';
import { Socket } from 'net';

let i = 0;

const bbangLogicOverflowTest = async (socket: Socket) => {
	const gs = socket as GameSocket;

	gs.userId = `${999999 + i}`;
	gs.roomId = 999999 + i;

	const user: User = new User(gs.userId, `테스트${gs.userId}`);
	const target: User = new User(`${888888 + i}`, '타켓유저');
	i++;

	const userStateInfoData: CharacterStateInfoData = {
		state: CharacterStateType.NONE_CHARACTER_STATE,
		nextState: CharacterStateType.NONE_CHARACTER_STATE,
		nextStateAt: '0',
		stateTargetUserId: '0',
	};
	const targetStateInfoData: CharacterStateInfoData = {
		state: CharacterStateType.NONE_CHARACTER_STATE,
		nextState: CharacterStateType.NONE_CHARACTER_STATE,
		nextStateAt: '0',
		stateTargetUserId: '0',
	};

	const userCharacter: Character = new Character(
		CharacterType.RED,
		RoleType.HITMAN,
		4,
		0,
		userStateInfoData,
		[],
		[],
		[],
		0,
		0,
	);

	const targetCharacter: Character = new Character(
		CharacterType.PINK_SLIME,
		RoleType.TARGET,
		3,
		0,
		targetStateInfoData,
		[],
		[],
		[],
		0,
		0,
	);

	user.setCharacter(userCharacter);
	target.setCharacter(targetCharacter);

	const room: Room = new Room(gs.roomId, gs.userId, '아무나', 7, RoomStateType.INGAME, [
		user,
		target,
	]);

	roomManager.saveRoom(room);

	const gamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.useCardRequest,
			useCardRequest: {
				cardType: CardType.BBANG,
				targetUserId: target.id,
			},
		},
	};

	await useCardHandler(gs, gamePacket);

	if (i >= 10) i = 0;

	socket.end();
};

export default bbangLogicOverflowTest;
