import { IsOptional, IsObject, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class MultilingualName {
  gu?: string;
  en?: string;
  hi?: string;
}

export class UpdateFamilyDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualName)
  name?: MultilingualName;

  @IsOptional()
  @IsString()
  headPersonId?: string;
}
