import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UsersModule } from '../src/users.module';
import { PrismaService } from '@blossom/common';
import { CreateUserDto, UpdateUserDto, USERS_PATTERNS } from '@blossom/contracts';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RedisModule } from '@blossom/common/redis/redis.module';
import { RedisModuleMock } from '@blossom/common/redis/redis.module.mock';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((password, saltRounds) => {
    return Promise.resolve(`$2b$${saltRounds}$SeTm07glhmcV/i9nC4P8IOjLY4XTbXHDxV8jlufgVxQri2iRiOpnW`);
  })
}));

describe('Users Microservice (e2e)', () => {
  let app: INestApplication;
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

  // Create a mock PrismaService
  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideModule(RedisModule)
      .useModule(RedisModuleMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'users_queue',
        queueOptions: {
          durable: false
        },
      },
    });

    await app.startAllMicroservices();
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  }, 10000); // Increase timeout to 10 seconds

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(USERS_PATTERNS.CREATE, () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456789',
      };

      const currentDate = new Date().toISOString();
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(currentDate);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await app.get('USERS_SERVICE').send(USERS_PATTERNS.CREATE, createUserDto).toPromise();

      expect(bcrypt.hash).toHaveBeenCalledWith('123456789', 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: '$2b$10$SeTm07glhmcV/i9nC4P8IOjLY4XTbXHDxV8jlufgVxQri2iRiOpnW',
          created_at: currentDate,
        },
      });
      expect(result).toEqual(mockUser);
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

      const result = await app.get('USERS_SERVICE').send(USERS_PATTERNS.CREATE, createUserDto).toPromise();

      expect(console.log).toHaveBeenCalledWith(error);
      expect(result).toBeUndefined();
    });
  });

  describe(USERS_PATTERNS.FIND_ALL, () => {
    it('should return all users', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await app.get('USERS_SERVICE').send(USERS_PATTERNS.FIND_ALL, {}).toPromise();

      expect(prismaService.user.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe(USERS_PATTERNS.FIND_ONE, () => {
    it('should return a user by id', async () => {
      const findOneUserDto: Prisma.UserWhereUniqueInput = { id: 1 };

      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(mockUser);

      const result = await app.get('USERS_SERVICE').send(USERS_PATTERNS.FIND_ONE, findOneUserDto).toPromise();

      expect(prismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: findOneUserDto,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw an error when user not found', async () => {
      const findOneUserDto: Prisma.UserWhereUniqueInput = { id: 999 };
      const error = new Error('User not found');

      mockPrismaService.user.findUniqueOrThrow.mockRejectedValue(error);

      await expect(
        app.get('USERS_SERVICE').send(USERS_PATTERNS.FIND_ONE, findOneUserDto).toPromise()
      ).rejects.toThrow('User not found');
    });
  });

  describe(USERS_PATTERNS.UPDATE, () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      const payload = { id: 1, data: updateUserDto };
      const updatedUser = { ...mockUser, name: 'Updated Name' };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await app.get('USERS_SERVICE').send(USERS_PATTERNS.UPDATE, payload).toPromise();

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: payload.id },
        data: payload.data,
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe(USERS_PATTERNS.REMOVE, () => {
    it('should remove a user', async () => {
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await app.get('USERS_SERVICE').send(USERS_PATTERNS.REMOVE, 1).toPromise();

      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockUser);
    });
  });
}); 