// import gameEndNotificationHandler from '../game.end.notification.handler';

// describe('game.end.notification.handler', () => {
// 	it('roomId가 없으면 함수가 정상적으로 종료된다', async () => {
// 		const socket: any = { userId: 'u1' };
// 		const gamePacket: any = {
// 			payload: {
// 				oneofKind: 'gameEndNotification',
// 				gameEndNotification: {
// 					winners: [],
// 					winType: 0,
// 				},
// 			},
// 		};

// 		// 에러가 발생하지 않고 정상적으로 실행되는지 확인
// 		await expect(gameEndNotificationHandler(socket, gamePacket)).resolves.not.toThrow();
// 	});

// 	it('roomId가 있으면 함수가 정상적으로 실행된다', async () => {
// 		const socket: any = { userId: 'u1', roomId: 1 };
// 		const gamePacket: any = {
// 			payload: {
// 				oneofKind: 'gameEndNotification',
// 				gameEndNotification: {
// 					winners: ['u1'],
// 					winType: 1,
// 				},
// 			},
// 		};

// 		// 에러가 발생하지 않고 정상적으로 실행되는지 확인
// 		await expect(gameEndNotificationHandler(socket, gamePacket)).resolves.not.toThrow();
// 	});
// });
