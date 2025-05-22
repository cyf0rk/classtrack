import { Test, TestingModule } from '@nestjs/testing';
import { Role } from 'db';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { UserResponse } from '../modules/user/types';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

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
    const mockUser: UserResponse = {
      id: 1,
      email: 'test@example.com',
      role: Role.USER as Role,
      createdAt: new Date(),
      updatedAt: new Date(),
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
    const mockUser = {
      email: 'test@example.com',
      password: 'hashedPassword',
      role: Role.USER,
    };

    it('should login successfully and return access token', async () => {
      const mockToken = { access_token: 'mock.jwt.token' };
      mockAuthService.login.mockResolvedValue(mockToken);

      const result = await controller.login({ user: mockUser });

      expect(result).toEqual(mockToken);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should handle login errors', async () => {
      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login({ user: null })).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
