/**
 * 유효성 검증을 위한 정규표현식
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USER_ID_REGEX = /^[a-zA-Z0-9_]{4,20}$/; // 4-20자, 영문+숫자+언더스코어
const PASSWORD_REGEX =
	/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/])[A-Za-z\d~`!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]{8,}$/; // 8자 이상, 영문+숫자+특수문자

/**
 * 입력값 형식 검증용 정규표현식
 *
 * - email: 이메일 형식 확인 (예: test@example.com)
 * - userId: 4-20자 영문/숫자/언더스코어만 허용
 * - password: 8자 이상, 영문+숫자+특수문자 포함 필수
 */
const validateInput = {
	email: (email: string) => EMAIL_REGEX.test(email),
	nickName: (userId: string) => USER_ID_REGEX.test(userId),
	password: (password: string) => PASSWORD_REGEX.test(password),
};

export { validateInput };
