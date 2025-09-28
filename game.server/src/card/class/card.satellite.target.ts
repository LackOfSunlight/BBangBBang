import { CardCategory } from '../../enums/card.category';
import { AnimationType, CardType, CharacterStateType } from '../../generated/common/enums';
import { playAnimationHandler } from '../../handlers/play.animation.handler';
import roomManager from '../../managers/room.manager';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { checkAndEndGameIfNeeded } from '../../services/game.end.service';
import { ICard, IPeriodicEffectCard } from '../../type/card';

export class SatelliteTargetCard implements ICard, IPeriodicEffectCard {
	type: CardType = CardType.SATELLITE_TARGET;
	cardCategory: CardCategory = CardCategory.targetCard;

	public useCard(room: Room, user: User, target: User): boolean {
		if (!target.character) {
			return false;
		}

		// 이미 디버프가 있는지 확인
		if (target.character.debuffs.includes(CardType.SATELLITE_TARGET)) {
			return true;
		}

		room.removeCard(user, CardType.SATELLITE_TARGET);

		// 디버프 추가
		target.character.debuffs.push(CardType.SATELLITE_TARGET);

		console.log(`[위성 타겟] ${user.nickname}님이 위성타겟을 사용했습니다.`);
		return true;
	}

	// 하루가 시작될 때 호출되는 효과
	public async onNewDay(room: Room): Promise<Room> {
		return this.checkSatelliteTargetEffect(room);
	}

	// 위성 타겟 효과 체크 (하루 시작 시 호출)
	public async checkSatelliteTargetEffect(room: Room): Promise<Room> {
		// 위성 타겟 디버프를 가진 유저들 찾기
		const usersWithDebuff = room.users.filter(
			(user) => user.character && user.character.debuffs.includes(CardType.SATELLITE_TARGET),
		);

		await Promise.all(
			usersWithDebuff.map((user) => this.processSatelliteTargetEffect(user, room, room.users)),
		);

		return room;
	}

	// 개별 유저의 위성 타겟 효과 처리
	public async processSatelliteTargetEffect(user: User, room: Room, allUsers: any[]) {
		try {
			const target = roomManager.getUserFromRoom(room.id, user.id);
			if (!target || !target.character) return;

			const probability = 0.03; // 대낮에 번개 맞을 확률
			const damage = 3; // 번개 데미지

			// 지정 확률로 효과 발동
			const isEffectTriggered = Math.random() < probability;

			if (isEffectTriggered) {
				// 효과 발동: 애니메이션 재생 후 HP 데미지 감소

				// 1. 위성 타겟 애니메이션 전송
				playAnimationHandler(allUsers, user.id, AnimationType.SATELLITE_TARGET_ANIMATION);

				// 2. 애니메이션 재생 시간 대기 (2초)
				await new Promise((resolve) => setTimeout(resolve, 2000));

				// 3. 실제 효과 적용
				target.character.takeDamage(damage);

				// 4. 디버프 제거 (효과 발동 후 제거)
				const debuffIndex = target.character.debuffs.indexOf(CardType.SATELLITE_TARGET);
				if (debuffIndex > -1) {
					target.character.debuffs.splice(debuffIndex, 1);
				}

				// 게임 종료 조건 검사
				await checkAndEndGameIfNeeded(room.id);
			} else {
				// 효과 미발동: 다음 유저에게 디버프 이전

				// 1. 현재 타겟의 디버프 제거
				const debuffIndex = target.character.debuffs.indexOf(CardType.SATELLITE_TARGET);
				if (debuffIndex > -1) {
					target.character.debuffs.splice(debuffIndex, 1);
				}

				roomManager.updateCharacterFromRoom(room.id, user.id, target.character);

				// 2. 다음 차례에 있는 유저 찾기
				const currentUserIndex = allUsers.findIndex((u) => u.id === user.id);
				if (currentUserIndex === -1) return;

				const nextUserIndex = (currentUserIndex + 1) % allUsers.length;
				const nextUserId = allUsers[nextUserIndex].id;
				const nextUser = roomManager.getUserFromRoom(room.id, nextUserId);

				if (!nextUser || !nextUser.character) return;

				// 3. 찾은 다음 유저에게 디버프 추가
				if (!nextUser.character.debuffs.includes(CardType.SATELLITE_TARGET)) {
					nextUser.character.debuffs.push(CardType.SATELLITE_TARGET);
				}
			}
		} catch (error) {
			// 에러 처리
		}
	}
}
