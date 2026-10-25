import { LogEntry } from '../domain/types';

export const HERO_SCRIPTED_LOGS: Omit<LogEntry, 'id'>[] = [
  { timestamp: '12:41:02', level: 'INFO', service: 'gateway', message: 'upstream latency 124ms', requestId: 'req_8f102a' },
  { timestamp: '12:41:04', level: 'WARN', service: 'database', message: 'query latency 281ms', requestId: 'req_3e911c' },
  { timestamp: '12:41:07', level: 'WARN', service: 'database', message: 'query latency 643ms pool 91%', requestId: 'req_9a044b' },
  { timestamp: '12:41:09', level: 'WARN', service: 'payment', message: 'retry rate +18%', requestId: 'req_22c710' },
  { timestamp: '12:41:11', level: 'ERROR', service: 'gateway', message: 'error rate +7%', requestId: 'req_5d199a' },
  { timestamp: '12:41:13', level: 'WARN', service: 'engine', message: 'dependency risk elevated', requestId: 'sys_cascade_01' },
];

export const FILLER_LOG_MESSAGES: { service: string; message: string; level: 'INFO' | 'WARN' }[] = [
  { service: 'auth', message: 'session token validated (cache hit)', level: 'INFO' },
  { service: 'cache', message: 'redis read p95 3.8ms key_prefix=usr_sess', level: 'INFO' },
  { service: 'notification', message: 'dispatching event to webhook subscriber queue', level: 'INFO' },
  { service: 'storage', message: 's3 multipart chunk uploaded ok', level: 'INFO' },
  { service: 'gateway', message: 'HTTP 200 GET /v1/health nominal', level: 'INFO' },
  { service: 'frontend', message: 'client hydration complete bundle_hash=4a91f', level: 'INFO' },
  { service: 'payment', message: 'transaction pre-auth token reserved', level: 'INFO' },
  { service: 'database', message: 'vacuum analyze autocommit completed', level: 'INFO' },
];

let idCounter = 1000;

export function createLogEntry(
  timestamp: string,
  level: 'INFO' | 'WARN' | 'ERROR',
  service: string,
  message: string,
  requestId?: string
): LogEntry {
  return {
    id: `log_${++idCounter}`,
    timestamp,
    level,
    service,
    message,
    requestId: requestId || `req_${Math.random().toString(36).substring(2, 8)}`,
  };
}

export function generateSeededFillerLog(timestamp: string, index: number): LogEntry {
  const item = FILLER_LOG_MESSAGES[index % FILLER_LOG_MESSAGES.length];
  const reqSuffix = ((index * 37) % 9999).toString(16).padStart(4, '0');
  return {
    id: `log_${++idCounter}`,
    timestamp,
    level: item.level,
    service: item.service,
    message: item.message,
    requestId: `req_${reqSuffix}`,
  };
}
