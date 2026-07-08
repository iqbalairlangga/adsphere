import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly isDev: boolean;

  constructor(configService?: ConfigService) {
    this.isDev = configService?.get<string>('app.nodeEnv') === 'development';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    this.logger.error(
      `HTTP ${status} ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : '',
    );

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof message === 'string' ? message : (message as any).message || message,
      ...(this.isDev && {
        stack: exception instanceof Error ? exception.stack : '',
      }),
    };

    response.status(status).json(errorResponse);
  }
}
