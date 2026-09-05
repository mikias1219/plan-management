import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ path?: string }>();
    if (request.path?.includes('/google/oauth/callback')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return { success: true, ...data };
        }
        return { success: true, data };
      }),
    );
  }
}
