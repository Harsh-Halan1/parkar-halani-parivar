import {
  IsOptional,
  IsString,
  IsEnum,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RelationType } from '@prisma/client';

export class UpdateRelationshipDto {
  @IsOptional()
  @IsEnum(RelationType)
  relationType?: RelationType;

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
