import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Something went wrong. Please try again.';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        message = payload;
        code = exception.name;
      } else if (typeof payload === 'object' && payload) {
        const body = payload as { message?: string | string[]; error?: string };
        message = Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? exception.message);
        code = body.error ?? exception.name;
      }
    } else {
      this.logger.error(exception);
    }

    if (!response.headersSent) {
      response.status(status).json({
        success: false,
        error: { code, message },
      });
    }
  }
}
