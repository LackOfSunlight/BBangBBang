import { CharacterType, RoleType, CardType } from '../../generated/common/enums';
import { CharacterStateInfoData } from '../../generated/common/types';
import { User } from '../../models/user.model';
import { Room } from '../../domains/game/rooms/Room';
import { RoomService } from '../../domains/game/rooms/services/RoomService';
import { MemoryRoomRepository } from '../../domains/game/rooms/repositories/MemoryRoomRepository';
import { RoomFactory } from '../../domains/game/rooms/RoomFactory';

describe('Room OOP Integration Tests', () => {
	let roomService: RoomService;
	let repository: MemoryRoomRepository;
	let room: Room;
	let user1: User;
	let user2: User;

	beforeEach(() => {
		// Repository와 Service 초기화
		repository = new MemoryRoomRepository();
		roomService = new RoomService(repository);
		
		// 완전한 테스트 격리를 위한 고유 ID 생성
		const uniqueId = Math.floor(Math.random() * 10000) + Date.now();

		// 공통 상태 정보
		const stateInfo: CharacterStateInfoData = {
			state: 0,
			nextState: 0,
			nextStateAt: '0',
			stateTargetUserId: '0'
		};

		// User1: 방장
		user1 = new User(`user1_${uniqueId}`, 'Player1');
		user1.setCharacter({
			characterType: CharacterType.RED,
			roleType: RoleType.TARGET,
			hp: 4,
			weapon: CardType.NONE,
			stateInfo,
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});

		// User2: 일반 유저
		user2 = new User(`user2_${uniqueId}`, 'Player2');
		user2.setCharacter({
			characterType: CharacterType.RED,
			roleType: RoleType.TARGET,
			hp: 4,
			weapon: CardType.NONE,
			stateInfo,
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});
	});

	describe('Room Entity', () => {
		test('Room을 생성할 수 있다', () => {
			room = new Room(1, 'owner1', 'Test Room', 4, 0, []);
			
			expect(room.id).toBe(1);
			expect(room.ownerId).toBe('owner1');
			expect(room.name).toBe('Test Room');
			expect(room.maxUserNum).toBe(4);
			expect(room.state).toBe(0);
			expect(room.users.length).toBe(0);
		});

		test('유저를 방에 추가할 수 있다', () => {
			room = new Room(1, 'owner1', 'Test Room', 4, 0, []);
			
			const result = room.addUser(user1);
			
			expect(result).toBe(true);
			expect(room.users.length).toBe(1);
			expect(room.users[0].id).toBe(user1.id); // 고유 ID 사용
		});

		test('방이 가득 찬 경우 유저 추가가 실패한다', () => {
			room = new Room(1, 'owner1', 'Test Room', 1, 0, []);
			room.addUser(user1);
			
			const result = room.addUser(user2);
			
			expect(result).toBe(false);
			expect(room.users.length).toBe(1);
		});

		test('같은 유저를 중복 추가할 수 없다', () => {
			room = new Room(1, 'owner1', 'Test Room', 4, 0, []);
			room.addUser(user1);
			
			const result = room.addUser(user1);
			
			expect(result).toBe(false);
			expect(room.users.length).toBe(1);
		});

		test('유저를 방에서 제거할 수 있다', () => {
			room = new Room(1, 'owner1', 'Test Room', 4, 0, []);
			room.addUser(user1);
			room.addUser(user2);
			
			const result = room.removeUser(user1.id); // 고유 ID 사용
			
			expect(result).toBe(true);
			expect(room.users.length).toBe(1);
			expect(room.users[0].id).toBe(user2.id);
		});

		test('존재하지 않는 유저 제거 시 실패한다', () => {
			room = new Room(1, 'owner1', 'Test Room', 4, 0, []);
			room.addUser(user1);
			
			const result = room.removeUser('nonexistent');
			
			expect(result).toBe(false);
			expect(room.users.length).toBe(1);
		});

		test('방 이름을 변경할 수 있다', () => {
			room = new Room(1, 'owner1', 'Test Room', 4, 0, []);
			
			room.setName('New Room Name');
			
			expect(room.name).toBe('New Room Name');
		});

		test('방 상태를 변경할 수 있다', () => {
			room = new Room(1, 'owner1', 'Test Room', 4, 0, []);
			
			room.setState(1);
			
			expect(room.state).toBe(1);
		});

		test('방 상태 검증을 할 수 있다', () => {
			room = new Room(1, 'owner1', 'Test Room', 4, 0, []);
			
			expect(room.isValid()).toBe(true);
			expect(room.isEmpty()).toBe(true);
			expect(room.isFull()).toBe(false);
		});

		test('게임 시작 가능 여부를 확인할 수 있다', () => {
			room = new Room(1, 'owner1', 'Test Room', 4, 0, []);
			
			expect(room.canStartGame()).toBe(false); // 유저가 2명 미만
			
			const result1 = room.addUser(user1);
			const result2 = room.addUser(user2);
			
			expect(result1).toBe(true); // 첫 번째 유저 추가 성공
			expect(result2).toBe(true); // 두 번째 유저 추가 성공
			expect(room.users.length).toBe(2); // 실제로 2명이 추가되었는지 확인
			
			expect(room.canStartGame()).toBe(true); // 유저가 2명 이상
		});
	});

	describe('RoomService', () => {
		test('RoomService로 방을 생성할 수 있다', async () => {
			room = await roomService.createRoom('owner1', 'Test Room', 4);
			
			expect(room.id).toBeGreaterThan(0);
			expect(room.ownerId).toBe('owner1');
			expect(room.name).toBe('Test Room');
			expect(room.maxUserNum).toBe(4);
		});

		test('RoomService로 유저를 방에 추가할 수 있다', async () => {
			room = await roomService.createRoom('owner1', 'Test Room', 4);
			
			const result = await roomService.addUserToRoom(room.id, user1);
			
			expect(result).toBe(true);
			
			const updatedRoom = await roomService.getRoom(room.id);
			expect(updatedRoom?.users.length).toBe(1);
		});

		test('RoomService로 방을 조회할 수 있다', async () => {
			room = await roomService.createRoom('owner1', 'Test Room', 4);
			
			const foundRoom = await roomService.getRoom(room.id);
			
			expect(foundRoom).not.toBeNull();
			expect(foundRoom?.id).toBe(room.id);
		});

		test('RoomService로 유저가 속한 방을 조회할 수 있다', async () => {
			room = await roomService.createRoom('owner1', 'Test Room', 4);
			await roomService.addUserToRoom(room.id, user1);
			
			const foundRoom = await roomService.getRoomByUser(user1.id); // 고유 ID 사용
			
			expect(foundRoom).not.toBeNull();
			expect(foundRoom?.id).toBe(room.id);
		});

		test('RoomService로 모든 방을 조회할 수 있다', async () => {
			await roomService.createRoom('owner1', 'Room 1', 4);
			await roomService.createRoom('owner2', 'Room 2', 4);
			
			const allRooms = await roomService.getAllRooms();
			
			expect(allRooms.length).toBe(2);
		});

		test('RoomService로 방을 삭제할 수 있다', async () => {
			room = await roomService.createRoom('owner1', 'Test Room', 4);
			
			const result = await roomService.deleteRoom(room.id);
			
			expect(result).toBe(true);
			
			const foundRoom = await roomService.getRoom(room.id);
			expect(foundRoom).toBeNull();
		});

		test('RoomService로 방 통계를 조회할 수 있다', async () => {
			await roomService.createRoom('owner1', 'Room 1', 4);
			const room2 = await roomService.createRoom('owner2', 'Room 2', 4);
			await roomService.addUserToRoom(room2.id, user1);
			
			const stats = await roomService.getRoomStatistics();
			
			expect(stats.totalRooms).toBe(2);
			expect(stats.emptyRooms).toBe(1);
			expect(stats.activeRooms).toBe(1);
		});
	});

	describe('MemoryRoomRepository', () => {
		test('Repository로 Room을 저장하고 조회할 수 있다', async () => {
			room = new Room(1, 'owner1', 'Test Room', 4, 0, []);
			
			await repository.save(room);
			const foundRoom = await repository.findById(1);
			
			expect(foundRoom).not.toBeNull();
			expect(foundRoom?.id).toBe(1);
		});

		test('Repository로 Room 존재 여부를 확인할 수 있다', async () => {
			room = new Room(1, 'owner1', 'Test Room', 4, 0, []);
			
			expect(await repository.exists(1)).toBe(false);
			
			await repository.save(room);
			
			expect(await repository.exists(1)).toBe(true);
		});

		test('Repository로 Room 개수를 조회할 수 있다', async () => {
			expect(await repository.count()).toBe(0);
			
			await repository.save(new Room(1, 'owner1', 'Room 1', 4, 0, []));
			await repository.save(new Room(2, 'owner2', 'Room 2', 4, 0, []));
			
			expect(await repository.count()).toBe(2);
		});
	});

	describe('RoomFactory', () => {
		test('RoomFactory로 RoomService를 생성할 수 있다', () => {
			const service = RoomFactory.getRoomService();
			
			expect(service).toBeInstanceOf(RoomService);
		});

		test('RoomFactory로 Room을 생성할 수 있다', () => {
			const room = RoomFactory.createRoom('owner1', 'Test Room', 4);
			
			expect(room.ownerId).toBe('owner1');
			expect(room.name).toBe('Test Room');
			expect(room.maxUserNum).toBe(4);
		});

		test('같은 RoomService 인스턴스를 반환한다 (싱글톤)', () => {
			const service1 = RoomFactory.getRoomService();
			const service2 = RoomFactory.getRoomService();
			
			expect(service1).toBe(service2);
		});
	});
});
