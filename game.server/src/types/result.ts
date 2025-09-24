/**
 * 함수형 프로그래밍의 Result 패턴을 구현합니다.
 * 예외 대신 명시적인 성공/실패 값을 반환하여 에러 처리를 안전하게 만듭니다.
 */
export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E = string> = Ok<T> | Err<E>;

/**
 * 성공 결과를 생성합니다.
 * 계산이 성공적으로 완료되었을 때 사용합니다.
 */
export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });

/**
 * 실패 결과를 생성합니다.
 * 계산 중 오류가 발생했을 때 사용합니다.
 */
export const err = <E>(error: E): Err<E> => ({ ok: false, error });
