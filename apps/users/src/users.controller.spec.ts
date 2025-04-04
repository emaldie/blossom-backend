import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, USERS_PATTERNS } from '@blossom/contracts';
import { Prisma } from '@prisma/client';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  // Mock User data
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword123',
    created_at: new Date(),
  };

  const mockUsers = [
    mockUser,
    {
      id: 2,
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashedPassword456',
      created_at: new Date(),
    },
  ];

  const mockUsersService = {
    create: jest.fn().mockResolvedValue(mockUser),
    findAll: jest.fn().mockResolvedValue(mockUsers),
    findOne: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue({ ...mockUser, name: 'Updated Name' }),
    remove: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    
    // Reset mock before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = { 
        name: 'John Doe', 
        email: 'john@example.com', 
        password: '123456789' 
      };
      
      const result = await controller.create(createUserDto);
      
      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await controller.findAll();
      
      expect(result).toEqual(mockUsers);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const findOneUserDto: Prisma.UserWhereUniqueInput = { id: 1 };
      
      const result = await controller.findOne(findOneUserDto);
      
      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(findOneUserDto);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      const payload = { id: 1, data: updateUserDto };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      
      const result = await controller.update(payload);
      
      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(payload.id, payload.data);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const result = await controller.remove(1);
      
      expect(result).toEqual(mockUser);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
}); 