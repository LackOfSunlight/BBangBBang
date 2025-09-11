// // card.bbang.effect.test.ts
// import cardBbangEffect from "../card.bbang.effect";
// import { getUserFromRoom, updateCharacterFromRoom } from "../../utils/redis.util";

// // redis.util 모듈의 필요 함수들을 mock 처리
// jest.mock("../../utils/redis.util", () => ({
//     getUserFromRoom: jest.fn(),
//     updateCharacterFromRoom: jest.fn(),
// }));


// describe("cardBbangEffect", () => {
//   const mockGetUserFromRoom = getUserFromRoom as jest.Mock;
//   const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;

//   const roomId = 1;
//   const userId = "user1";
//   const targetUserId = "user2";

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

  
//   it("유저 또는 타겟이 존재하지 않으면 아무 동작 안함", async () => {
//     mockGetUserFromRoom.mockResolvedValueOnce(null); // user 없음

//     await cardBbangEffect(roomId, userId, targetUserId);

//     expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
//   });

//   it("빵 카드가 없으면 아무 동작 안함", async () => {
//     mockGetUserFromRoom
//       .mockResolvedValueOnce({
//         character: { handCards: [{ type: 2 }], hp: 3 },
//       }) // user
//       .mockResolvedValueOnce({
//         character: { handCards: [], hp: 3 },
//       }); // target

//     await cardBbangEffect(roomId, userId, targetUserId);

//     expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
//   });

//   it("빵 카드가 있으면 제거되고 타겟 HP가 1 감소", async () => {
//     const user = {
//       character: {
//         handCards: [{ type: 1 }, { type: 2 }],
//         hp: 3,
//       },
//     };
//     const target = {
//       character: {
//         handCards: [],
//         hp: 3,
//       },
//     };

//     mockGetUserFromRoom
//       .mockResolvedValueOnce({ ...user })
//       .mockResolvedValueOnce({ ...target });

//     await cardBbangEffect(roomId, userId, targetUserId);

//     expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(
//       roomId,
//       targetUserId,
//       expect.objectContaining({ hp: 2 }) // hp -1 확인
//     );

//   });
// });
