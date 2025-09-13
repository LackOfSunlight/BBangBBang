import { validateInput } from "../validation";

describe('validateInput', () => {
  // --- email 테스트 ---
  describe('email', () => {
    it('올바른 이메일이면 true 반환', () => {
      expect(validateInput.email('test@example.com')).toBe(true);
      expect(validateInput.email('user.name+123@example.co.kr')).toBe(true);
    });

    it('잘못된 이메일이면 false 반환', () => {
      expect(validateInput.email('testexample.com')).toBe(false);
      expect(validateInput.email('user@com')).toBe(false);
      expect(validateInput.email('user@.com')).toBe(false);
      expect(validateInput.email('')).toBe(false);
    });
  });

  // --- nickName 테스트 ---
  describe('nickName', () => {
    it('4~20자 한글/영문/숫자/언더스코어이면 true 반환', () => {
      expect(validateInput.nickName('홍길동이')).toBe(true);
      expect(validateInput.nickName('user_123')).toBe(true);
      expect(validateInput.nickName('UserName20')).toBe(true);
    });

    it('잘못된 닉네임이면 false 반환', () => {
      expect(validateInput.nickName('ab')).toBe(false);        // 4자 미만
      expect(validateInput.nickName('user!name')).toBe(false); // 특수문자 포함
      expect(validateInput.nickName('')).toBe(false);
    });
  });

  // --- password 테스트 ---
  describe('password', () => {
    it('8자 이상 영문+숫자+특수문자 포함이면 true 반환', () => {
      expect(validateInput.password('Abcdef1!')).toBe(true);
      expect(validateInput.password('Pass1234@')).toBe(true);
    });

    it('조건을 만족하지 않으면 false 반환', () => {
      expect(validateInput.password('abcdefg')).toBe(false);       // 숫자/특수문자 없음
      expect(validateInput.password('12345678')).toBe(false);      // 영문/특수문자 없음
      expect(validateInput.password('abcdef12')).toBe(false);      // 특수문자 없음
      expect(validateInput.password('')).toBe(false);
    });
  });
});
