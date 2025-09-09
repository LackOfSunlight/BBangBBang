import positionUpdateNotificationHandler from '../position.update.notification.handler';

describe('position.update.notification.handler', () => {
    it('roomId가 없으면 함수가 정상적으로 종료된다', async () => {
        const socket: any = { userId: 'u1' }; // roomId 없음
        const gamePacket: any = { 
            payload: { 
                oneofKind: 'positionUpdateNotification', 
                positionUpdateNotification: { 
                    characterPositions: [
                        { id: 'u1', x: 100, y: 200 }
                    ]
                } 
            } 
        };

        // 에러가 발생하지 않고 정상적으로 실행되는지 확인
        await expect(positionUpdateNotificationHandler(socket, gamePacket)).resolves.not.toThrow();
    });

    it('roomId가 있으면 함수가 정상적으로 실행된다', async () => {
        const socket: any = { userId: 'u1', roomId: 1 };
        const gamePacket: any = { 
            payload: { 
                oneofKind: 'positionUpdateNotification', 
                positionUpdateNotification: { 
                    characterPositions: [
                        { id: 'u1', x: 100, y: 200 }
                    ]
                } 
            } 
        };

        // 에러가 발생하지 않고 정상적으로 실행되는지 확인
        await expect(positionUpdateNotificationHandler(socket, gamePacket)).resolves.not.toThrow();
    });
});
