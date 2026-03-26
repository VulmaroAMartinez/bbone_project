type LogLevel = 'warn' | 'error' | 'debug';

type LogContext = Record<string, unknown>;

type ReporterPayload = {
  area: string;
  message: string;
  context?: LogContext;
  error?: Error;
};

type Reporter = (payload: ReporterPayload) => void;

let reporter: Reporter | null = null;

const isDevelopment = import.meta.env.DEV;

const SENSITIVE_KEY_PATTERN = /(authorization|token|secret|password|cookie|csrf|header|scope|credential|session|bearer)/i;

function sanitizeValue(value: unknown): unknown {
  if (value == null) {
    return value;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
    };
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeValue(entry));
  }

  if (typeof value === 'object') {
    return sanitizeContext(value as LogContext);
  }

  if (typeof value === 'string') {
    return value.length > 120 ? `${value.slice(0, 117)}...` : value;
  }

  return value;
}

export function sanitizeContext(context?: LogContext): LogContext | undefined {
  if (!context) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? '[redacted]' : sanitizeValue(value),
    ]),
  );
}

export function setErrorReporter(nextReporter: Reporter | null): void {
  reporter = nextReporter;
}

function emitDevLog(level: LogLevel, area: string, message: string, context?: LogContext): void {
  if (!isDevelopment) {
    return;
  }

  const logger = console[level] ?? console.error;
  const safeContext = sanitizeContext(context);

  if (safeContext && Object.keys(safeContext).length > 0) {
    logger(`[${area}] ${message}`, safeContext);
    return;
  }

  logger(`[${area}] ${message}`);
}

export function logDevWarning(area: string, message: string, context?: LogContext): void {
  emitDevLog('warn', area, message, context);
}

export function logDevDebug(area: string, message: string, context?: LogContext): void {
  emitDevLog('debug', area, message, context);
}

export function reportError(
  area: string,
  message: string,
  error?: unknown,
  context?: LogContext,
): void {
  const safeContext = sanitizeContext(context);
  const normalizedError = error instanceof Error ? error : undefined;

  emitDevLog('error', area, message, {
    ...safeContext,
    ...(normalizedError
      ? {
          errorName: normalizedError.name,
          errorMessage: normalizedError.message,
        }
      : {}),
  });

  reporter?.({
    area,
    message,
    context: safeContext,
    error: normalizedError,
  });
}
