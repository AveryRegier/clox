import { addContext, addContexts, _combineMetaData, _getContext } from "./context";

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
    (error: Error | unknown, msg?: string, ...args: MetaData[]): void;
  };
  child: (context: MetaData) => Logger;
  level: LogLevel;
  addContext(key: string, value: MetaDataValue): Logger;
  addContexts(context: MetaData): Logger;
}

class LoggerImpl implements Logger {
  private context: MetaData;
  public level: LogLevel;
  private levels: Record<string, number> = { debug: 0, info: 10, warn: 20, error: 30 };
  private consoleLevelMap = {
    debug: 'debug',
    info: 'log',
    warn: 'warn',
    error: 'error',
  }

  constructor(context: MetaData = _getContext() || {}, level: LogLevel = 'info') {
    this.context = context;
    this.level = level;
  }

  private log(level: LogLevel, msg: string, ...args: MetaData[]) {
    if(this.levels[level] < this.levels[this.level]) return;
    const allContext = { ..._combineMetaData(_getContext() || this.context, ...args), level, timestamp: new Date().toISOString() };
    (console as any)[this.consoleLevelMap[level]](msg, allContext);
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
  public error(error: Error | unknown, msg?: string, ...args: MetaData[]): void;
  public error(arg1: string | Error | unknown, ...rest: any[]): void {
    if (typeof arg1 === 'string') {
      this.log('error', arg1, ...rest);
    } else {
      const error: Error = arg1 as Error;
      const msg: string = rest[0] ?? error?.message ?? 'undefined error';
      const args: MetaData[] = rest.slice(1);
      const errorMeta: MetaData = { err: { message: error?.message ?? 'undefined error', name: error?.name ?? 'undefined', stack: error?.stack ?? undefined   } };
      this.log('error', msg, errorMeta, ...args);
    }
  }
  public child(context?: MetaData): Logger {
    const storeContext = _getContext();
    if(storeContext == null && (context == null || context === this.context || /* context is empty */ Object.keys(context).length === 0)) return this;
    const finalContext = _combineMetaData(this.context, storeContext, context)
    return new LoggerImpl(finalContext, this.level);
  }

  /**
   * Add contextual information, but only when the transaction is being followed.
   * @param key The key to add to the context.
   * @param value The value to add to the context.
   * If the value is undefined or null, it will not be added to the context.
   * @returns the logger for chaining.
   * @see Follower
   */
  public addContext(key: string, value: MetaDataValue): Logger {
    addContext(key, value);
    return this;
  }

  /**
   * Add contextual information, but only when the transaction is being followed.
   * @param context The object to add to the context.
   * The object passed in will not be mutated.  It will also not become the context itself.
   * If the object passed in is mutated later, the context will not change.
   * All the keys and values in the object will be copied to the context.
   * Any values that are undefined or null will not be added to the context, 
   * nor will they overwrite existing values in the context.
   * @returns the logger for chaining.
   * @see Follower
   */
  public addContexts(context: MetaData): Logger {
    addContexts(context);
    return this;
  }
}

export function getLogger(context?: MetaData): Logger {
  return new LoggerImpl(context); 
}

export default new LoggerImpl({});
