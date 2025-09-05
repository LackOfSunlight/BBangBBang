/**
 * 입력값 형식 검증용 정규표현식
 *
 * - email: 이메일 형식 확인 (예: test@example.com)
 * - userId: 4-20자 영문/숫자/언더스코어만 허용
 * - password: 8자 이상, 영문+숫자+특수문자 포함 필수
 */
declare const validateInput: {
    email: (email: string) => boolean;
    nickName: (userId: string) => boolean;
    password: (password: string) => boolean;
};
export { validateInput };
//# sourceMappingURL=validation.d.ts.map