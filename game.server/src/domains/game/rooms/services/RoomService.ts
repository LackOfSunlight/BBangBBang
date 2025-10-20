import { IRoomRepository } from '../repositories/IRoomRepository';
import { MemoryRoomRepository } from '../repositories/MemoryRoomRepository';
import { Room } from '../Room';
import { User } from '../../../../models/user.model';
import { RoomStateType } from '../../../../generated/common/enums';

/**
 * RoomService
 * Room 도메인의 비즈니스 로직을 담당하는 서비스 클래스
 */
export class RoomService {
	private roomRepository: IRoomRepository;

	constructor(roomRepository?: IRoomRepository) {
		this.roomRepository = roomRepository || new MemoryRoomRepository();
	}

	/**
	 * 새로운 방 생성
	 */
	public async createRoom(
		ownerId: string,
		name: string,
		maxUserNum: number = 4
	): Promise<Room> {
		// 방 ID 생성 (간단한 구현)
		const id = Date.now();
		
		const room = new Room(id, ownerId, name, maxUserNum, 0, []);
		
		if (!room.isValid()) {
			throw new Error('유효하지 않은 방 정보입니다.');
		}

		await this.roomRepository.save(room);
		console.log(`[RoomService] 방 생성 완료: ${name} (ID: ${id})`);
		
		return room;
	}

	/**
	 * 방에 유저 추가
	 */
	public async addUserToRoom(roomId: number, user: User): Promise<boolean> {
		const room = await this.roomRepository.findById(roomId);
		if (!room) {
			console.log(`[RoomService] 방을 찾을 수 없습니다: ${roomId}`);
			return false;
		}

		if (room.isFull()) {
			console.log(`[RoomService] 방이 가득 찼습니다: ${roomId}`);
			return false;
		}

		return await this.roomRepository.addUser(roomId, user);
	}

	/**
	 * 방에서 유저 제거
	 */
	public async removeUserFromRoom(roomId: number, userId: string): Promise<boolean> {
		const room = await this.roomRepository.findById(roomId);
		if (!room) {
			console.log(`[RoomService] 방을 찾을 수 없습니다: ${roomId}`);
			return false;
		}

		return await this.roomRepository.removeUser(roomId, userId);
	}

	/**
	 * 방 상태 변경
	 */
	public async changeRoomState(roomId: number, state: RoomStateType): Promise<boolean> {
		const room = await this.roomRepository.findById(roomId);
		if (!room) {
			console.log(`[RoomService] 방을 찾을 수 없습니다: ${roomId}`);
			return false;
		}

		return await this.roomRepository.updateRoomState(roomId, state);
	}

	/**
	 * 방 이름 변경
	 */
	public async changeRoomName(roomId: number, name: string): Promise<boolean> {
		const room = await this.roomRepository.findById(roomId);
		if (!room) {
			console.log(`[RoomService] 방을 찾을 수 없습니다: ${roomId}`);
			return false;
		}

		return await this.roomRepository.updateRoomName(roomId, name);
	}

	/**
	 * 방 조회
	 */
	public async getRoom(roomId: number): Promise<Room | null> {
		return await this.roomRepository.findById(roomId);
	}

	/**
	 * 사용자가 속한 방 조회
	 */
	public async getRoomByUser(userId: string): Promise<Room | null> {
		return await this.roomRepository.findByUser(userId);
	}

	/**
	 * 모든 방 조회
	 */
	public async getAllRooms(): Promise<Room[]> {
		return await this.roomRepository.findAll();
	}

	/**
	 * 방장의 모든 방 조회
	 */
	public async getRoomsByOwner(ownerId: string): Promise<Room[]> {
		return await this.roomRepository.findByOwnerId(ownerId);
	}

	/**
	 * 특정 상태의 방들 조회
	 */
	public async getRoomsByState(state: RoomStateType): Promise<Room[]> {
		return await this.roomRepository.findByState(state);
	}

	/**
	 * 방 삭제
	 */
	public async deleteRoom(roomId: number): Promise<boolean> {
		const room = await this.roomRepository.findById(roomId);
		if (!room) {
			console.log(`[RoomService] 방을 찾을 수 없습니다: ${roomId}`);
			return false;
		}

		// 방장만 방을 삭제할 수 있는지 확인하는 로직 추가 가능
		
		await this.roomRepository.delete(roomId);
		console.log(`[RoomService] 방 삭제 완료: ${roomId}`);
		return true;
	}

	/**
	 * 게임 시작 가능 여부 확인
	 */
	public async canStartGame(roomId: number): Promise<boolean> {
		const room = await this.roomRepository.findById(roomId);
		if (!room) {
			return false;
		}

		return room.canStartGame();
	}

	/**
	 * 방 통계 정보
	 */
	public async getRoomStatistics(): Promise<{
		totalRooms: number;
		activeRooms: number;
		fullRooms: number;
		emptyRooms: number;
	}> {
		const allRooms = await this.roomRepository.findAll();
		
		const totalRooms = allRooms.length;
		const activeRooms = allRooms.filter(room => room.users.length > 0).length;
		const fullRooms = allRooms.filter(room => room.isFull()).length;
		const emptyRooms = allRooms.filter(room => room.isEmpty()).length;

		return {
			totalRooms,
			activeRooms,
			fullRooms,
			emptyRooms
		};
	}

	/**
	 * Repository 교체 (테스트용)
	 */
	public setRepository(repository: IRoomRepository): void {
		this.roomRepository = repository;
	}
}

export default RoomService;
