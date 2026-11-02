import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '../domain/User';
import userRepository, { IUserRepository } from '../repositories/UserRepository';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../shared/config';

export interface RegisterDTO {
  email: string;
  password: string;
  name?: string;
  fullName?: string;
  role?: UserRole;
  phone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResult {
  message: string;
  userId: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export class AuthService {
  constructor(private userRepo: IUserRepository = userRepository) {}

  public async register(dto: RegisterDTO): Promise<AuthResult> {
    const displayName = dto.name || dto.fullName;
    if (!dto.email || !dto.password || !displayName) {
      throw { status: 400, message: 'Please provide all required fields' };
    }

    if (dto.password.length < 8) {
      throw { status: 400, message: 'Password must be at least 8 characters' };
    }

    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      throw { status: 400, message: 'User already exists' };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = new User(
      uuidv4(),
      displayName,
      dto.email,
      hashedPassword,
      dto.role || 'user',
      dto.phone || null
    );

    await this.userRepo.create(user);
    const token = this.generateToken(user);

    return {
      message: 'User registered successfully',
      userId: user.id,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };
  }

  public async login(dto: LoginDTO): Promise<AuthResult> {
    if (!dto.email || !dto.password) {
      throw { status: 400, message: 'Please provide email and password' };
    }

    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw { status: 400, message: 'Invalid credentials' };
    }

    const isMatch = await user.validatePassword(dto.password);
    if (!isMatch) {
      throw { status: 400, message: 'Invalid credentials' };
    }

    const token = this.generateToken(user);

    return {
      message: 'Logged in successfully',
      userId: user.id,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };
  }

  private generateToken(user: User): string {
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
  }
}

export default new AuthService();
