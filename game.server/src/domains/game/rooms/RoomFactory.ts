import { Room } from './Room';
import { RoomService } from './services/RoomService';
import { MemoryRoomRepository } from './repositories/MemoryRoomRepository';
import { IRoomRepository } from './repositories/IRoomRepository';

/**
 * RoomFactory
 * Room 관련 객체들을 생성하는 팩토리 클래스
 */
export class RoomFactory {
	private static roomService: RoomService;

	/**
	 * RoomService 인스턴스 반환 (싱글톤)
	 */
	public static getRoomService(): RoomService {
		if (!this.roomService) {
			const repository = new MemoryRoomRepository();
			this.roomService = new RoomService(repository);
		}
		return this.roomService;
	}

	/**
	 * 특정 Repository를 사용하는 RoomService 생성
	 */
	public static createRoomService(repository: IRoomRepository): RoomService {
		return new RoomService(repository);
	}

	/**
	 * 새로운 Room 인스턴스 생성
	 */
	public static createRoom(
		ownerId: string,
		name: string,
		maxUserNum: number = 4,
		state: number = 0
	): Room {
		const id = Date.now(); // 간단한 ID 생성
		return new Room(id, ownerId, name, maxUserNum, state, []);
	}

	/**
	 * 기존 Room 인스턴스 복제
	 */
	public static cloneRoom(originalRoom: Room): Room {
		const newRoom = new Room(
			Date.now(), // 새로운 ID
			originalRoom.ownerId,
			originalRoom.name,
			originalRoom.maxUserNum,
			originalRoom.state,
			[...originalRoom.users] // 사용자 배열 복사
		);

		// 카드 덱 복사
		// private 속성이므로 직접 접근할 수 없어서 별도 메서드 필요
		// newRoom._roomDecks = [...originalRoom.roomDecks];
		
		return newRoom;
	}

	/**
	 * RoomService 리셋 (테스트용)
	 */
	public static resetRoomService(): void {
		this.roomService = undefined as any;
	}
}

export default RoomFactory;
