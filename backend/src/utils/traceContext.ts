import { context, propagation } from "@opentelemetry/api";

export const injectTraceContext = () => {
  const carrier: Record<string, string> = {};

  propagation.inject(context.active(), carrier);

  return carrier;
};

export const extractTraceContext = (traceContext: Record<string, string>) => {
  return propagation.extract(context.active(), traceContext);
};
