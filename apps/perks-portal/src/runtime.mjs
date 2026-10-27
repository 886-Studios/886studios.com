import { ConfigurationError, readRuntimeConfig } from './config.mjs';
import { createHandler, createUnavailableHandler } from './server.mjs';

export function createProductionHandler({ root, env = process.env, vercel = false }) {
  try {
    const config = readRuntimeConfig(env);
    return createHandler({ root, ...config, vercel, creditsEnv: env });
  } catch (error) {
    console.error(error instanceof ConfigurationError ? error.message : 'Portal configuration unavailable.');
    return createUnavailableHandler();
  }
}
