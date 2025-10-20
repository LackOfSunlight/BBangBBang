import { IRoomRepository } from './IRoomRepository';
import { Room } from '../Room';
import { User } from '../../../../models/user.model';

/**
 * MemoryRoomRepository
 * 메모리 기반 Room Repository 구현체
 * 기존 RoomManager와 호환되도록 구현
 */
export class MemoryRoomRepository implements IRoomRepository {
	private rooms: Map<number, Room> = new Map();

	// 기본 CRUD 작업
	async save(room: Room): Promise<void> {
		this.rooms.set(room.id, room);
		console.log(`[MemoryRoomRepository] Room 저장: ${room.id}`);
	}

	async findById(id: number): Promise<Room | null> {
		const room = this.rooms.get(id) || null;
		console.log(`[MemoryRoomRepository] Room 조회: ${id} ${room ? '찾음' : '없음'}`);
		return room;
	}

	async findAll(): Promise<Room[]> {
		const allRooms = Array.from(this.rooms.values());
		console.log(`[MemoryRoomRepository] 모든 Room 조회: ${allRooms.length}개`);
		return allRooms;
	}

	async delete(id: number): Promise<void> {
		const deleted = this.rooms.delete(id);
		console.log(`[MemoryRoomRepository] Room 삭제: ${id} ${deleted ? '성공' : '실패'}`);
	}

	// Room 검색
	async findByOwnerId(ownerId: string): Promise<Room[]> {
		const rooms = Array.from(this.rooms.values())
			.filter(room => room.ownerId === ownerId);
		console.log(`[MemoryRoomRepository] Owner로 Room 검색: ${ownerId} -> ${rooms.length}개`);
		return rooms;
	}

	async findByState(state: number): Promise<Room[]> {
		const rooms = Array.from(this.rooms.values())
			.filter(room => room.state === state);
		console.log(`[MemoryRoomRepository] State로 Room 검색: ${state} -> ${rooms.length}개`);
		return rooms;
	}

	async findByUser(userId: string): Promise<Room | null> {
		const room = Array.from(this.rooms.values())
			.find(room => room.users.some(user => user.id === userId)) || null;
		console.log(`[MemoryRoomRepository] User로 Room 검색: ${userId} ${room ? '찾음' : '없음'}`);
		return room;
	}

	// Room 관리
	async addUser(roomId: number, user: User): Promise<boolean> {
		const room = await this.findById(roomId);
		if (!room) {
			console.log(`[MemoryRoomRepository] Room을 찾을 수 없습니다: ${roomId}`);
			return false;
		}

		const success = room.addUser(user);
		if (success) {
			await this.save(room);
		}
		return success;
	}

	async removeUser(roomId: number, userId: string): Promise<boolean> {
		const room = await this.findById(roomId);
		if (!room) {
			console.log(`[MemoryRoomRepository] Room을 찾을 수 없습니다: ${roomId}`);
			return false;
		}

		const success = room.removeUser(userId);
		if (success) {
			await this.save(room);
		}
		return success;
	}

	async updateRoomState(roomId: number, state: number): Promise<boolean> {
		const room = await this.findById(roomId);
		if (!room) {
			console.log(`[MemoryRoomRepository] Room을 찾을 수 없습니다: ${roomId}`);
			return false;
		}

		room.setState(state);
		await this.save(room);
		return true;
	}

	async updateRoomName(roomId: number, name: string): Promise<boolean> {
		const room = await this.findById(roomId);
		if (!room) {
			console.log(`[MemoryRoomRepository] Room을 찾을 수 없습니다: ${roomId}`);
			return false;
		}

		room.setName(name);
		await this.save(room);
		return true;
	}

	// 통계 및 검증
	async count(): Promise<number> {
		const count = this.rooms.size;
		console.log(`[MemoryRoomRepository] Room 개수: ${count}`);
		return count;
	}

	async exists(id: number): Promise<boolean> {
		const exists = this.rooms.has(id);
		console.log(`[MemoryRoomRepository] Room 존재 확인: ${id} -> ${exists}`);
		return exists;
	}

	async isRoomFull(roomId: number): Promise<boolean> {
		const room = await this.findById(roomId);
		if (!room) {
			return false;
		}

		const isFull = room.isFull();
		console.log(`[MemoryRoomRepository] Room 가득참 확인: ${roomId} -> ${isFull}`);
		return isFull;
	}

	// 추가 유틸리티 메서드
	public clear(): void {
		this.rooms.clear();
		console.log(`[MemoryRoomRepository] 모든 Room 삭제`);
	}

	public getRoomIds(): number[] {
		return Array.from(this.rooms.keys());
	}
}

export default MemoryRoomRepository;
