import {
  IsNotEmpty,
  IsString,
  IsObject,
  IsOptional,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MaritalStatus } from '@prisma/client';

class MultilingualName {
  gu: string;
  en: string;
  hi: string;
}

export class CreatePersonDto {
  @IsNotEmpty()
  @IsString()
  familyId: string;

  @IsNotEmpty()
  @IsObject()
  firstName: MultilingualName;

  @IsOptional()
  @IsObject()
  middleName?: MultilingualName;

  @IsNotEmpty()
  @IsObject()
  lastName: MultilingualName;

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
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
