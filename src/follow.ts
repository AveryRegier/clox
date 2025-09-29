
import { uuidv7 } from 'uuidv7';
import { hasContextKey, runWithContext } from './context';
import { Logger, MetaData } from './logger';

export class Follower {

    private parentLogger: Logger;
    constructor(logger: Logger) {
        this.parentLogger = logger;
    }

    public async follow<Response>(
        fn: () => Response,
        init = (logger: Logger) => { },
        mapStatus: (response: Response) => MetaData = (response: any) => { return response?.statusCode ? { statusCode: response?.statusCode } : {} }
    ): Promise<Response> {
        const startTime = Date.now();
        const childContext: MetaData = {};
        if (!hasContextKey('contextId')) {
            childContext['contextId'] = uuidv7();
        }
        const logger = this.parentLogger.child(childContext);

        return runWithContext(childContext, async () => {
            let status: MetaData = {};
            try {
                init(logger);
                logger.info('Following context', { logType: "start" });
                const response = await fn();
                status = mapStatus(response);
                return response;
            } catch (error) {
                logger.error(error);
                throw error;
            } finally {
                const elapsedMillis = Date.now() - startTime;
                logger.info('Finished following context', { logType: "end", elapsedMillis, ...status });
            }
        });
    }
}