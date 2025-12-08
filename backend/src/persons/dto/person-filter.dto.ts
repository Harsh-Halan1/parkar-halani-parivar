import { IsOptional, IsString, IsEnum } from 'class-validator';
import { MaritalStatus } from '@prisma/client';

export class PersonFilterDto {
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @IsOptional()
  @IsString()
  profession?: string;
}
