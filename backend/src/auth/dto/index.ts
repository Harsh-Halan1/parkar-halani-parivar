import { IsEmail, IsString, MinLength, IsOptional, IsEnum, ValidateIf } from 'class-validator';
import { LanguageCode } from '@prisma/client';

export class SendOtpDto {
  @ValidateIf(o => !o.phone)
  @IsEmail()
  email?: string;

  @ValidateIf(o => !o.email)
  @IsString()
  phone?: string;
}

export class RegisterDto {
  @ValidateIf(o => !o.phone)
  @IsEmail()
  email?: string;

  @ValidateIf(o => !o.email)
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(LanguageCode)
  preferredLanguage?: LanguageCode;
}

export class LoginDto {
  @IsString()
  identifier: string; // Can be email or phone

  @IsString()
  password: string;
}

export class VerifyOtpDto {
  @ValidateIf(o => !o.phone)
  @IsEmail()
  email?: string;

  @ValidateIf(o => !o.email)
  @IsString()
  phone?: string;

  @IsString()
  otpCode: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
