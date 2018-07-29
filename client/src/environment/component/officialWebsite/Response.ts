import {ErrorResponse as ErrorResponseInterface, ErrorResponseStatus, Response as ResponseInterface, ValueResponse as ValueResponseInterface, ValueResponseStatus} from '../../../../../server/api/services/response';
import Texts from '../../../render/Texts';

abstract class Response<T> {
  static from<T>(message: any): Response<T> | null {
    if (message == null) {
      // Could have thrown an error, but did not to keep the game running.
      console.error('Received undefined message');
      return null;
    }
    if (isValueResponse(message)) {
      return new ValueResponse(message.value);
    }
    if (isErrorResponse(message)) {
      let reason;
      if (message.reason == null) {
        reason = Texts.forName('main.error.server');
      } else {
        reason = message.reason;
      }
      return new ErrorResponse(reason);
    }
    return null;
  }

  abstract apply(): T;
}

export class ErrorResponse extends Response<never> {
  constructor(private reason: string) {
    super();
  }

  apply(): never {
    throw new ErrorResponseError(this.reason);
  }
}

export class ValueResponse<T> extends Response<T> {
  constructor(private value: T) {
    super();
  }

  apply() {
    return this.value;
  }
}

export class ErrorResponseError extends TypeError {
}

function isValueResponse(message: Partial<ResponseInterface>): message is ValueResponseInterface {
  return message.status === ValueResponseStatus;
}

function isErrorResponse(message: Partial<ResponseInterface>): message is ErrorResponseInterface {
  return message.status === ErrorResponseStatus;
}

export default Response;
