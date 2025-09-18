export type BasicMetaDataValue = string | number | boolean | null | undefined | MetaData;
export type MetaDataValue = BasicMetaDataValue | BasicMetaDataValue[];
export interface MetaData {
  [key: string]: MetaDataValue;
}
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';  

export type Logger = {
  debug: (msg: string, ...args: MetaData[]) => void;
  info: (msg: string, ...args: MetaData[]) => void;
  warn: (msg: string, ...args: MetaData[]) => void;
  error: {
    (msg: string, ...args: MetaData[]): void;
    (error: Error, msg?: string, ...args: MetaData[]): void;
  };
  child: (context: MetaData) => Logger;
  level: LogLevel;
}

class LoggerImpl implements Logger {
  private context: MetaData;
  public level: LogLevel = 'info'; 
  private levels: Record<string, number> = { debug: 0, info: 10, warn: 20, error: 30 };
  private consoleLevelMap = {
    debug: 'debug',
    info: 'log',
    warn: 'warn',
    error: 'error',
  }

  constructor(context: MetaData = {}) {
    this.context = context;
  }
  private log(level: LogLevel, msg: string, ...args: MetaData[]) {
    if(this.levels[level] < this.levels[this.level]) return;
    const allContext = { ...this.combineMetaData(this.context, ...args), level, timestamp: new Date().toISOString() };
    (console as any)[this.consoleLevelMap[level]](msg, allContext);
  }

  private combineMetaData(initial: MetaData, ...args: MetaData[]): MetaData {
    return args.reduce((acc, curr) => ({ ...acc, ...curr }), initial);
  }

  public debug(msg: string, ...args: any[]) {
    this.log('debug', msg, ...args);
  }
  public info(msg: string, ...args: any[]) {
    this.log('info', msg, ...args);
  }
  public warn(msg: string, ...args: any[]) {
    this.log('warn', msg, ...args);
  }
  public error(msg: string, ...args: MetaData[]): void;
  public error(error: Error, msg?: string, ...args: MetaData[]): void;
  public error(arg1: string | Error, ...rest: any[]): void {
    if (typeof arg1 === 'string') {
      this.log('error', arg1, ...rest);
    } else {
      const error: Error = arg1;
      const msg: string = rest[0] ?? error?.message ?? 'undefined error';
      const args: MetaData[] = rest.slice(1);
      const errorMeta: MetaData = { err: { message: error?.message ?? 'undefined error', name: error?.name ?? 'undefined', stack: error?.stack ?? undefined   } };
      this.log('error', msg, errorMeta, ...args);
    }
  }
  public child(context: Record<string, any>): Logger {
    if(context == null || context === this.context || /* context is empty */ Object.keys(context).length === 0) return this;
    return new LoggerImpl({ ...this.context, ...context });
  }
}

export function getLogger(context: Record<string, any> = {}): Logger {
  return new LoggerImpl(context); 
}

export default new LoggerImpl({});
