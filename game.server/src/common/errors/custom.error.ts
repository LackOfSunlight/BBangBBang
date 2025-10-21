class CustomError extends Error {
	code: string | number; // <= 직접 속성 선언

	constructor(code: string | number, message: string) {
		super(message);
		this.code = code;
		this.name = 'CustomError';
	}
}

export default CustomError;
