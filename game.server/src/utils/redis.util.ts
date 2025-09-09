import { Room } from "../models/room.model";
import { User } from "../models/user.model";
import { Character } from "../models/character.model.js";
import redis from "../redis/redis";
import { CharacterData } from "../generated/common/types";

// 방 저장
export async function saveRoom(room: Room): Promise<void> {
	await redis.set(`room:${room.id}`, JSON.stringify(room));
}

// 방 불러오기
export async function getRoom(roomId: number): Promise<Room | null> {
	const data = await redis.get(`room:${roomId}`);
	return data ? JSON.parse(data) : null;
}

// 유저를 방에 추가
export async function addUserToRoom(roomId: number, user: User): Promise<Room | null> {
  const room = await getRoom(roomId);
  if (!room) throw new Error("Room not found");

	if (room.users.length >= room.maxUserNum) {
		throw new Error('Room is full');
	}

  room.users.push(user);
  await saveRoom(room);

  return room;

}

// 유저를 방에서 제거
export async function removeUserFromRoom(roomId: number, userId: string): Promise<void> {
	const room = await getRoom(roomId);
	if (!room) throw new Error('Room not found');

	room.users = room.users.filter((u) => u.id !== userId);

	await saveRoom(room);
}

// 방에서 특정 유저 가져오기
export const getUserFromRoom = async (roomId: number, userId: string): Promise<User | null> => {
	const data = await getRoom(roomId);
	if (!data) return null;

	// 유저 찾기
	const user = data.users.find((u) => u.id === userId);
	return user ?? null;
};

/* 방에서 특정 유저 정보 업데이트
사용 예시
const updated = await updateUserFromRoom(1, 1001, {character: charaterData });
  if (updated) {
    console.log("업데이트된 유저:", updated);
  } else {
  console.log("유저를 찾을 수 없음");
  }
*/
export const updateCharacterFromRoom = async (
	roomId: number,
	userId: string,
	updateData: CharacterData, // 업데이트할 필드만 넘길 수 있도록 Partial<User>
): Promise<void> => {
	const data = await getRoom(roomId);
	if (!data) return;

	// 유저 찾기
	const userIndex = data.users.findIndex((u) => u.id === userId);
	if (userIndex === -1) return;

	// 기존 유저 데이터
	const user = data.users[userIndex];

	// 업데이트 (얕은 병합)
	const updatedUser = { ...user, ...updateData };

	// 배열에 반영
	data.users[userIndex] = updatedUser;

	// Redis에 다시 저장
	await redis.set(`room:${roomId}`, JSON.stringify(data));

	//return updatedUser;
};

// 전체 방 불러오기
export const getRooms = async (): Promise<Room[]> => {
	// room:* 패턴으로 모든 방 키 조회
	const keys = await redis.keys('room:*');
	if (keys.length === 0) return [];

	// 모든 방 데이터를 가져오기
	const roomsData = await redis.mget(keys);
	const rooms: Room[] = roomsData.filter((d) => d !== null).map((d) => JSON.parse(d!) as Room);

	return rooms;
};

// 방 삭제
export const deleteRoom = async (roomId: number): Promise<void> => {
	await redis.del(`room:${roomId}`);
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////

// 실시간 캐릭터 정보 저장
export const updateCharacterInRedis = async (
  characterType: number, // CharacterType을 기준으로 판별
  updateData: Partial<Character>
): Promise<Character | null> => {
  // Redis에서 기존 캐릭터 데이터 가져오기
  const key = `Character:${characterType}`; // 캐릭터가 중복하여 등장하지 않기에 캐릭터 타입을 키로 사용
  const exists = await redis.exists(key);
  if (!exists) return null;

  const storedData = await redis.hgetall(key);
  if (!storedData) return null;

  // Redis Hash에서 불러온 데이터 타입 변환
  const currentCharacter: Character = new Character(
    Number(storedData.characterType),
    Number(storedData.roleType),
    Number(storedData.hp),
    Number(storedData.weapon),
    JSON.parse(storedData.equips || "[]"),
    JSON.parse(storedData.debuffs || "[]"),
    JSON.parse(storedData.handCards || "[]"),
    Number(storedData.bbangCount),
    Number(storedData.handCardsCount)
  );

  // 업데이트
  const updatedCharacter = { ...currentCharacter, ...updateData };

  // Redis에 다시 저장
  const characterData = {
    characterType: updatedCharacter.characterType.toString(),
    roleType: updatedCharacter.roleType.toString(),
    hp: updatedCharacter.hp.toString(),
    weapon: updatedCharacter.weapon.toString(),
    bbangCount: updatedCharacter.bbangCount.toString(),
    handCardsCount: updatedCharacter.handCardsCount.toString(),
    equips: JSON.stringify(updatedCharacter.equips),
    debuffs: JSON.stringify(updatedCharacter.debuffs),
    handCards: JSON.stringify(updatedCharacter.handCards),
    stateInfo: updatedCharacter.stateInfo ? JSON.stringify(updatedCharacter.stateInfo) : "",
  };

  await redis.hset(key, characterData);

  return updatedCharacter as Character;
};

// 방에서 특정 유저의 정보(아이디 제외한 속성값들) 배열로 가져오기
export const getUserInfoFromRoom = async (roomId: number, socketId: string): Promise<any[]> => {
  const data = await getRoom(roomId);
  if (!data) return [];

  // socket.id와 일치하는 유저 찾기
  const user = data.users.find((u) => u.id === socketId);
  if (!user) return [];

  // 속성값을 배열로 추출
  const userValues = Object.entries(user)
    //.filter(([key]) => key !== 'id') // id 제외
    .map(([_, value]) => value);     // 값만 배열로 저장

  return userValues;
};

