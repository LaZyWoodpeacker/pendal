export class DiadocApiException extends Error {
  constructor(
    message: string,
    readonly code: number,
    readonly codeText: string,
    readonly data: object | undefined
  ) {
    super(message);
  }
}
