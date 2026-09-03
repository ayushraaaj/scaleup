export class EmailError extends Error {
  name: string;

  constructor(message: string, retryable: boolean) {
    super(message);
    this.name = "EmailError";
  }
}
