import {
  IsOptional,
  IsString,
  IsObject,
  IsEnum,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MaritalStatus } from '@prisma/client';

class MultilingualName {
  gu?: string;
  en?: string;
  hi?: string;
}

export class UpdatePersonDto {
  @IsOptional()
  @IsObject()
  firstName?: MultilingualName;

  @IsOptional()
  @IsObject()
  middleName?: MultilingualName;

  @IsOptional()
  @IsObject()
  lastName?: MultilingualName;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  placeOfBirth?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  residentialAddress?: string;

  @IsOptional()
  @IsString()
  professionalAddress?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @IsOptional()
  @IsBoolean()
  isDeceased?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfDeath?: Date;

  @IsOptional()
  @IsString()
  placeOfDeath?: string;

  @IsOptional()
  @IsString()
  causeOfDeath?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
