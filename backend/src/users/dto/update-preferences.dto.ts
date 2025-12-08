import { IsOptional, IsBoolean, IsString, IsEnum } from 'class-validator';

export enum Language {
  GU = 'gu',
  EN = 'en',
  HI = 'hi',
}

export class UpdatePreferencesDto {
  @IsOptional()
  @IsEnum(Language)
  preferredLanguage?: Language;

  @IsOptional()
  @IsBoolean()
  isDarkMode?: boolean;
}
