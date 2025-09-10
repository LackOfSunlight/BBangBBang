// cardType = 17
import { getUserFromRoom, updateCharacterFromRoom } from "../utils/redis.util.js";

const cardLaserPointerEffect = async (roomId:number, userId:string) =>{
    const user = await getUserFromRoom(roomId, userId);
    // 유효성 검증
    if (!user || !user.character) return; 

}


export default cardLaserPointerEffect;