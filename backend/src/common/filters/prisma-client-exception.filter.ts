import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch(PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';

    switch (exception.code) {
      case 'P2000':
        status = HttpStatus.BAD_REQUEST;
        message = 'Input value is too long';
        break;
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = 'Resource already exists';
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Resource not found';
        break;
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = 'Referenced resource not found';
        break;
      case 'P2014':
        status = HttpStatus.BAD_REQUEST;
        message = 'Null constraint violation';
        break;
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'An unexpected database error occurred';
        break;
    }

    this.logger.error(`Prisma Error ${exception.code}: ${exception.message}`);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      code: exception.code,
    });
  }
}
