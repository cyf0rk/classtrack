import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;
  const mockDate = new Date();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const expectedUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed',
        role: 'user',
        createdAt: mockDate,
        updatedAt: mockDate,
        applications: [],
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(expectedUser);

      const user = await service.findByEmail('test@example.com');
      const findSpy = jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue(expectedUser);

      const { password: _, ...expectedResponse } = expectedUser;
      expect(user).toEqual(expectedResponse);
      expect(findSpy).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const user = await service.findByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a user and return without password', async () => {
      const inputEmail = 'new@example.com';
      const inputPassword = 'password123';
      const hashedPassword = 'hashed_password';

      // Mock bcrypt.genSalt and hash
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      const createdUser = {
        id: 2,
        email: inputEmail,
        password: hashedPassword,
        role: 'user',
        createdAt: mockDate,
        updatedAt: mockDate,
        applications: [],
      };

      jest.spyOn(prisma.user, 'create').mockResolvedValue(createdUser);

      const result = await service.createUser(inputEmail, inputPassword);
      const createSpy = jest
        .spyOn(prisma.user, 'create')
        .mockResolvedValue(createdUser);

      expect(createSpy).toHaveBeenCalledWith({
        data: {
          email: inputEmail,
          password: hashedPassword,
          role: 'user',
        },
      });

      const { password: _, ...expectedResponse } = createdUser;
      expect(result).toEqual(expectedResponse);
    });

    it('should create an admin user when role is specified', async () => {
      const inputEmail = 'admin@example.com';
      const inputPassword = 'adminpass';
      const hashedPassword = 'hashed_admin_password';

      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      const createdUser = {
        id: 3,
        email: inputEmail,
        password: hashedPassword,
        role: 'admin',
        createdAt: mockDate,
        updatedAt: mockDate,
        applications: [],
      };

      jest.spyOn(prisma.user, 'create').mockResolvedValue(createdUser);

      const result = await service.createUser(
        inputEmail,
        inputPassword,
        'admin',
      );
      const createSpy = jest
        .spyOn(prisma.user, 'create')
        .mockResolvedValue(createdUser);

      expect(createSpy).toHaveBeenCalledWith({
        data: {
          email: inputEmail,
          password: hashedPassword,
          role: 'admin',
        },
      });

      const { password: _, ...expectedResponse } = createdUser;
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const email = 'valid@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const userInDb = {
        id: 4,
        email,
        password: hashedPassword,
        role: 'user',
        createdAt: mockDate,
        updatedAt: mockDate,
        applications: [],
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(userInDb);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser(email, password);

      const { password: _, ...expectedResponse } = userInDb;
      expect(result).toEqual(expectedResponse);
    });

    it('should return null when user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'anypassword',
      );

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      const email = 'valid@example.com';
      const correctPassword = 'correctpass';
      const wrongPassword = 'wrongpass';
      const hashedPassword = await bcrypt.hash(correctPassword, 10);

      const userInDb = {
        id: 5,
        email,
        password: hashedPassword,
        role: 'user',
        createdAt: mockDate,
        updatedAt: mockDate,
        applications: [],
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(userInDb);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser(email, wrongPassword);

      expect(result).toBeNull();
    });
  });
});
