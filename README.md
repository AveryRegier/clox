# clox

A simple contextual logger for Node.js and TypeScript that writes structured JSON logs to the console.

## Features

- Logs messages with context in JSON format
- Supports log levels: debug, info, warn, error
- Error logging with stack trace and metadata
- Create child loggers with additional context
- Lightweight, zero dependencies
- Just writes the logs to the console.

## Installation

```bash
npm install clox
```

## Usage

```typescript
import logger from 'clox';

// Basic logging
logger.info('User logged in', { user: 'John Doe' });

// Error logging
try {
// an error is thrown
} catch (err) {
logger.error(err, "Error while doing something important", { action: 'the-important-thing' });
}
// Child logger with context
const userLogger = logger.child({ user: 'Jane' });
userLogger.debug('Fetching profile');
```

The default log level is 'info'.
```typescript
logger.level = 'debug'; // show all logs
```

## License

Apache-2.0
