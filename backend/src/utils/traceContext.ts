import { context, propagation } from "@opentelemetry/api";

export const injectTraceContext = () => {
  const carrier: Record<string, string> = {};

  propagation.inject(context.active(), carrier);

  return carrier;
};
