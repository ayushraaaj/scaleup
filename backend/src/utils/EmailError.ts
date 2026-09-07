export class EmailError extends Error {
  name: string;
  retryable: boolean;

  constructor(message: string, retryable: boolean) {
    super(message);
    this.name = "EmailError";
    this.retryable = retryable;
  }
}

export const handleBrevoError = (error: any) => {
  if (error.statusCode === 401) {
    return new EmailError("Email provider authentication failed", false);
  }

  return new EmailError("Email provider request failed", true);
};
