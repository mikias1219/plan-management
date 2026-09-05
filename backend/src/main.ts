import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(
    helmet({
      contentSecurityPolicy: false,
      strictTransportSecurity: false,
    }),
  );
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? true, credentials: true });
  const hits = new Map<string, { count: number; windowStart: number }>();
  app.use((req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip ?? 'unknown';
    const now = Date.now();
    const rec = hits.get(ip);
    if (!rec || now - rec.windowStart > 60_000) {
      hits.set(ip, { count: 1, windowStart: now });
      next();
      return;
    }
    rec.count += 1;
    if (rec.count > 120) {
      res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMIT', message: 'Too many requests. Try again shortly.' },
      });
      return;
    }
    next();
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}

await bootstrap();
