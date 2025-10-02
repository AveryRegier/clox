import logger from './logger';
export default logger;
import { LogLevel, Logger, MetaData, MetaDataValue, BasicMetaDataValue, getLogger } from './logger';
export type { LogLevel, Logger, MetaData, MetaDataValue, BasicMetaDataValue };
export { getLogger };
export { Follower } from './follow';
export { addContext, addContexts } from './context';
export { followClass } from './proxy';
