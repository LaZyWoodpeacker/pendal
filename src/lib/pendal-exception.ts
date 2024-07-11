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

export class PendalTaskException extends Error {
  constructor(
    message: string,
    readonly info: Object | null = null,
  ) {
    super(message);
  }
}
