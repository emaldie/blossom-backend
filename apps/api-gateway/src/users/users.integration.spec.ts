import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { USERS_PATTERNS, USERS_SERVICE } from '@blossom/contracts';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from '@blossom/contracts';

describe('UsersService Integration', () => {
  let service: UsersService;
  let clientProxy: ClientProxy;

  // Mock UserDto data
  const mockUser: UserDto = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword123',
    created_at: new Date(),
  };

  const mockUsers: UserDto[] = [
    mockUser,
    {
      id: 2,
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashedPassword456',
      created_at: new Date(),
    },
  ];

  // Create a mock ClientProxy that returns observables
  const mockClientProxy = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: USERS_SERVICE, useValue: mockClientProxy },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    clientProxy = module.get<ClientProxy>(USERS_SERVICE);
    
    // Reset mock before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should send create pattern to users microservice', async () => {
      const createUserDto: CreateUserDto = { 
        name: 'John Doe', 
        email: 'john@example.com', 
        password: '123456789' 
      };
      
      mockClientProxy.send.mockReturnValue(of(mockUser));
      
      const result = await service.create(createUserDto);
      
      expect(result).toEqual(mockUser);
      expect(clientProxy.send).toHaveBeenCalledWith(USERS_PATTERNS.CREATE, createUserDto);
    });
  });

  describe('findAll', () => {
    it('should send findAll pattern to users microservice', async () => {
      mockClientProxy.send.mockReturnValue(of(mockUsers));
      
      const result = await service.findAll();
      
      expect(result).toEqual(mockUsers);
      expect(clientProxy.send).toHaveBeenCalledWith(USERS_PATTERNS.FIND_ALL, {});
    });
  });

  describe('findOne', () => {
    it('should send findOne pattern to users microservice', async () => {
      mockClientProxy.send.mockReturnValue(of(mockUser));
      
      const result = await service.findOne(1);
      
      expect(result).toEqual(mockUser);
      expect(clientProxy.send).toHaveBeenCalledWith(USERS_PATTERNS.FIND_ONE, { id: 1 });
    });
  });

  describe('update', () => {
    it('should send update pattern to users microservice', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      
      mockClientProxy.send.mockReturnValue(of(updatedUser));
      
      const result = await service.update(1, updateUserDto);
      
      expect(result).toEqual(updatedUser);
      expect(clientProxy.send).toHaveBeenCalledWith(USERS_PATTERNS.UPDATE, { 
        id: 1, 
        data: updateUserDto 
      });
    });
  });

  describe('remove', () => {
    it('should send remove pattern to users microservice', async () => {
      mockClientProxy.send.mockReturnValue(of(mockUser));
      
      const result = await service.remove(1);
      
      expect(result).toEqual(mockUser);
      expect(clientProxy.send).toHaveBeenCalledWith(USERS_PATTERNS.REMOVE, 1);
    });
  });
}); 