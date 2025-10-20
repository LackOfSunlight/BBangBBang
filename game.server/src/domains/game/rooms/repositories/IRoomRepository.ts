import { Room } from '../Room';
import { User } from '../../../../models/user.model';

/**
 * Room Repository 인터페이스
 * Room 도메인 엔티티의 데이터 접근 계약을 정의합니다.
 */
export interface IRoomRepository {
	// 기본 CRUD 작업
	save(room: Room): Promise<void>;
	findById(id: number): Promise<Room | null>;
	findAll(): Promise<Room[]>;
	delete(id: number): Promise<void>;

	// Room 검색
	findByOwnerId(ownerId: string): Promise<Room[]>;
	findByState(state: number): Promise<Room[]>;
	findByUser(userId: string): Promise<Room | null>;

	// Room 관리
	addUser(roomId: number, user: User): Promise<boolean>;
	removeUser(roomId: number, userId: string): Promise<boolean>;
	updateRoomState(roomId: number, state: number): Promise<boolean>;
	updateRoomName(roomId: number, name: string): Promise<boolean>;

	// 통계 및 검증
	count(): Promise<number>;
	exists(id: number): Promise<boolean>;
	isRoomFull(roomId: number): Promise<boolean>;
}

export default IRoomRepository;
