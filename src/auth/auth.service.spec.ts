import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'db';
import { AuthService } from './auth.service';
import { UserService } from '../modules/user/user.service';
import type { UserResponse } from '../modules/user/types';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserService = {
    validateUser: jest.fn(),
    createUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should generate JWT token for valid user', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'password123',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = 'mock.jwt.token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = service.login(mockUser);

      expect(result).toEqual({ access_token: mockToken });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser: UserResponse = {
        id: 1,
        email: 'test@example.com',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.createUser.mockResolvedValue(mockUser);

      const result = await service.register('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
    });
  });
});
