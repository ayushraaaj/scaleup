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
  console.log("Brevo status: ", error.statusCode);
  console.log("Brevo body: ", error.body);

  if (error.statusCode === 401) {
    return new EmailError("Email provider authentication failed", false);
  }

  if (
    error.statusCode === 400 &&
    error.body.code === "invalid_parameter" &&
    error.body.message === "email is not valid in to"
  ) {
    return new EmailError("Recipient email address in invalid", false);
  }

  return new EmailError("Email provider request failed", true);
};
