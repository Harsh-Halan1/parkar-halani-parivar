import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export interface AuthUserPayload {
  id: string;
  email?: string | null;
  phone?: string | null;
  supabaseId?: string | null;
  firstName: string;
  lastName: string;
  needsContactInfo: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

export interface AuthResult {
  user: AuthUserPayload;
  tokens: AuthTokens;
  supabaseSession?: unknown;
}

interface PhoneOtpVerifyDto {
  phone: string;
  token: string;
  rememberMe?: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface EmailSignUpDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  rememberMe?: boolean;
}

interface EmailSignInDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private supabase: SupabaseService,
  ) {}

  // === Phone OTP ===
  async requestPhoneOtp(phone: string) {
    const client = this.supabase.getClient();
    const formattedPhone = phone.trim();
    if (!formattedPhone) {
      throw new BadRequestException('Phone is required');
    }

    const { error } = await client.auth.signInWithOtp({
      phone: formattedPhone,
      options: { shouldCreateUser: true },
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { sent: true };
  }

  async verifyPhoneOtp(dto: PhoneOtpVerifyDto): Promise<AuthResult> {
    const client = this.supabase.getClient();
    const { phone, token, rememberMe, firstName, lastName, email } = dto;

    if (!phone || !token) {
      throw new BadRequestException('Phone and token are required');
    }

    const { data, error } = await client.auth.verifyOtp({
      phone: phone.trim(),
      token: token.trim(),
      type: 'sms',
    });

    if (error || !data?.user) {
      throw new UnauthorizedException(error?.message || 'Invalid OTP');
    }

    const supabaseUser = data.user;
    const user = await this.upsertUserFromSupabase({
      supabaseId: supabaseUser.id,
      email: supabaseUser.email ?? email ?? null,
      phone: supabaseUser.phone ?? phone,
      firstName: firstName?.trim() || supabaseUser.user_metadata?.firstName || 'Guest',
      lastName: lastName?.trim() || supabaseUser.user_metadata?.lastName || 'User',
    });

    const tokens = await this.issueTokens(user.id, rememberMe === true);

    return {
      user: this.toAuthUserPayload(user),
      tokens,
      supabaseSession: data.session,
    };
  }

  // === Email + Password ===
  async signUpWithEmail(dto: EmailSignUpDto): Promise<AuthResult> {
    const client = this.supabase.getClient();
    const email = dto.email?.toLowerCase().trim();
    const phone = dto.phone?.trim() || null;

    if (!email || !dto.password) {
      throw new BadRequestException('Email and password are required');
    }

    const { data, error } = await client.auth.signUp({
      email,
      password: dto.password,
      options: {
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone,
        },
      },
    });

    if (error || !data.user) {
      if (error?.message?.includes('already registered')) {
        throw new ConflictException('Email already registered');
      }
      throw new BadRequestException(error?.message || 'Sign-up failed');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.upsertUserFromSupabase({
      supabaseId: data.user.id,
      email,
      phone,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      passwordHash,
    });

    const tokens = await this.issueTokens(user.id, dto.rememberMe === true);

    return {
      user: this.toAuthUserPayload(user),
      tokens,
      supabaseSession: data.session,
    };
  }

  async signInWithEmail(dto: EmailSignInDto): Promise<AuthResult> {
    const client = this.supabase.getClient();
    const email = dto.email?.toLowerCase().trim();
    if (!email || !dto.password) {
      throw new BadRequestException('Email and password are required');
    }

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password: dto.password,
    });

    if (error || !data.session?.user) {
      throw new UnauthorizedException(error?.message || 'Invalid credentials');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.upsertUserFromSupabase({
      supabaseId: data.session.user.id,
      email,
      phone: data.session.user.phone ?? null,
      firstName: data.session.user.user_metadata?.firstName || 'Guest',
      lastName: data.session.user.user_metadata?.lastName || 'User',
      passwordHash,
    });

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const tokens = await this.issueTokens(user.id, dto.rememberMe === true);

    return {
      user: this.toAuthUserPayload(user),
      tokens,
      supabaseSession: data.session,
    };
  }

  // === Refresh & Logout ===
  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const stored = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const accessToken = this.jwt.sign({ sub: stored.userId });
    return { accessToken };
  }

  async logout(userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    await this.prisma.refreshToken.deleteMany({ where: { userId } });

    if (user?.supabaseId) {
      try {
        await this.supabase.getAdminClient().auth.admin.signOut(user.supabaseId);
      } catch (err) {
        console.warn('Supabase signOut failed', err);
      }
    }

    return { success: true };
  }

  async updateContactInfo(dto: { userId: string; email?: string; phone?: string }) {
    if (!dto.userId) {
      throw new BadRequestException('userId is required');
    }
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('At least one of email or phone is required');
    }

    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: dto.userId },
      data: {
        email: dto.email?.toLowerCase().trim() ?? user.email,
        phone: dto.phone?.trim() ?? user.phone,
      },
    });

    return this.toAuthUserPayload(updated);
  }

  // === Helpers ===
  private async issueTokens(userId: string, rememberMe: boolean): Promise<AuthTokens> {
    const accessToken = this.jwt.sign({ sub: userId });
    const refreshTtlDays = rememberMe ? 30 : 7;
    const refreshExpiresAt = new Date(Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000);

    const refreshToken = `r_${userId}_${crypto.randomUUID()}`;

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt: refreshExpiresAt,
        userId,
      },
    });

    return { accessToken, refreshToken, refreshExpiresAt };
  }

  private async upsertUserFromSupabase(payload: {
    supabaseId: string;
    email: string | null;
    phone: string | null;
    firstName: string;
    lastName: string;
    passwordHash?: string;
  }) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { supabaseId: payload.supabaseId },
          ...(payload.email ? [{ email: payload.email }] : []),
          ...(payload.phone ? [{ phone: payload.phone }] : []),
        ],
      },
    });

    if (existing) {
      return this.prisma.user.update({
        where: { id: existing.id },
        data: {
          supabaseId: payload.supabaseId,
          email: payload.email ?? existing.email,
          phone: payload.phone ?? existing.phone,
          firstName: payload.firstName || existing.firstName,
          lastName: payload.lastName || existing.lastName,
          passwordHash: payload.passwordHash || existing.passwordHash,
          lastLogin: new Date(),
        },
      });
    }

    const member = await this.prisma.member.create({
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
      },
    });

    return this.prisma.user.create({
      data: {
        supabaseId: payload.supabaseId,
        email: payload.email,
        phone: payload.phone,
        passwordHash: payload.passwordHash || '',
        firstName: payload.firstName,
        lastName: payload.lastName,
        memberId: member.id,
      },
    });
  }

  private toAuthUserPayload(user: { id: string; email: string | null; phone: string | null; supabaseId: string | null; firstName: string; lastName: string }) {
    const needsContactInfo = !user.phone || !user.email;
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      supabaseId: user.supabaseId,
      firstName: user.firstName,
      lastName: user.lastName,
      needsContactInfo,
    } satisfies AuthUserPayload;
  }
}
