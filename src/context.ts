
import { AsyncLocalStorage } from 'async_hooks';
import { MetaData, MetaDataValue } from './logger';

// Create an instance of AsyncLocalStorage
const asyncLocalStorage = new AsyncLocalStorage<MetaData>();

/**
 * Add contextual information, but only when the transaction is being followed.
 * @param key The key to add to the context.
 * @param value The value to add to the context.
 * If the value is undefined or null, it will not be added to the context.
 * @returns The value provided.
 * @see Follower
 */
export function addContext<T extends MetaDataValue>(key: string, value: T): T {
    const localContext = asyncLocalStorage.getStore();
    if (localContext && value !== undefined && value !== null) {
        localContext[key] = value;
    }
    return value;
}

/**
 * Add contextual information, but only when the transaction is being followed.
 * @param context The object to add to the context.
 * The object passed in will not be mutated.  It will also not become the context itself.
 * If the object passed in is mutated later, the context will not change.
 * All the keys and values in the object will be copied to the context.
 * Any values that are undefined or null will not be added to the context, 
 * nor will they overwrite existing values in the context.
 * @returns void.
 * @see Follower
 */
export function addContexts(context: MetaData): void {
    const localContext = asyncLocalStorage.getStore();
    if (!localContext || !context) return;
    for (const key in context) {
        const value = context[key];
        if(value !== undefined && value !== null) localContext[key] = value;
    }
}

// Excluding these from the public API for now, but may be added later.
export function hasContextKey(key: string): boolean {
    const localContext = asyncLocalStorage.getStore();
    if (!localContext) return false;
    return key in localContext;
}

export function runWithContext<Response>(context: MetaData, fn: () => Response): Response {
    const parentContext = asyncLocalStorage.getStore();
    if (parentContext) {
        context = { ...parentContext, ...context };
    }
    return asyncLocalStorage.run(context, fn);
}

// do not export in the public API
export function _getContext() {
    return asyncLocalStorage.getStore();
}

export function _combineMetaData(initial: MetaData, ...args: (MetaData | undefined)[]): MetaData {
    return args.reduce((acc, curr) => ({ ...acc, ...(curr || {}) }), initial) as MetaData;
}
