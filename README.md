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

To install directly from a GitHub release tag instead of npm:

```bash
npm install github:AveryRegier/clox#v0.2.3
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

## Releasing

This repository is configured for GitHub releases (no npm publish step).

### Prerequisites

1. Conventional commits are used to determine version bumps and release notes.
2. GitHub Actions must be enabled for this repository.

### Commands

Preview the next release:

```bash
npm run release:dry
```

Create the release:

```bash
npm run release
```

After `npm run release`, the command creates and pushes a `vX.Y.Z` tag non-interactively.
That tag triggers GitHub Actions to create/update the GitHub Release, build the package,
and upload the `.tgz` artifact automatically. No manual upload step is required.

The release command will:

1. Calculate the next semver version from commit history.
2. Create a release commit and `vX.Y.Z` tag.
3. Push commit and tag.
4. Trigger GitHub Actions to create/update the GitHub Release and attach assets.

## Using a GitHub Release in package.json

For applications that previously used `file:` dependencies, switch to a GitHub tag reference.

```json
{
	"dependencies": {
		"clox": "github:AveryRegier/clox#v0.2.3"
	}
}
```

Update to a newer release by changing the tag (for example `v0.2.3`) and running install again.
If you need to roll back, pin to the previous known-good tag.

## License

Apache-2.0
