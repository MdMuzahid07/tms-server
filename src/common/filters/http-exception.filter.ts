import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) {
      // Ensure unexpected errors are visible during development.
      // (Nest won't automatically log them once we catch everything here.)
      console.error(exception);
    }

    const rawMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error!';

    const message =
      typeof rawMessage === 'string'
        ? rawMessage
        : rawMessage &&
            typeof rawMessage === 'object' &&
            'message' in rawMessage
          ? ((rawMessage as { message?: unknown }).message ?? rawMessage)
          : rawMessage;

    response.status(status).json({
      success: false,
      statuscode: status,
      timeStamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
