import { Test, TestingModule } from '@nestjs/testing';
import { Role } from 'db';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAdmin', () => {
    const mockDate = new Date();
    const createAdminDto: CreateAdminUserDto = {
      email: 'admin@example.com',
      password: 'admin123',
      role: Role.ADMIN,
    };

    const expectedResponse = {
      id: 1,
      email: createAdminDto.email,
      role: Role.ADMIN,
      createdAt: mockDate,
      updatedAt: mockDate,
    };

    it('should create an admin user successfully', async () => {
      mockUserService.createUser.mockResolvedValue(expectedResponse);

      const result = await controller.createAdmin(createAdminDto);

      expect(result).toEqual(expectedResponse);
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        createAdminDto.email,
        createAdminDto.password,
        createAdminDto.role,
      );
    });

    it('should throw an error if user creation fails', async () => {
      const error = new Error('User with this email already exists');
      mockUserService.createUser.mockRejectedValue(error);

      await expect(controller.createAdmin(createAdminDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });
});
