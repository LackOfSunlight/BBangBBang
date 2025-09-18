import { Room } from '../models/room.model';
import { User } from '../models/user.model';
import redis from '../redis/redis';
import { CharacterData } from '../generated/common/types';

const rooms = new Map<number, Room>();

// 방 저장
export function saveRoom(room: Room): void {
	rooms.set(room.id, room);
}

// 방 불러오기
export function getRoom(roomId: number): Room {
	const room = rooms.get(roomId);
	if (!room) {
		throw new Error('Room not found');
	}

	return room;
}

// 유저를 방에 추가
export function addUserToRoom(roomId: number, user: User): Room | Error {
	const room = rooms.get(roomId);
	if (!room) throw new Error('Room not found');

	if (room.users.length >= room.maxUserNum) {
		throw new Error('Room is full');
	}

	room.users.push(user);

	return room;
}

// 유저를 방에서 제거
export function removeUserFromRoom(roomId: number, userId: string): void {
	const room = rooms.get(roomId);
	if (!room) throw new Error('Room not found');

	room.users = room.users.filter((u) => u.id !== userId);
}

// 방에서 특정 유저 가져오기
export function getUserFromRoom(roomId: number, userId: string): User | Error {
	const room = rooms.get(roomId);
	if (!room) throw new Error('Room not found');

	// 유저 찾기
	const user = room.users.find((u) => u.id === userId);
	if (!user) throw new Error('User not found');
	return user;
}

/* 방에서 특정 유저 정보 업데이트
사용 예시
const updated = await updateUserFromRoom(1, 1001, {character: charaterData });
  if (updated) {
    console.log("업데이트된 유저:", updated);
  } else {
  console.log("유저를 찾을 수 없음");
  }
*/
export function updateCharacterFromRoom(
	roomId: number,
	userId: string,
	updateData: Partial<CharacterData>, // 업데이트할 필드만 넘길 수 있도록 Partial<User>
): void {
	const room = rooms.get(roomId);
	if (!room) throw new Error('Room not found');

	// 유저 찾기
	const userIndex = room.users.findIndex((u) => u.id === userId);
	if (userIndex === -1) throw new Error('User not found');

	// 기존 유저 데이터
	const user = room.users[userIndex];

	// 업데이트 (얕은 병합)
	const updatedUser = { ...user, character: { ...user.character, ...updateData } as CharacterData };

	// 배열에 반영
	room.users[userIndex] = updatedUser;
}

// 전체 방 불러오기
export const getRooms = (): Room[] => {
	return Array.from(rooms.values());
};

// 방 삭제
export const deleteRoom = (roomId: number): void => {
	rooms.delete(roomId);
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////

// 방에서 특정 유저의 정보(아이디 제외한 속성값들) 배열로 가져오기
export const getUserInfoFromRoom = (roomId: number, socketId: string): any[] => {
	const data = rooms.get(roomId);
	if (!data) return [];

	// socket.id와 일치하는 유저 찾기
	const user = data.users.find((u) => u.id === socketId);
	if (!user) return [];

	// 속성값을 배열로 추출
	const userValues = Object.entries(user)
		//.filter(([key]) => key !== 'id') // id 제외
		.map(([_, value]) => value); // 값만 배열로 저장

	return userValues;
};
