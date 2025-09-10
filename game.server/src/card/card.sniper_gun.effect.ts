// cardType = 13
import { getUserFromRoom, updateCharacterFromRoom } from "../utils/redis.util.js";

const cardSniperGunEffect = async (roomId:number, userId:string) =>{
    const user = await getUserFromRoom(roomId, userId);

    // 유효성 검증
    if (!user || !user.character) return; 

}

export default cardSniperGunEffect;