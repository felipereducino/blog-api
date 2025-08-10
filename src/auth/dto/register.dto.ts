import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'string',
    description: 'E-mail',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'string',
    description: 'Nome completo',
    minLength: 2,
    maxLength: 60,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(60)
  name: string;

  @ApiProperty({
    example: 'string',
    description: 'Mín. 1 letra, 1 número e 1 caractere especial',
    minLength: 8,
    maxLength: 128,
    // OBS: string pattern precisa de barras invertidas escapadas
    pattern:
      '^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*()_\\-+={}\\[\\]|:;\\"\\\'<>,.?/]).+$',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  // At least 1 letter, 1 number, 1 special char
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/]).+$/,
    { message: 'password too weak' },
  )
  password: string;
}
