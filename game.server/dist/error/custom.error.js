class CustomError extends Error {
    code; // <= 직접 속성 선언
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'CustomError';
    }
}
export default CustomError;
