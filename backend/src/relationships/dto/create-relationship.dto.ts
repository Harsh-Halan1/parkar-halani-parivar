import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RelationType } from '@prisma/client';

export class CreateRelationshipDto {
  @IsNotEmpty()
  @IsString()
  personAId: string;

  @IsNotEmpty()
  @IsString()
  personBId: string;

  @IsNotEmpty()
  @IsEnum(RelationType)
  relationType: RelationType;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  marriageDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  divorceDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  adoptionDate?: Date;

  @IsOptional()
  @IsBoolean()
  isAdoptive?: boolean;

  @IsOptional()
  @IsString()
  biologicalParentAId?: string;

  @IsOptional()
  @IsString()
  biologicalParentBId?: string;
}
