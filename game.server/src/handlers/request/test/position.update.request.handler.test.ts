import positionUpdateRequestHandler from '../position.update.request.handler';

describe('position.update.request.handler', () => {
    it('userId나 roomId가 없으면 함수가 정상적으로 종료된다', () => {
        const socket: any = { userId: 'u1' }; // roomId 없음
        const gamePacket: any = { 
            payload: { 
                oneofKind: 'positionUpdateRequest', 
                positionUpdateRequest: { 
                    x: 100, 
                    y: 200 
                } 
            } 
        };

        // 에러가 발생하지 않고 정상적으로 실행되는지 확인
        expect(() => positionUpdateRequestHandler(socket, gamePacket)).not.toThrow();
    });

    it('userId와 roomId가 있으면 함수가 정상적으로 실행된다', () => {
        const socket: any = { userId: 'u1', roomId: 1 };
        const gamePacket: any = { 
            payload: { 
                oneofKind: 'positionUpdateRequest', 
                positionUpdateRequest: { 
                    x: 100, 
                    y: 200 
                } 
            } 
        };

        // 에러가 발생하지 않고 정상적으로 실행되는지 확인
        expect(() => positionUpdateRequestHandler(socket, gamePacket)).not.toThrow();
    });
});
