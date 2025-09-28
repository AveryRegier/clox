
import { uuidv7 } from 'uuidv7';
import { hasContextKey, runWithContext } from './context';
import { Logger, MetaData } from './logger';

export class Follower {

    private parentLogger: Logger;
    constructor(logger: Logger) {
        this.parentLogger = logger;
    }

    public async follow<Response>(fn: () => Response): Promise<Response> {
        const childContext: MetaData = {};
        if(!hasContextKey('contextId')) {
            childContext['contextId'] = uuidv7();
        }
        const logger = this.parentLogger.child(childContext);
        try {
            logger.info('Following context', {logType: "start"});
            return runWithContext(childContext, fn);
        } finally {
            logger.info('Finished following context', {logType: "end"});
        }
    }
}