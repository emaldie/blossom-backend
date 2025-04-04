import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '@blossom/common';
import { CreateUserDto, UpdateUserDto } from '@blossom/contracts';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((password, saltRounds) => {
    return Promise.resolve(`$2b$${saltRounds}$SeTm07glhmcV/i9nC4P8IOjLY4XTbXHDxV8jlufgVxQri2iRiOpnW`);
  }),
}));

describe('UsersService', () => {
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

  const mockPrismaService = {
    user: {
      create: jest.fn().mockResolvedValue(mockUser),
      findMany: jest.fn().mockResolvedValue(mockUsers),
      findUniqueOrThrow: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue({ ...mockUser, name: 'Updated Name' }),
      delete: jest.fn().mockResolvedValue(mockUser),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const createUserDto: CreateUserDto = { 
        name: 'John Doe', 
        email: 'john@example.com', 
        password: '123456789' 
      };
      
      const result = await service.create(createUserDto);
      
      expect(bcrypt.hash).toHaveBeenCalledWith('123456789', 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: createUserDto.name,
          email: createUserDto.email,
          password: '$2b$10$SeTm07glhmcV/i9nC4P8IOjLY4XTbXHDxV8jlufgVxQri2iRiOpnW',
          created_at: expect.any(String),
        }),
      });
      expect(result).toEqual(mockUser);
    });

    it('should handle errors during user creation', async () => {
      const createUserDto: CreateUserDto = { 
        name: 'John Doe', 
        email: 'john@example.com', 
        password: '123456789' 
      };
      
      const error = new Error('Database error');
      jest.spyOn(console, 'log').mockImplementation(() => {});
      mockPrismaService.user.create.mockRejectedValueOnce(error);
      
      const result = await service.create(createUserDto);
      
      expect(console.log).toHaveBeenCalledWith(error);
      expect(result).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await service.findAll();
      
      expect(prismaService.user.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const findOneUserDto: Prisma.UserWhereUniqueInput = { id: 1 };
      
      const result = await service.findOne(findOneUserDto);
      
      expect(prismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({ 
        where: findOneUserDto 
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw an error when user not found', async () => {
      const findOneUserDto: Prisma.UserWhereUniqueInput = { id: 999 };
      const error = new Error('User not found');
      
      mockPrismaService.user.findUniqueOrThrow.mockRejectedValueOnce(error);
      
      await expect(service.findOne(findOneUserDto)).rejects.toThrow('User not found');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      
      const result = await service.update(1, updateUserDto);
      
      expect(prismaService.user.update).toHaveBeenCalledWith({ 
        where: { id: 1 }, 
        data: updateUserDto 
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const result = await service.remove(1);
      
      expect(prismaService.user.delete).toHaveBeenCalledWith({ 
        where: { id: 1 } 
      });
      expect(result).toEqual(mockUser);
    });
  });
}); 