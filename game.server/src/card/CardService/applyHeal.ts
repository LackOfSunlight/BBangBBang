// src/effects/stat.effects.ts

import { User } from '../../models/user.model';
import getMaxHp from '../../init/character.Init';
import { CharacterData } from '../../generated/common/types';

/**
 * 대상 유저의 HP를 주어진 양만큼 회복시킵니다.
 * @param character HP를 회복할 유저
 * @param amount 회복량
 * @returns 성공 여부
 */
export const applyHeal = (character: CharacterData, amount: number): boolean => {
    if (!character) {
        console.warn(`[applyHeal] 유저의 캐릭터 정보가 없습니다.`);
        return false;
    }

    const maxHp = getMaxHp(character.characterType);
    if (character.hp >= maxHp) {
        console.log(`[applyHeal] 체력이 최대치(${maxHp})에 도달하여 회복할 수 없습니다.`);
        return false;
    }

    character.hp = Math.min(character.hp + amount, maxHp);
    console.log(`[applyHeal] ${character.characterType}의 체력이 ${amount}만큼 회복되었습니다.`);
    return true;
};