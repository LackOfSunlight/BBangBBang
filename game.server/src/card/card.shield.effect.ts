// cardType = 3
import { CharacterStateType } from "../generated/common/enums.js";
import { CheckBigBbangService } from "../services/bigbbang.check.service.js";
import { getRoom, saveRoom } from "../utils/redis.util.js";


const cardShieldEffect = async (roomId:number, userId:string, targetUserId:string) =>{
    let room = await getRoom(roomId);

    if(!room) return;

    const user = room.users.find(u => u.id === userId);

    const stateInfo = user?.character?.stateInfo;

    if(stateInfo){
        stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
        stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
        stateInfo.nextStateAt = '0';
        stateInfo.stateTargetUserId = '0';
    }

    room = await CheckBigBbangService(room);

    await saveRoom(room);

}


export default cardShieldEffect;