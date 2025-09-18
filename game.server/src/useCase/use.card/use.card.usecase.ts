import { getRoom } from '../../utils/room.utils';
import { CardType, GlobalFailCode } from '../../generated/common/enums';
import { User } from '../../models/user.model';

import { applyCardEffect } from '../../utils/apply.card.effect';

interface UseCardInput {
	userId: string;
	roomId: number;
	cardType: CardType;
	targetUserId?: string;
}

interface UseCardOutput {
	useCardResponse: {
		success: boolean;
		GlobalFailCode: GlobalFailCode;
	};
	useCardNotification?: {
		cardType: CardType;
		userId: string;
		targetUserId?: string;
	};
	userUpdateNotification?: {
		user: User[];
	};
}

export const useCardUseCase = async (input: UseCardInput): Promise<UseCardOutput> => {
	const { userId, roomId, cardType, targetUserId } = input;

	const room = await getRoom(roomId);
	if (!room) {
		return { useCardResponse: { success: false, GlobalFailCode: GlobalFailCode.ROOM_NOT_FOUND } };
	}

	// 카드 타입 검증
	if (cardType === CardType.NONE) {
		console.warn(`[useCardHandler] 잘못된 카드 타입 요청: NONE`);
		return { useCardResponse: { success: false, GlobalFailCode: GlobalFailCode.INVALID_REQUEST } };
	}

	console.log(
		`[useCardHandler] 유저 ${userId} 가 ${targetUserId} 를 대상으로 ${CardType[cardType]} 카드를 사용하려 합니다)`,
	);

	await applyCardEffect(roomId, cardType, userId, targetUserId!);

	return {
		useCardResponse: { success: true, GlobalFailCode: GlobalFailCode.NONE_FAILCODE },
		useCardNotification: { cardType: cardType, userId: userId, targetUserId: targetUserId },
		userUpdateNotification: { user: room.users },
	};
};
