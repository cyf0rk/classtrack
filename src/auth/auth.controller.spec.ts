import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from 'db';
import { Role } from './roles.enum';

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
    const mockUser: Omit<User, 'password'> = {
      id: 1,
      email: 'test@example.com',
      role: 'user',
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
        'user',
      );
    });

    it('should handle registration with custom role', async () => {
      mockAuthService.register.mockResolvedValue({
        ...mockUser,
        role: 'admin',
      });

      const result = await controller.register({
        email: 'admin@example.com',
        password: 'password123',
        role: Role.Admin,
      });

      expect(result.role).toBe('admin');
      expect(mockAuthService.register).toHaveBeenCalledWith(
        'admin@example.com',
        'password123',
        'admin',
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
      role: 'user',
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
