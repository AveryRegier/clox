import { Follower, FollowInit, MapStatus } from './follow';
import { getLogger, Logger, MetaData } from './logger';

const wrapClassWithFollowerForEachPublicMethod = <T extends { new(...args: any[]): {} }>(OriginalClass: T, init?: FollowInit, mapStatus?: MapStatus<any>) => {
    return class extends OriginalClass {
        _follower: Follower;
        _followInit: FollowInit | undefined;
        _mapStatus: MapStatus<any> | undefined;

        constructor(...args: any[]) {
            super(...args);
            const metaData: MetaData = { cn: OriginalClass.name };
            const logger = getLogger().child(metaData);
            this._follower = new Follower(logger);
            this._followInit = init;
            this._mapStatus = mapStatus;
            this._init();
        }

        // wrap each public method with follower
        _init() {
            const methodNames = this._getMethodNames();
            for (const name of methodNames) {
                (this as any)[name] = this._wrapMethod(name);
            }
        }

        // determine if a property is a method and is public
        // excluding constructor and methods starting with _
        // also excluding getLogger, addContext, addContexts
        // also excluding methods that are not functions
        // also excluding static methods
        // also excluding methods from Object.prototype
        // also excluding methods from OriginalClass.prototype that are not own properties
        // also excluding methods from OriginalClass.prototype that are not enumerable
        // also excluding methods from OriginalClass.prototype that are not writable
        // also excluding methods from OriginalClass.prototype that are not configurable
        // also excluding methods from OriginalClass.prototype that are not functions
        // also excluding methods from OriginalClass.prototype that are not public
        // also excluding methods from OriginalClass.prototype that are not instance methods
        _isMethod(name: string): boolean {
            if (name === 'constructor') return false;
            if (name.startsWith('_')) return false;
            const prop = (this as any)[name];
            if (typeof prop !== 'function') return false;
            if (prop.prototype && prop.prototype.constructor !== prop) return false;
            if (!Object.prototype.hasOwnProperty.call(OriginalClass.prototype, name)) return false;
            const descriptor = Object.getOwnPropertyDescriptor(OriginalClass.prototype, name);
            if (!descriptor) return false;
            // if the method is not async, exclude it
            if (descriptor.value && descriptor.value.constructor.name !== 'AsyncFunction') return false;
            if (descriptor.get || descriptor.set) return false; // exclude getters and setters
            return true;
        }
        _getMethodNames(): string[] {
            const methodNames: string[] = [];
            let obj = OriginalClass.prototype;
            while (obj) {
                const keys = Object.getOwnPropertyNames(obj);
                for (const key of keys) {
                    if (this._isMethod(key)) {
                        methodNames.push(key);
                    }
                }
                obj = Object.getPrototypeOf(obj);
            }
            return methodNames;
        }
        // wrap each method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _wrapMethod(name: string): any {
            const originalMethod = (this as any)[name];
            const wrappedMethod = async (...args: any[]) => {
                // get argument names
                const metaData: MetaData = this._createMetaData(name, originalMethod, args);
                return await this._follower.follow(async () => { 
                    return await originalMethod.apply(this, args);
                }, (logger) => {
                    if (this._followInit) {
                        this._followInit(logger);
                    }
                    logger.addContexts(metaData);
                }, this._mapStatus);
            };
            return wrappedMethod;
        }
        _createMetaData(name: string, originalMethod: any, args: any[]): MetaData {
            const argNames = this._getArgNames(originalMethod);
            // create metadata for each argument
            const metaData: MetaData = {
                fn: name,
            };
            for (let i = 0; i < args.length; i++) {
                const value = args[i];
                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                    metaData[argNames[i]] = value;
                }
            }
            return metaData;
        }
        _getArgNames(originalMethod: any): string[] {
            const argNames: string[] = [];
            const fnStr = originalMethod.toString();
            const result = fnStr.match(/\(([^)]*)\)/);
            if (result) {
                const params = result[1].split(',');
                for (const param of params) {
                    const trimmed = param.trim();
                    if (trimmed) {
                        argNames.push(trimmed);
                    }
                }
            }
            return argNames;
        }
    };
}

export {wrapClassWithFollowerForEachPublicMethod as followClass};