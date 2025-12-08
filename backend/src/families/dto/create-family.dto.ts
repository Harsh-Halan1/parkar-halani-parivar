import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MultilingualName {
  gu: string;
  en: string;
  hi: string;
}

export class CreateFamilyDto {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualName)
  name: MultilingualName;
}
