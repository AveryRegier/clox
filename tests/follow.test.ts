import { describe, it, expect, afterEach } from 'vitest';
import { MetaData, MetaDataValue, getLogger, Follower, addContext, addContexts } from '../src/index.js';
import { consoleLogSpy } from './console-spies.js';

describe('follow', () => {
    it('should follow the context', async () => {
        const logger = getLogger();
        const follower = new Follower(logger);
        var contextId: MetaDataValue | undefined;
        await follower.follow(async () => {
            contextId = getLastContextId();
            expect(consoleLogSpy).toHaveBeenLastCalledWith('Following context', { contextId, level: 'info', logType: 'start', timestamp: expect.any(String) });
            getLogger().info('Inside follow function', { testKey: 'testValue' });
            expect(consoleLogSpy).toHaveBeenLastCalledWith('Inside follow function', { contextId, testKey: 'testValue', level: 'info', timestamp: expect.any(String) });
        });
        expect(consoleLogSpy).toHaveBeenLastCalledWith('Finished following context', { contextId, level: 'info', logType: 'end', timestamp: expect.any(String) });
    });

    it('should not create new contextId if already present in the store', async () => {
        const logger = getLogger();
        const follower = new Follower(logger);
        logger.info('Before follow function');
        const contextIdBefore = getLastContextId();
        expect(contextIdBefore).toBeUndefined();
        let contextId: MetaDataValue | undefined;
        await follower.follow(async () => {
            // save the contextId from the first log
            contextId = getLastContextId();
            expect(consoleLogSpy).toHaveBeenLastCalledWith('Following context', { contextId, level: 'info', logType: 'start', timestamp: expect.any(String) });
            getLogger().info('Inside follow function with existing contextId', { testKey: 'testValue' });
            expect(consoleLogSpy).toHaveBeenLastCalledWith('Inside follow function with existing contextId', { contextId, level: 'info', testKey: 'testValue', timestamp: expect.any(String) });

            const follower2Logger = getLogger();
            const followerChild = new Follower(follower2Logger);
            await followerChild.follow(async () => {
                expect(consoleLogSpy).toHaveBeenLastCalledWith('Following context', { contextId, level: 'info', logType: 'start', timestamp: expect.any(String) });
                const libraryLogger = getLogger();
                libraryLogger.info('Inside child follow function', { testKey: 'testValue2' });
                expect(consoleLogSpy).toHaveBeenLastCalledWith('Inside child follow function', { contextId, level: 'info', testKey: 'testValue2', timestamp: expect.any(String) });
            });
            expect(consoleLogSpy).toHaveBeenLastCalledWith('Finished following context', { contextId, level: 'info', logType: 'end', timestamp: expect.any(String) });
        });
        expect(consoleLogSpy).toHaveBeenLastCalledWith('Finished following context', { contextId, logType: "end", timestamp: expect.any(String), level: 'info' });
        logger.info('After follow function');
        const contextIdAfter = getLastContextId();
        expect(contextIdAfter).toBeUndefined();
    });

    it('will add context inside follow', async () => {
        const logger = getLogger();
        const follower = new Follower(logger);
        let contextId: MetaDataValue | undefined;

        await follower.follow(async () => {
            contextId = getLastContextId();
            expect(consoleLogSpy).toHaveBeenLastCalledWith('Following context', { contextId, level: 'info', logType: 'start', timestamp: expect.any(String) });
            expect(logger.addContext('testKey', 'testValue')).toBe(logger);
            expect(logger.addContext('nullKey', null)).toBe(logger);
            expect(logger.addContext('undefinedKey', undefined)).toBe(logger);
            expect(logger.addContexts({ anotherKey: 'anotherValue', anotherNullKey: null, anotherUndefinedKey: undefined })).toBe(logger);
            expect(logger.addContexts(undefined as unknown as MetaData)).toBe(logger);
            getLogger().info('Inside follow function');
            expect(consoleLogSpy).toHaveBeenLastCalledWith('Inside follow function', { contextId, level: 'info', timestamp: expect.any(String), testKey: 'testValue', anotherKey: 'anotherValue' });
        });
        expect(consoleLogSpy).toHaveBeenLastCalledWith('Finished following context', { contextId, level: 'info', logType: 'end', timestamp: expect.any(String) });
    });

    function getLastContextId() {
        return (consoleLogSpy.mock.calls[consoleLogSpy.mock.calls.length - 1][1] as MetaData)?.contextId;
    }

    afterEach(() => {
        consoleLogSpy.mockClear();
    });
});
