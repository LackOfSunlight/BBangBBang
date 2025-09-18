// import { GameSocket } from "../../type/game.socket.js";
// import { C2SGamePrepareRequest } from "../../generated/packet/game_actions.js";
// import { GamePacket } from "../../generated/gamePacket.js";
// import { getGamePacketType } from "../../utils/type.converter.js";
// import { GamePacketType, gamePackTypeSelect } from "../../enums/gamePacketType.js";
// import { CharacterStateType, CharacterType, GlobalFailCode, RoleType } from "../../generated/common/enums.js";
// import gamePrepareResponseHandler from "../response/game.prepare.response.handler.js";
// import { getRoom, saveRoom } from "../../utils/redis.util.js";
// import { Room } from "../../models/room.model.js";
// import { CharacterData } from "../../generated/common/types.js";
// import characterType from "../../data/characterType.json"
// import { CharacterInfo } from "../../type/character.info.js";
// import gamePrepareNotificationHandler, { setGamePrepareNotification } from "../notification/game.prepare.notification.handler.js";
// import { RoomStateType } from "../../generated/common/enums.js";


// const gamePrepareRequestHandler = async (socket:GameSocket, gamePacket:GamePacket) =>{

//     const payload =  getGamePacketType(gamePacket, gamePackTypeSelect.gamePrepareRequest);

//     if(!payload || !socket.roomId){
//         return gamePrepareResponseHandler(socket, setGamePrepareResponse(false, GlobalFailCode.UNKNOWN_ERROR));
//     }

//     const room: Room | null = await getRoom(socket.roomId);

//     if(!room){
//         return gamePrepareResponseHandler(socket, setGamePrepareResponse(false, GlobalFailCode.ROOM_NOT_FOUND));
//     }

//     // if(room.maxUserNum > room.users.length){
//     //     console.log('인원수가 적습니다.');
//     //     return gamePrepareResponseHandler(socket, setGamePrepareResponse(false, GlobalFailCode.INVALID_REQUEST));
//     // }

//     const roles: Record<number, RoleType[]> = {
//         2: [RoleType.TARGET, RoleType.HITMAN],
//         3: [RoleType.TARGET, RoleType.PSYCHOPATH, RoleType.HITMAN],
//         4: [RoleType.TARGET, RoleType.PSYCHOPATH, RoleType.HITMAN, RoleType.HITMAN],
//         5: [RoleType.TARGET, RoleType.PSYCHOPATH, RoleType.HITMAN, RoleType.HITMAN, RoleType.BODYGUARD],
//         6: [RoleType.TARGET, RoleType.PSYCHOPATH, RoleType.HITMAN, RoleType.HITMAN, RoleType.HITMAN, RoleType.BODYGUARD],
//         7: [RoleType.TARGET, RoleType.PSYCHOPATH, RoleType.HITMAN, RoleType.HITMAN, RoleType.HITMAN, RoleType.HITMAN, RoleType.BODYGUARD]
//     }


//     const characterList: CharacterInfo[] = (characterType as any[]).map(char => ({
//         ...char,
//         characterType: CharacterType[char.characterType as keyof typeof CharacterType]
//     }));

//     const role = roles[room.users.length];

//     room.users.forEach((user)=>{
//        const randomRoleIndex = Math.floor(Math.random()*role.length);
//        const randomCharacterIndex = Math.floor(Math.random()*characterList.length);

//        const characterData: CharacterData = {
//         characterType: characterList[randomCharacterIndex].characterType,
//         roleType: role[randomRoleIndex],
//         hp: characterList[randomCharacterIndex].hp,
//         stateInfo:{
//             state: CharacterStateType.NONE_CHARACTER_STATE,
//             nextState: CharacterStateType.NONE_CHARACTER_STATE,
//             nextStateAt: '0',
//             stateTargetUserId: '0',
//         } ,
//         weapon: 0,
//         equips:[],
//         debuffs:[],
//         handCards:[],
//         bbangCount: 0,
//         handCardsCount: 0,
//        }

//        user.character = characterData;

//        role.splice(randomRoleIndex,1);
//        characterList.splice(randomCharacterIndex,1);
       
//     });

//     room.state = RoomStateType.INGAME;

//     await saveRoom(room);

//     gamePrepareResponseHandler(socket, setGamePrepareResponse(true, GlobalFailCode.NONE_FAILCODE));
//     gamePrepareNotificationHandler(socket, setGamePrepareNotification(room));

// }



// const setGamePrepareResponse = (success:boolean, failCode: GlobalFailCode) =>{
//     const newGamePacket:GamePacket = {
//         payload:{
//             oneofKind: GamePacketType.gamePrepareResponse,
//             gamePrepareResponse:{
//                 success,
//                 failCode,
//             }
//         }
//     };

//     return newGamePacket;

// }

// export default  gamePrepareRequestHandler;
