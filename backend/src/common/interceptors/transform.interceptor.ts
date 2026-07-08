import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return {
            data: data.data,
            meta: {
              total: data.meta.total,
              page: data.meta.page,
              limit: data.meta.limit,
              totalPages: Math.ceil(data.meta.total / data.meta.limit) || 0,
              hasNext: data.meta.page * data.meta.limit < data.meta.total,
              hasPrevious: data.meta.page > 1,
            },
          };
        }
        return data;
      }),
    );
  }
}
