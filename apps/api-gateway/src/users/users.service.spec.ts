import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { USERS_PATTERNS, USERS_SERVICE, UserDto } from '@blossom/contracts';
import { of } from 'rxjs';

describe('UsersService', () => {
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456789',
      };

      mockClientProxy.send.mockReturnValue(of(mockUser));

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USERS_PATTERNS.CREATE,
        createUserDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockClientProxy.send.mockReturnValue(of(mockUsers));

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(clientProxy.send).toHaveBeenCalledWith(
        USERS_PATTERNS.FIND_ALL,
        {},
      );
    });

    it('should return null when no users exist', async () => {
      mockClientProxy.send.mockReturnValue(of(null));

      const result = await service.findAll();

      expect(result).toBeNull();
      expect(clientProxy.send).toHaveBeenCalledWith(
        USERS_PATTERNS.FIND_ALL,
        {},
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockClientProxy.send.mockReturnValue(of(mockUser));

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(clientProxy.send).toHaveBeenCalledWith(USERS_PATTERNS.FIND_ONE, {
        id: 1,
      });
    });

    it('should return null when user not found', async () => {
      mockClientProxy.send.mockReturnValue(of(null));

      const result = await service.findOne(999);

      expect(result).toBeNull();
      expect(clientProxy.send).toHaveBeenCalledWith(USERS_PATTERNS.FIND_ONE, {
        id: 999,
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };

      mockClientProxy.send.mockReturnValue(of(updatedUser));

      const result = await service.update(1, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(clientProxy.send).toHaveBeenCalledWith(USERS_PATTERNS.UPDATE, {
        id: 1,
        data: updateUserDto,
      });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockClientProxy.send.mockReturnValue(of(mockUser));

      const result = await service.remove(1);

      expect(result).toEqual(mockUser);
      expect(clientProxy.send).toHaveBeenCalledWith(USERS_PATTERNS.REMOVE, 1);
    });

    it('should return null when user not found', async () => {
      mockClientProxy.send.mockReturnValue(of(null));

      const result = await service.remove(999);

      expect(result).toBeNull();
      expect(clientProxy.send).toHaveBeenCalledWith(USERS_PATTERNS.REMOVE, 999);
    });
  });
});
