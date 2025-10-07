import { HTTP_STATUS } from '../constants/http';
import { ERROR_CODES } from '../constants/error-codes';

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, code?: string) {
    super(HTTP_STATUS.BAD_REQUEST, message, code);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string, code?: string) {
    super(HTTP_STATUS.NOT_FOUND, message, code);
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string = 'Внутренняя ошибка сервера', code?: string) {
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, code);
  }
}

export class ValidationError extends BadRequestError {
  constructor(message: string) {
    super(message, ERROR_CODES.VALIDATION_ERROR);
  }
}
