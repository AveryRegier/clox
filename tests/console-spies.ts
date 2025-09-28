import { vi } from 'vitest';
import Chance from 'chance';
export const chance = new Chance();
export const consoleLogSpy = vi.spyOn(console, 'log');
export const consoleDebugSpy = vi.spyOn(console, 'debug');
export const consoleWarnSpy = vi.spyOn(console, 'warn');
export const consoleErrorSpy = vi.spyOn(console, 'error');
