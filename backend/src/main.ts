import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Cookie parser
  app.use(cookieParser());
  
  // Global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // CORS configuration
  app.enableCors({
    origin: ['http://localhost:3000'], // Frontend URL
    credentials: true,
  });
  
  // Global prefix
  app.setGlobalPrefix('api');

  await app.listen(process.env.BACKEND_PORT || 3001);
}
bootstrap();
