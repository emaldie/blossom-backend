import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '@blossom/common';
import { CreateUserDto, UpdateUserDto } from '@blossom/contracts';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((password, saltRounds) => {
    return Promise.resolve(
      `$2b$${saltRounds}$SeTm07glhmcV/i9nC4P8IOjLY4XTbXHDxV8jlufgVxQri2iRiOpnW`,
    );
  }),
}));

describe('UsersService Integration', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  // Mock User data
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2b$10$SeTm07glhmcV/i9nC4P8IOjLY4XTbXHDxV8jlufgVxQri2iRiOpnW',
    created_at: new Date(),
  };

  const mockUsers = [
    mockUser,
    {
      id: 2,
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: '$2b$10$SeTm07glhmcV/i9nC4P8IOjLY4XTbXHDxV8jlufgVxQri2iRiOpnW',
      created_at: new Date(),
    },
  ];

  // Create a mock PrismaService that simulates database operations
  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should hash password and create user in database', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456789',
      };

      const currentDate = new Date().toISOString();
      const expectedUser = {
        id: 1,
        name: createUserDto.name,
        email: createUserDto.email,
        password:
          '$2b$10$SeTm07glhmcV/i9nC4P8IOjLY4XTbXHDxV8jlufgVxQri2iRiOpnW',
        created_at: currentDate,
      };

      // Mock the current date
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(currentDate);

      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('123456789', 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password:
            '$2b$10$SeTm07glhmcV/i9nC4P8IOjLY4XTbXHDxV8jlufgVxQri2iRiOpnW',
          created_at: currentDate,
        },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should handle database errors during user creation', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456789',
      };

      const error = new Error('Database error');
      jest.spyOn(console, 'log').mockImplementation(() => {});
      mockPrismaService.user.create.mockRejectedValue(error);

      const result = await service.create(createUserDto);

      expect(console.log).toHaveBeenCalledWith(error);
      expect(result).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should retrieve all users from database', async () => {
      const expectedUsers = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          password:
            '$2b$10$SeTm07glhmcV/i9nC4P8IOjLY4XTbXHDxV8jlufgVxQri2iRiOpnW',
          created_at: new Date(),
        },
        {
          id: 2,
          name: 'Jane Doe',
          email: 'jane@example.com',
          password:
            '$2b$10$SeTm07glhmcV/i9nC4P8IOjLY4XTbXHDxV8jlufgVxQri2iRiOpnW',
          created_at: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(expectedUsers);

      const result = await service.findAll();

      expect(prismaService.user.findMany).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('findOne', () => {
    it('should retrieve a user by id from database', async () => {
      const findOneUserDto: Prisma.UserWhereUniqueInput = { id: 1 };
      const expectedUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password:
          '$2b$10$SeTm07glhmcV/i9nC4P8IOjLY4XTbXHDxV8jlufgVxQri2iRiOpnW',
        created_at: new Date(),
      };

      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(expectedUser);

      const result = await service.findOne(findOneUserDto);

      expect(prismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: findOneUserDto,
      });
      expect(result).toEqual(expectedUser);
    });

    it('should throw an error when user not found in database', async () => {
      const findOneUserDto: Prisma.UserWhereUniqueInput = { id: 999 };
      const error = new Error('User not found');

      mockPrismaService.user.findUniqueOrThrow.mockRejectedValue(error);

      await expect(service.findOne(findOneUserDto)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('update', () => {
    it('should update a user in database', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      const expectedUser = {
        id: 1,
        name: 'Updated Name',
        email: 'john@example.com',
        password:
          '$2b$10$SeTm07glhmcV/i9nC4P8IOjLY4XTbXHDxV8jlufgVxQri2iRiOpnW',
        created_at: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(expectedUser);

      const result = await service.update(1, updateUserDto);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateUserDto,
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('remove', () => {
    it('should delete a user from database', async () => {
      const expectedUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password:
          '$2b$10$SeTm07glhmcV/i9nC4P8IOjLY4XTbXHDxV8jlufgVxQri2iRiOpnW',
        created_at: new Date(),
      };

      mockPrismaService.user.delete.mockResolvedValue(expectedUser);

      const result = await service.remove(1);

      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(expectedUser);
    });
  });
});
