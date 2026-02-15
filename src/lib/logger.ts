/**
 * Structured logger for NEARVITY app
 * Provides consistent logging with categories, timestamps, and context
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, unknown>;
  userId?: string;
}

// In production, suppress debug/info to keep the console clean
const IS_PROD = import.meta.env.PROD;

// Store recent logs for diagnostics
const logHistory: LogEntry[] = [];
const MAX_LOG_HISTORY = 100;

const formatTimestamp = () => new Date().toISOString();

const createLogEntry = (
  level: LogLevel,
  category: string,
  message: string,
  data?: Record<string, unknown>,
  userId?: string
): LogEntry => ({
  timestamp: formatTimestamp(),
  level,
  category,
  message,
  data,
  userId,
});

const shouldEmitToConsole = (level: LogLevel): boolean => {
  if (!IS_PROD) return true;
  // In production only emit warn/error to console
  return level === 'warn' || level === 'error';
};

const storeLog = (entry: LogEntry) => {
  logHistory.push(entry);
  if (logHistory.length > MAX_LOG_HISTORY) {
    logHistory.shift();
  }
};

const formatLogMessage = (entry: LogEntry): string => {
  const parts = [
    `[${entry.timestamp}]`,
    `[${entry.level.toUpperCase()}]`,
    `[${entry.category}]`,
    entry.message,
  ];
  return parts.join(' ');
};

export const logger = {
  // Auth events
  auth: {
    login: (userId: string, method: 'email' | 'social' = 'email') => {
      const entry = createLogEntry('info', 'AUTH', 'User logged in', { method }, userId);
      storeLog(entry);
      if (shouldEmitToConsole('info')) console.log(formatLogMessage(entry), entry.data);
    },
    logout: (userId?: string) => {
      const entry = createLogEntry('info', 'AUTH', 'User logged out', undefined, userId);
      storeLog(entry);
      if (shouldEmitToConsole('info')) console.log(formatLogMessage(entry));
    },
    signupSuccess: (userId: string) => {
      const entry = createLogEntry('info', 'AUTH', 'User signed up', undefined, userId);
      storeLog(entry);
      if (shouldEmitToConsole('info')) console.log(formatLogMessage(entry));
    },
    signupFailed: (error: string) => {
      const entry = createLogEntry('error', 'AUTH', 'Signup failed', { error });
      storeLog(entry);
      if (shouldEmitToConsole('error')) console.error(formatLogMessage(entry), entry.data);
    },
    loginFailed: (error: string) => {
      const entry = createLogEntry('error', 'AUTH', 'Login failed', { error });
      storeLog(entry);
      if (shouldEmitToConsole('error')) console.error(formatLogMessage(entry), entry.data);
    },
    sessionRefresh: (userId: string) => {
      const entry = createLogEntry('debug', 'AUTH', 'Session refreshed', undefined, userId);
      storeLog(entry);
      if (shouldEmitToConsole('debug')) console.debug(formatLogMessage(entry));
    },
  },

  // Supabase/API events
  api: {
    request: (table: string, operation: string, userId?: string) => {
      const entry = createLogEntry('debug', 'API', `${operation} on ${table}`, undefined, userId);
      storeLog(entry);
      if (shouldEmitToConsole('debug')) console.debug(formatLogMessage(entry));
    },
    success: (table: string, operation: string, count?: number) => {
      const entry = createLogEntry('info', 'API', `${operation} on ${table} succeeded`, { count });
      storeLog(entry);
      if (shouldEmitToConsole('info')) console.log(formatLogMessage(entry), entry.data);
    },
    error: (table: string, operation: string, error: string) => {
      const entry = createLogEntry('error', 'API', `${operation} on ${table} failed`, { error });
      storeLog(entry);
      if (shouldEmitToConsole('error')) console.error(formatLogMessage(entry), entry.data);
    },
  },

  // Critical actions
  action: {
    signalActivated: (userId: string, activity: string) => {
      const entry = createLogEntry('info', 'ACTION', 'Signal activated', { activity }, userId);
      storeLog(entry);
      if (shouldEmitToConsole('info')) console.log(formatLogMessage(entry), entry.data);
    },
    signalDeactivated: (userId: string) => {
      const entry = createLogEntry('info', 'ACTION', 'Signal deactivated', undefined, userId);
      storeLog(entry);
      if (shouldEmitToConsole('info')) console.log(formatLogMessage(entry));
    },
    interactionCreated: (userId: string, targetUserId: string) => {
      const entry = createLogEntry('info', 'ACTION', 'Interaction created', { targetUserId }, userId);
      storeLog(entry);
      if (shouldEmitToConsole('info')) console.log(formatLogMessage(entry), entry.data);
    },
    feedbackGiven: (userId: string, interactionId: string, positive: boolean) => {
      const entry = createLogEntry('info', 'ACTION', 'Feedback given', { interactionId, positive }, userId);
      storeLog(entry);
      if (shouldEmitToConsole('info')) console.log(formatLogMessage(entry), entry.data);
    },
    reportSubmitted: (userId: string, reason: string) => {
      const entry = createLogEntry('warn', 'ACTION', 'Report submitted', { reason }, userId);
      storeLog(entry);
      if (shouldEmitToConsole('warn')) console.warn(formatLogMessage(entry), entry.data);
    },
  },

  // UI errors
  ui: {
    error: (componentName: string, error: string, stack?: string) => {
      const entry = createLogEntry('error', 'UI', `Error in ${componentName}`, { error, stack });
      storeLog(entry);
      if (shouldEmitToConsole('error')) console.error(formatLogMessage(entry), entry.data);
    },
    warning: (message: string, context?: Record<string, unknown>) => {
      const entry = createLogEntry('warn', 'UI', message, context);
      storeLog(entry);
      if (shouldEmitToConsole('warn')) console.warn(formatLogMessage(entry), entry.data);
    },
  },

  // Get logs for diagnostics
  getRecentLogs: (count: number = 50): LogEntry[] => {
    return logHistory.slice(-count);
  },

  // Get errors only
  getRecentErrors: (count: number = 20): LogEntry[] => {
    return logHistory.filter(l => l.level === 'error').slice(-count);
  },

  // Clear logs
  clearLogs: () => {
    logHistory.length = 0;
  },
};

// Export type for diagnostics component
export type { LogEntry };
