import { saveRoom, getRoom } from "../../redis.util";
import { Room } from "../../../models/room.model";
import { RoomStateType } from "../../../generated/common/enums";
import { User } from "../../../models/user.model";

  describe('Redis Utility Functions', () => {
    it('should save a room and retrieve it correctly', async () => {
      // 여기에 saveRoom 및 getRoom 함수를 테스트하는 코드를 작성합니다.
      // 예시:

      const user:User ={
         id: '육근무',
         nickname: 'qwer1234',
         character: undefined,
      }
      const user2:User ={
        id:'김양훈',
        nickname: 'dkdkdk',
        character: undefined,
      }
      
      const room:Room = {
            id: 0,
            ownerId: 'testRoom',
            name: '테스트 방입니다',
            maxUserNum: 6,
            state: RoomStateType.WAIT,
            users: [user, user2],
      }

      await saveRoom(room);
      const retrievedRoom = await getRoom(room.id);

      expect(retrievedRoom).toEqual(room);
    });

    // 다른 테스트 케이스들을 여기에 추가할 수 있습니다.
  });
