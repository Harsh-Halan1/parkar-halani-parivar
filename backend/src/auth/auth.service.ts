import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export interface SignUpDto {
  email: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInDto {
  email?: string;
  phone?: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signUp(dto: SignUpDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          ...(dto.phone ? [{ phone: dto.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create member first
    const member = await this.prisma.member.create({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
      },
    });

    // Create user linked to member
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone?.trim() || null,
        passwordHash: hashedPassword,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        memberId: member.id,
      },
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email || '',
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      refreshToken,
    };
  }

  async signIn(dto: SignInDto): Promise<AuthResponse> {
    // Find user
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(dto.email ? [{ email: dto.email.toLowerCase().trim() }] : []),
          ...(dto.phone ? [{ phone: dto.phone.trim() }] : []),
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email || '',
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Find refresh token
    const token = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!token || token.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Generate new access token
    const accessToken = this.generateAccessToken(token.userId);

    return { accessToken };
  }

  async logout(userId: string): Promise<void> {
    // Delete all refresh tokens for user
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  private generateAccessToken(userId: string): string {
    // In production, use JWT library
    // For now, return a simple token
    return `access_${userId}_${Date.now()}`;
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    // In production, use JWT library
    const token = `refresh_${userId}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token,
        expiresAt,
        userId,
      },
    });

    return token;
  }
}
