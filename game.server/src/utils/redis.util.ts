import { Room } from "../models/room.model";
import { User } from "../models/user.model";
import redis from "../redis/redis";

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
export async function addUserToRoom(roomId: number, user: User): Promise<void> {
  const room = await getRoom(roomId);
  if (!room) throw new Error("Room not found");

  if (room.users.length >= room.maxUserNum) {
    throw new Error("Room is full");
  }

  room.users.push(user);
  await saveRoom(room);
}

// 유저를 방에서 제거
export async function removeUserFromRoom(roomId: number, userId: string): Promise<void> {
  const room = await getRoom(roomId);
  if (!room) throw new Error("Room not found");

  room.users = room.users.filter(u => u.id !== userId);

  await saveRoom(room);
}