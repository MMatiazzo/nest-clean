import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import request from 'supertest';

describe('Fetch recent questions (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);
    await app.init();
  });
  test('[GET] /questions', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'email2@email.com',
        password: await hash('123456', 8),
      },
    });

    const accessToken = jwt.sign({ sub: user.id });

    await prisma.question.createMany({
      data: [
        {
          title: 'Question 1',
          content: 'Content',
          slug: 'question 1',
          authorId: user.id,
        },
        {
          title: 'Question 2',
          content: 'Content',
          slug: 'question 2',
          authorId: user.id,
        },
        {
          title: 'Question 3',
          content: 'Content',
          slug: 'question 3',
          authorId: user.id,
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    console.log('response => ', response);

    expect(response.statusCode).toBe(200);
    // expect(response.body).toEqual({
    //   questions: [
    //     expect.objectContaining({ title: 'Question 1' }),
    //     expect.objectContaining({ title: 'Question 2' }),
    //     expect.objectContaining({ title: 'Question 3' }),
    //   ],
    // });
  });
});
