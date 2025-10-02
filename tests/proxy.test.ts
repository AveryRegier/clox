import { describe, it, expect } from 'vitest';
import { followClass } from '../src/proxy';
import { consoleLogSpy } from './console-spies';
import { afterEach } from 'node:test';

class TestClass {
    name: string;
    constructor(name: string) {
        this.name = name;
    }

    public async doSomething(input: string) {
        return this._privateMethod(input);
    }
    private async _privateMethod(input: string) {
        return input.toUpperCase();
    }
    public nonAsyncMethod(input: string) {
        return input.toLowerCase();
    }
}

describe('proxy', () => { 
    it('will log public async method calls', async () => {        
        const ProxiedTestClass = followClass(TestClass, (logger) => {
            logger.addContext('name', "TestInstance"); // FIXME would like to use the proxied classes properties here
        });
        const instance = new ProxiedTestClass('TestInstance');
        const result = await instance.doSomething('test');
        expect(result).toBe('TEST');
        expect(consoleLogSpy).toHaveBeenCalledWith('Following context', expect.objectContaining(
            {
                contextId: expect.any(String),
                cn: "TestClass",
                name: "TestInstance", 
                fn: 'doSomething', 
                input: 'test', 
                level: 'info', 
                logType: 'start', 
                timestamp: expect.any(String) 
            }
        ));
        expect(result).toBe('TEST');
        expect(consoleLogSpy).toHaveBeenCalledWith('Finished following context', expect.objectContaining(
            {
                contextId: expect.any(String),
                cn: "TestClass",
                name: "TestInstance",
                fn: 'doSomething', 
                input: 'test', 
                level: 'info', 
                logType: 'end', 
                timestamp: expect.any(String), 
                elapsedMillis: expect.any(Number) 
            }
        ));
    });

    it('will not log public non-async method calls', async () => {        
        const ProxiedTestClass = followClass(TestClass, (logger) => {
            logger.addContext('name', "TestInstance"); // FIXME would like to use the proxied classes properties here
        });
        const instance = new ProxiedTestClass('TestInstance');
        const result = instance.nonAsyncMethod('test');
        expect(result).toBe('test');
        expect(consoleLogSpy).not.toHaveBeenCalledWith('Following context', expect.objectContaining({fn: 'nonAsyncMethod'}));
        expect(consoleLogSpy).not.toHaveBeenCalledWith('Finished following context', expect.objectContaining({fn: 'nonAsyncMethod'}));
    });

    afterEach(() => {
        consoleLogSpy.mockClear();
    });
});