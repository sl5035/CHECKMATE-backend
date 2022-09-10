import { IsBoolean, IsEmail, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsBoolean()
  @IsOptional()
  admin: boolean;
}
