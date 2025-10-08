// src/features/users/user.service.ts
import { CreateUserDto, UserDto, User } from './user.dto';
import { UserRepository } from './user.repository';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  private mapToUserDto(user: User): UserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  // FIX: Make the method async and return a Promise
  public async getAllUsers(): Promise<UserDto[]> {
    // FIX: 'await' the result from the repository
    const users = await this.userRepository.findAll();
    return users.map(this.mapToUserDto);
  }

  // FIX: Make the method async and return a Promise
  public async getUserById(id: number): Promise<UserDto | null> {
    // FIX: 'await' the result
    const user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }
    return this.mapToUserDto(user);
  }

  // FIX: Make the method async and return a Promise
  public async createUser(createUserDto: CreateUserDto): Promise<UserDto> {
    // --- BUSINESS LOGIC ---
    // FIX: 'await' the result
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new Error("A user with this email already exists.");
    }
    // --- END BUSINESS LOGIC ---

    // FIX: 'await' the result
    const newUser = await this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      passwordHash: "a-real-app-would-hash-this",
    });

    return this.mapToUserDto(newUser);
  }
}