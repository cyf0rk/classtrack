import { Test, TestingModule } from '@nestjs/testing';
import { Role } from 'db';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { UserResponse } from '../modules/user/types';
import { UnauthorizedException } from '@nestjs/common';

export interface RequestWithUser extends Request {
  user: Partial<UserResponse>;
}

export type MockRequestWithUser = {
  user?: Partial<UserResponse>;
};

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  const mockDate = new Date();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const mockUser: Partial<UserResponse> = {
      id: 1,
      email: 'test@example.com',
      role: Role.USER,
      createdAt: mockDate,
      updatedAt: mockDate,
    };

    it('should register a new user successfully', async () => {
      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await controller.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockUser);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
    });

    it('should handle registration errors', async () => {
      const error = new Error('User with this email already exists');
      mockAuthService.register.mockRejectedValue(error);

      await expect(
        controller.register({
          email: 'existing@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('User with this email already exists');
    });
  });

  describe('login', () => {
    const mockUser: Partial<UserResponse> = {
      id: 1,
      email: 'test@example.com',
      role: Role.USER,
      createdAt: mockDate,
      updatedAt: mockDate,
    };

    it('should login successfully and return access token', () => {
      const mockToken = { access_token: 'mock.jwt.token' };
      mockAuthService.login.mockReturnValue(mockToken);

      const mockRequest: MockRequestWithUser = { user: mockUser };
      const result = controller.login(mockRequest as any);

      expect(result).toEqual(mockToken);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should handle login errors', async () => {
      const error = new UnauthorizedException('Invalid username or password');
      mockAuthService.login.mockRejectedValue(error);

      const mockRequest: MockRequestWithUser = {};
      await expect(controller.login(mockRequest as any)).rejects.toThrow(
        'Invalid username or password',
      );
    });
  });
});
