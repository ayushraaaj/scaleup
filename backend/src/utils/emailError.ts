export class EmailError extends Error {
  name: string;
  retryable: boolean;
  retryAfter?: number;

  constructor(message: string, retryable: boolean, retryAfter?: number) {
    super(message);
    this.name = "EmailError";
    this.retryable = retryable;
    this.retryAfter = retryAfter;
  }
}

export const handleBrevoError = (error: any) => {
  console.log("Brevo error: ", error);
  console.log("Brevo status: ", error.statusCode);
  console.log("Brevo body: ", error.body);
  console.log("Brevo headers: ", error.headers);

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

  if (error.statusCode === 429) {
    const resetTime = parseInt(
      error.rawResponse.headers?.["x-sib-ratelimit-reset"] || "60",
      10,
    );

    return new EmailError(
      "Email provider rate limit exceeded",
      true,
      resetTime,
    );
  }

  return new EmailError("Email provider request failed", true);
};
