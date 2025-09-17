import { prisma } from '../utils/db';
import { C2SRegisterRequest } from '../generated/packet/auth';
import * as bcrypt from 'bcrypt';
import { C2SCreateRoomRequest } from '../generated/packet/room_actions';
import { GameSocket } from '../type/game.socket';
import { RoomStateType } from '../generated/prisma';


// DB에서 유저 가져오기
export const getUserDB = async (
	userId: number,
): Promise<{
	id: number;
	email: string;
	nickname: string;
	password: string;
	token: string | null;
	createdAt: Date;
} | null> => {
	const userData = await prisma.user.findUnique({
		where: {
			id: userId,
		},
	});

	if (userData) {
		return userData;
	} else {
		return null;
	}
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
export const removeTokenUserDB = async (userId: number) =>{
    await prisma.user.update({
        where:{ id: userId},
        data:{ token: null},
    });
}


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



