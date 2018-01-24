import {
  ErrorResponse as ErrorResponseInterface, ErrorResponseStatus, Response as ResponseInterface,
  ValueResponse as ValueResponseInterface, ValueResponseStatus
} from '../../../../../server/api/services/response';

abstract class Response<T> {
  static from<T>(message: Partial<ResponseInterface>): Response<T> | null {
    if (this.isValueResponse(message)) {
      return new ValueResponse(message.value);
    }
    if (this.isErrorResponse(message)) {
      return new ErrorResponse(message.reason);
    }
    return null;
  }

  private static isValueResponse(message: Partial<ResponseInterface>): message is ValueResponseInterface {
    return message.status === ValueResponseStatus;
  }

  private static isErrorResponse(message: Partial<ResponseInterface>): message is ErrorResponseInterface {
    return message.status === ErrorResponseStatus;
  }

  abstract apply(): T;
}

export default Response;

class ErrorResponse extends Response<never> {
  constructor(private reason: string) {
    super();
  }

  apply(): never {
    throw new ErrorResponseError(this.reason);
  }
}

class ValueResponse<T> extends Response<T> {
  constructor(private value: T) {
    super();
  }

  apply() {
    return this.value;
  }
}

export class ErrorResponseError extends TypeError {
}