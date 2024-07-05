export enum PendalExceptionType {
  alreadyHaveBid = 'Заявка уже существует',
}

export class PendalException extends Error {
  constructor(
    message,
    readonly code: PendalExceptionType,
    readonly bidId: string = '',
  ) {
    super(message);
  }
}
