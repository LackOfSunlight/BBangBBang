import phaseUpdateNotificationHandler from '../phase.update.notification.handler';

// 테스트용 enum 값들
const RoomStateType = { WAIT: 0, PREPARE: 1, INGAME: 2 };
const PhaseType = { NONE_PHASE: 0, DAY: 1, EVENING: 2, END: 3 };

describe('phase.update.notification.handler', () => {
	it('roomId가 없으면 함수가 정상적으로 종료된다', async () => {
		const socket: any = { userId: 'u1' };
		const gamePacket: any = {
			payload: {
				oneofKind: 'phaseUpdateNotification',
				phaseUpdateNotification: {
					phaseType: PhaseType.DAY,
					nextPhaseAt: '0',
					characterPositions: [],
				},
			},
		};

		// 에러가 발생하지 않고 정상적으로 실행되는지 확인
		await expect(phaseUpdateNotificationHandler(socket, gamePacket)).resolves.not.toThrow();
	});

	it('roomId가 있으면 함수가 정상적으로 실행된다', async () => {
		const socket: any = { userId: 'u1', roomId: 1 };
		const gamePacket: any = {
			payload: {
				oneofKind: 'phaseUpdateNotification',
				phaseUpdateNotification: {
					phaseType: PhaseType.DAY,
					nextPhaseAt: '1000',
					characterPositions: [],
				},
			},
		};

		// 에러가 발생하지 않고 정상적으로 실행되는지 확인
		await expect(phaseUpdateNotificationHandler(socket, gamePacket)).resolves.not.toThrow();
	});
});
