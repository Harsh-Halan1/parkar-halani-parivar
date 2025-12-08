import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse, HttpStatusCode } from './error-response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status: number;
    let errorResponse: ErrorResponse;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      errorResponse = {
        statusCode: status,
        message:
          typeof exceptionResponse === 'object' &&
          'message' in exceptionResponse
            ? (exceptionResponse.message as string)
            : exception.message,
        error: this.getErrorType(status),
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      // Add details if available
      if (
        typeof exceptionResponse === 'object' &&
        'details' in exceptionResponse
      ) {
        errorResponse.details = (exceptionResponse as any).details;
      }

      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${errorResponse.message}`,
      );
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        statusCode: status,
        message: 'An unexpected error occurred',
        error: 'InternalServerError',
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      this.logger.error(
        `${request.method} ${request.url} - ${exception.message}`,
        exception.stack,
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        statusCode: status,
        message: 'An unexpected error occurred',
        error: 'InternalServerError',
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      this.logger.error(
        `${request.method} ${request.url} - Unknown error`,
        exception,
      );
    }

    response.status(status).json(errorResponse);
  }

  private getErrorType(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BadRequest';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'NotFound';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'InternalServerError';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'ServiceUnavailable';
      default:
        return 'Error';
    }
  }
}
