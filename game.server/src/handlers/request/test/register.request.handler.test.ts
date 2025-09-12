import { GamePacketType } from '../../../enums/gamePacketType';
import { GlobalFailCode } from '../../../generated/common/enums'; // GlobalFailCode 추가
import { GamePacket } from '../../../generated/gamePacket';
import { GameSocket } from '../../../type/game.socket';
import registerRequestHandler from '../register.request.handler';
import registerResponseHandler from '../../response/register.response.handler'; // 모킹을 위해 import
import { getGamePacketType } from '../../../utils/type.converter'; // 모킹을 위해 import

jest.mock('../../response/register.response.handler');
jest.mock('../../../utils/type.converter');

describe('register.requser.handler test', () => {
	it('모든 필드 미입력', async () => {
		const socket = {} as GameSocket;
		const gamePack: GamePacket = {
			payload: {
				oneofKind: GamePacketType.registerRequest,
				registerRequest: {
					email: '',
					nickname: '',
					password: '',
				},
			},
		};
		(getGamePacketType as jest.Mock).mockReturnValue(gamePack.payload);

		await registerRequestHandler(socket, gamePack);

		expect(registerResponseHandler).toHaveBeenCalledWith(
			socket,
			expect.objectContaining({
				payload: {
					oneofkind: GamePacketType.registerResponse,
					registerResponse: {
						success: false,
						message: '모든 필드가 입력되지 않았습니다.',
						failCode: GlobalFailCode.REGISTER_FAILED,
					},
				},
			}),
		);
	});
});
