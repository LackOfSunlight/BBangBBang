import { GameSocket } from '../Type/game.socket';
import { GlobalFailCode } from '../Generated/common/enums';
import { reactionResponsePacketForm, useCardResponsePacketForm } from '../Converter/packet.form';
import { sendData } from '../Sockets/send.data';
import { GamePacketType } from '../Enums/gamePacketType';

/** 오류코드: 잘못된요청을 일괄 처리하기 위한 함수 */
export const invalidRequest = (
	socket: GameSocket,
	failcode: GlobalFailCode,
	gamePacketType: GamePacketType,
) => {
	let wrongDTO; // 초기화
	switch (gamePacketType) {
		case GamePacketType.useCardResponse:
			wrongDTO = useCardResponsePacketForm(false, failcode);
			break;
		case GamePacketType.reactionResponse:
			wrongDTO = reactionResponsePacketForm(false, failcode);
			break;
		default:
			return;
	}

	if (wrongDTO) sendData(socket, wrongDTO, gamePacketType);
};
