import { ConfigurationError, readRuntimeConfig } from './config.mjs';
import { createHandler, createUnavailableHandler } from './server.mjs';
import { createAccessServices } from './supabase-access.mjs';

export function createProductionHandler({ root, env = process.env, vercel = false }) {
  try {
    const config = readRuntimeConfig(env);
    const accessServices = createAccessServices({ root, env, secure: true, origin: config.origin, basePath: config.basePath });
    return createHandler({ root, ...config, vercel, creditsEnv: env, accessServices });
  } catch (error) {
    console.error(error instanceof ConfigurationError ? error.message : 'Portal configuration unavailable.');
    return createUnavailableHandler();
  }
}
