import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'bcryptjs';

@Controller('account')
export class CreateAccountController {
  constructor(private prismaService: PrismaService) {}

  @Post()
  @HttpCode(201)
  async handle(@Body() body: any) {
    const { name, email, password } = body;

    const userWithSameEmail = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (userWithSameEmail) {
      throw new ConflictException(
        'User with same email address already exists',
      );
    }

    const hashPassword = await hash(password, 8);

    await this.prismaService.user.create({
      data: { name, email, password: hashPassword },
    });
  }
}
