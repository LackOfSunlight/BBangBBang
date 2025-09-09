// cardType = 17
import { getUserFromRoom, updateCharacterFromRoom } from "../utils/redis.util.js";

const cardLaserPointerEffect = async (roomId:number, userId:string, targetUserId:string) =>{
    const user = await getUserFromRoom(roomId, userId);
    const target = await getUserFromRoom(roomId, targetUserId);
    // 유효성 검증
    if (!user || !target || !target.character) return; 

}


export default cardLaserPointerEffect;