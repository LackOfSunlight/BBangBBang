// cardType = 20
import { getUserFromRoom, updateCharacterFromRoom } from "../utils/redis.util.js";

const cardStealthSuitEffect = async (roomId:number, userId:string) =>{
    const user = await getUserFromRoom(roomId, userId);
    // 유효성 검증
    if (!user || !user.character) return; 

}


export default cardStealthSuitEffect;