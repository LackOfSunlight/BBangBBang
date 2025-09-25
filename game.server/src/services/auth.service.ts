import { prisma } from '../utils/db';
import * as bcrypt from 'bcrypt';
import { C2SLoginRequest, C2SRegisterRequest } from '../generated/packet/auth';
import { GlobalFailCode } from '../generated/common/enums';
import { Result, ok, err } from '../types/result';

/**
 * 인증 관련 서비스입니다.
 * GameActionService 패턴에 따라 비즈니스 로직을 처리합니다.
 * 
 * 주요 기능:
 * - 사용자 로그인/회원가입/로그아웃
 * - 비밀번호 검증
 * - 토큰 관리
 * - 사용자 데이터 조회
 */
export class AuthService {
  /**
   * 이메일로 사용자 데이터를 조회합니다.
   * GameActionService 패턴에 따라 Result 타입을 반환합니다.
   */
  async getUserByEmail(email: string): Promise<Result<any, string>> {
    try {
      const userData = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          nickname: true,
          password: true,
          token: true
        }
      });

      if (!userData) {
        return err('USER_NOT_FOUND');
      }

      return ok(userData);
    } catch (error) {
      console.error('[AuthService] 사용자 데이터 조회 실패:', error);
      return err('DATABASE_ERROR');
    }
  }

  /**
   * 사용자 ID로 사용자 데이터를 조회합니다.
   * GameActionService 패턴에 따라 Result 타입을 반환합니다.
   */
  async getUserByUserId(userId: number): Promise<Result<any, string>> {
    try {
      const userData = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nickname: true,
          token: true
        }
      });

      if (!userData) {
        return err('USER_NOT_FOUND');
      }

      return ok(userData);
    } catch (error) {
      console.error('[AuthService] 사용자 데이터 조회 실패:', error);
      return err('DATABASE_ERROR');
    }
  }

  /**
   * 비밀번호를 검증합니다.
   * GameActionService 패턴에 따라 Result 타입을 반환합니다.
   */
  async checkUserPassword(req: C2SLoginRequest, hashedPassword: string): Promise<Result<boolean, string>> {
    try {
      const passwordCheck = await bcrypt.compare(req.password, hashedPassword);
      return ok(passwordCheck);
    } catch (error) {
      console.error('[AuthService] 비밀번호 검증 실패:', error);
      return err('PASSWORD_VERIFICATION_FAILED');
    }
  }

  /**
   * 사용자 존재 여부를 확인합니다.
   * GameActionService 패턴에 따라 Result 타입을 반환합니다.
   */
  async checkUserExists(email: string, nickname: string): Promise<Result<boolean, string>> {
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { nickname }
          ]
        }
      });

      return ok(!!existingUser);
    } catch (error) {
      console.error('[AuthService] 사용자 존재 확인 실패:', error);
      return err('DATABASE_ERROR');
    }
  }

  /**
   * 입력 필드 유효성을 검증합니다.
   * GameActionService 패턴에 따라 Result 타입을 반환합니다.
   */
  validateInputFields(email: string, nickname: string, password: string): Result<boolean, string> {
    if (!email || !nickname || !password) {
      return err('INVALID_INPUT_FIELDS');
    }
    return ok(true);
  }

  /**
   * 새로운 사용자를 생성합니다.
   * GameActionService 패턴에 따라 Result 타입을 반환합니다.
   */
  async createUser(req: C2SRegisterRequest): Promise<Result<any, string>> {
    try {
      // 비밀번호 해시
      const hashedPassword = await bcrypt.hash(req.password, 12);

      // DB에 사용자 생성
      const userData = await prisma.user.create({
        data: {
          email: req.email,
          nickname: req.nickname,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          nickname: true
        }
      });

      return ok(userData);
    } catch (error) {
      console.error('[AuthService] 사용자 생성 실패:', error);
      return err('USER_CREATION_FAILED');
    }
  }

  /**
   * 사용자 토큰을 설정합니다.
   * GameActionService 패턴에 따라 Result 타입을 반환합니다.
   */
  async setTokenService(userId: number, userEmail: string): Promise<Result<string, string>> {
    try {
      const token = await bcrypt.hash(userEmail, 4);

      await prisma.user.update({
        where: { id: userId },
        data: { token }
      });

      return ok(token);
    } catch (error) {
      console.error('[AuthService] 토큰 설정 실패:', error);
      return err('TOKEN_SET_FAILED');
    }
  }

  /**
   * 사용자 토큰을 제거합니다.
   * GameActionService 패턴에 따라 Result 타입을 반환합니다.
   */
  async removeTokenUserDB(userId: number): Promise<Result<void, string>> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { token: null }
      });
      return ok(undefined);
    } catch (error) {
      console.error('[AuthService] 토큰 제거 실패:', error);
      return err('TOKEN_REMOVAL_FAILED');
    }
  }

  /**
   * 모든 토큰을 정리합니다.
   * GameActionService 패턴에 따라 Result 타입을 반환합니다.
   */
  async cleanupAllTokens(): Promise<Result<number, string>> {
    try {
      const result = await prisma.user.updateMany({
        where: {
          token: { not: null }
        },
        data: {
          token: null
        }
      });

      console.log(`토큰 정리 완료: ${result.count}개의 토큰이 정리되었습니다.`);
      return ok(result.count);
    } catch (error) {
      console.error('[AuthService] 토큰 정리 실패:', error);
      return err('TOKEN_CLEANUP_FAILED');
    }
  }
}

// 싱글톤 인스턴스 생성
export const authService = new AuthService();

// 기존 함수들도 export (하위 호환성)
export const getUserByEmail = authService.getUserByEmail.bind(authService);
export const getUserByUserId = authService.getUserByUserId.bind(authService);
export const checkUserPassword = authService.checkUserPassword.bind(authService);
export const checkUserExists = authService.checkUserExists.bind(authService);
export const validateInputFields = authService.validateInputFields.bind(authService);
export const createUser = authService.createUser.bind(authService);
export const setTokenService = authService.setTokenService.bind(authService);
export const removeTokenUserDB = authService.removeTokenUserDB.bind(authService);
export const cleanupAllTokens = authService.cleanupAllTokens.bind(authService);
