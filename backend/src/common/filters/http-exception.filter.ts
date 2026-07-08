import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    this.logger.warn(`${request.method} ${request.url} -> ${status}`);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message || exception.message,
      errors: typeof exceptionResponse === 'object' ? (exceptionResponse as any).errors : undefined,
    });
  }
}
