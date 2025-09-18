import { vi } from 'vitest';
import Chance from 'chance';
const chance = new Chance();
const consoleLogSpy = vi.spyOn(console, 'log');
const consoleDebugSpy = vi.spyOn(console, 'debug');
const consoleWarnSpy = vi.spyOn(console, 'warn');
const consoleErrorSpy = vi.spyOn(console, 'error');
import logger, { MetaData, getLogger } from '../src/index';
import { describe, it, expect, afterAll } from 'vitest';
describe('Logger', () => {
  it('logs a message with context', () => {
    const childLogger = logger.child({ user: 'test-user' });
    childLogger.info('Test message', { action: 'test-action' });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Test message',
      expect.objectContaining({
        user: 'test-user',
        action: 'test-action',
        level: 'info',
      })
    );
  });

  it('logs an error with context', () => {
    const childLogger = logger.child({ user: 'test-user' });
    childLogger.error('Test error', { action: 'test-action' });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Test error',
      expect.objectContaining({
        user: 'test-user',
        action: 'test-action',
        level: 'error',
      })
    );
  });

  it('logs error details', () => {
    const childLogger = logger.child({ user: 'test-user' });
    const expectedMsg = chance.sentence();
    var errorMeta;
    try {
      throw new Error('Test error details');
    } catch (err) {
      childLogger.error(err, expectedMsg, { action: 'test-action' });
      errorMeta = { message: err.message, name: err.name, stack: err.stack };
    }
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expectedMsg,
      expect.objectContaining({
        user: 'test-user',
        action: 'test-action',
        err: errorMeta,
        level: 'error',
        timestamp: expect.stringMatching(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$/)
      })
    );
  });

  it('respects log level', () => {
    const testLogger = logger.child({ component: 'test' });
    testLogger.level = 'warn';
    testLogger.info('This should not appear');
    testLogger.debug('This should also not appear');
    testLogger.warn('This is a warning');
    testLogger.error('This is an error');
    expect(consoleLogSpy).not.toHaveBeenCalledWith('This should not appear', expect.anything());
    expect(consoleLogSpy).not.toHaveBeenCalledWith('This should also not appear', expect.anything());
    expect(consoleWarnSpy).toHaveBeenCalledWith('This is a warning', expect.objectContaining({ level: 'warn', component: 'test' }));
    expect(consoleErrorSpy).toHaveBeenCalledWith('This is an error', expect.objectContaining({ level: 'error', component: 'test' }));
  });

  it('writes debug logs when level is set to debug', () => {
    const testLogger = logger.child({ component: 'test' });
    testLogger.level = 'debug';
    testLogger.debug('This is a debug message');
    expect(consoleDebugSpy).toHaveBeenCalledWith('This is a debug message', expect.objectContaining({ level: 'debug', component: 'test' }));
  });

  it('logs error object with message and extra context', () => {
    const testLogger = getLogger({ component: 'test' }) as import('../src/index').Logger;
    testLogger.level = 'error';
    try {
      throw new Error('Something went wrong');
    } catch (err) {
      testLogger.error(err, 'Custom error message', { foo: 'bar' });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Custom error message',
        expect.objectContaining({
          component: 'test',
          foo: 'bar',
          err: expect.objectContaining({
            message: 'Something went wrong',
            name: 'Error',
            stack: expect.any(String)
          }),
          level: 'error',
          timestamp: expect.any(String)
        })
      );
    }
  });


  it('logs error with default message when no message is provided', () => {
    const testLogger = getLogger({ component: 'test' });
    testLogger.level = 'error';
    const error = new Error('Default error message');
    testLogger.error(error);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Default error message',
      expect.objectContaining({
        component: 'test',
        err: expect.objectContaining({
          message: 'Default error message',
          name: 'Error',
          stack: expect.any(String)
        }),
        level: 'error',
        timestamp: expect.any(String)
      })
    );
  });

  it('child returns same logger for empty or same context', () => {
    const baseLogger = getLogger({ foo: 'bar' });
    expect(baseLogger.child({})).toBe(baseLogger);
    expect(baseLogger.child(baseLogger["context"])).toBe(baseLogger);
  });
  it('logs an error with context', () => {
    const childLogger = logger.child({ user: 'test-user' });
    childLogger.error('Test error', { action: 'test-action' });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Test error',
      expect.objectContaining({
        user: 'test-user',
        action: 'test-action',
        level: 'error',
      })
    );
  });
  it('logs error details', () => {
    const childLogger = logger.child({ user: 'test-user' });
    const expectedMsg = chance.sentence();
    var errorMeta;
    try {
      throw new Error('Test error details');
    } catch (err) {
      childLogger.error(err, expectedMsg, { action: 'test-action' });
      errorMeta = { message: err.message, name: err.name, stack: err.stack };
    }
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expectedMsg,
      expect.objectContaining({
        user: 'test-user',
        action: 'test-action',
        err: errorMeta,
        level: 'error',
        timestamp: expect.stringMatching(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$/)
      })
    );
  });
  it('respects log level', () => {
    const testLogger = logger.child({ component: 'test' });
    testLogger.level = 'warn';
    testLogger.info('This should not appear');
    testLogger.debug('This should also not appear');
    testLogger.warn('This is a warning');
    testLogger.error('This is an error');
    expect(consoleLogSpy).not.toHaveBeenCalledWith('This should not appear', expect.anything());
    expect(consoleLogSpy).not.toHaveBeenCalledWith('This should also not appear', expect.anything());
    expect(consoleWarnSpy).toHaveBeenCalledWith('This is a warning', expect.objectContaining({ level: 'warn', component: 'test' }));
    expect(consoleErrorSpy).toHaveBeenCalledWith('This is an error', expect.objectContaining({ level: 'error', component: 'test' }));
  });
  it('writes debug logs when level is set to debug', () => {
    const testLogger = logger.child({ component: 'test' });
    testLogger.level = 'debug';
    testLogger.debug('This is a debug message');
    expect(consoleDebugSpy).toHaveBeenCalledWith('This is a debug message', expect.objectContaining({ level: 'debug', component: 'test' }));
  });
  it('logs error object with message and extra context', () => {
    const testLogger = getLogger({ component: 'test' }) as import('../src/index').Logger;
    testLogger.level = 'error';
    try {
      throw new Error('Something went wrong');
    } catch (err) {
      testLogger.error(err, 'Custom error message', { foo: 'bar' });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Custom error message',
        expect.objectContaining({
          component: 'test',
          foo: 'bar',
          err: expect.objectContaining({
            message: 'Something went wrong',
            name: 'Error',
            stack: expect.any(String)
          }),
          level: 'error',
          timestamp: expect.any(String)
        })
      );
    }
  });

  it('logs error with default message when no message is provided', () => {
    const testLogger = getLogger({ component: 'test' });
    testLogger.level = 'error';
    const error = new Error('Default error message');
    testLogger.error(error);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Default error message',
      expect.objectContaining({
        component: 'test',
        err: expect.objectContaining({
          message: 'Default error message',
          name: 'Error',
          stack: expect.any(String)
        }),
        level: 'error',
        timestamp: expect.any(String)
      })
    );
  });

  it('child returns same logger for empty or same context', () => {
    const baseLogger = getLogger({ foo: 'bar' });
    expect(baseLogger.child({})).toBe(baseLogger);
    expect(baseLogger.child(baseLogger["context"])).toBe(baseLogger);
  });

  it('logs error with default message when no message is provided', () => {
    const testLogger = getLogger({ component: 'test' });
    testLogger.level = 'error';
    const error = new Error('Default error message');
    testLogger.error(error);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Default error message',
      expect.objectContaining({
        component: 'test',
        err: expect.objectContaining({
          message: 'Default error message',
          name: 'Error',
          stack: expect.any(String)
        }),
        level: 'error',
        timestamp: expect.any(String)
      })
    );
  });

  it('child returns same logger for empty or same context', () => {
    const baseLogger = getLogger({ foo: 'bar' });
    expect(baseLogger.child({})).toBe(baseLogger);
    expect(baseLogger.child(baseLogger["context"])).toBe(baseLogger);
  });

  it('logs undefined error message correctly', () => {
    const testLogger = getLogger({ component: 'test' });
    testLogger.level = 'error';
    const error = undefined as unknown as Error;
    testLogger.error(error);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'undefined error',
      expect.objectContaining({
        component: 'test',
        err: expect.objectContaining({
          message: 'undefined error',
          name: 'undefined',
          stack: undefined
        }),
        level: 'error',
        timestamp: expect.any(String)
      })
    );
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});