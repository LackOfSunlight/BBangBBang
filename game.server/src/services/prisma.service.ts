import { prisma } from '../Utils/db';
import { C2SRegisterRequest } from '../Generated/packet/auth';
import * as bcrypt from 'bcrypt';
import { C2SCreateRoomRequest } from '../Generated/packet/room_actions';
import { GameSocket } from '../Type/game.socket';
import { RoomStateType } from '../Generated/prisma';

// DB에서 유저 가져오기
export const getUserByUserId = async (
	userId: number,
): Promise<{
	id: number;
	email: string;
	nickname: string;
} | null> => {
	const userData = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			id: true,
			email: true,
			nickname: true,
		},
	});

	if (userData) {
		return userData;
	} else {
		return null;
	}
};

export const getUserByEmail = async (email: string) => {
	const userData = await prisma.user.findUnique({
		where: { email },
	});

	return userData;
};

export const setTokenService = async (userId: number, userEmail: string): Promise<string> => {
	const token = await bcrypt.hash(userEmail, 4);

	await prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			token: token,
		},
	});

	return token;
};

// DB에 새로운 유저 생성
export const createUserDB = async (req: C2SRegisterRequest) => {
	// 비밀번호 해시
	const hashedPassword = await bcrypt.hash(req.password, 12);

	// DB에 유저 생성
	await prisma.user.create({
		data: {
			email: req.email,
			nickname: req.nickname,
			password: hashedPassword,
		},
	});
};

//DB 업데이트
export const removeTokenUserDB = async (userId: number) => {
	await prisma.user.update({
		where: { id: userId },
		data: { token: null },
	});
};

// DB에 방 찾기
export const findRoomDB = async (
	roomId: number,
): Promise<{
	id: number;
	ownerId: number;
	name: string;
	maxUserNum: number;
	state: RoomStateType;
} | null> => {
	const roomData = await prisma.room.findUnique({
		where: { id: roomId },
	});

	if (roomData) return roomData;
	else return null;
};

// DB에 방 생성
export const createRoomDB = async (
	socket: GameSocket,
	req: C2SCreateRoomRequest,
): Promise<{
	id: number;
	ownerId: number;
	name: string;
	maxUserNum: number;
	state: RoomStateType;
} | null> => {
	const roomData = await prisma.room.create({
		data: {
			ownerId: Number(socket.userId),
			name: req.name,
			maxUserNum: req.maxUserNum,
			state: RoomStateType.WAIT,
		},
	});

	if (roomData) return roomData;
	else return null;
};
