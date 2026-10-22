import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, resolve } from 'node:path';
import { ConfigurationError, readRuntimeConfig } from '../src/config.mjs';

export function validateRelease({ env, project, nodeVersion = process.versions.node }) {
  const version = /^22\.(\d+)\.(\d+)$/.exec(nodeVersion);
  if (!version || Number(version[1]) < 23 || (Number(version[1]) === 23 && Number(version[2]) < 4)) {
    throw new ConfigurationError('Node.js (requires >=22.23.4 <23)');
  }
  const config = readRuntimeConfig(env, { strict: true });
  if (config.origin !== 'https://www.886studios.com') throw new ConfigurationError('APP_ORIGIN');
  if (config.basePath !== '/perks') throw new ConfigurationError('APP_BASE_PATH');
  if (project?.projectName !== '886-studios-perks' || !/^prj_[a-zA-Z0-9]+$/.test(project?.projectId ?? '') ||
      typeof project.orgId !== 'string' || !project.orgId ||
      (env.VERCEL_PROJECT_ID !== undefined && env.VERCEL_PROJECT_ID !== project.projectId) ||
      (env.VERCEL_ORG_ID !== undefined && env.VERCEL_ORG_ID !== project.orgId)) {
    throw new ConfigurationError('.vercel/project.json / VERCEL_PROJECT_ID / VERCEL_ORG_ID');
  }
  // Deliberately return no configuration values or secret-bearing object.
  return ['Node.js', 'PERKS_ACCESS_CODE', 'PERKS_SESSION_SECRET', 'APP_ORIGIN', 'APP_BASE_PATH', 'PORT', '.vercel/project.json'];
}

export function runPreflight({ env = process.env, root = fileURLToPath(new URL('..', import.meta.url)) } = {}) {
  let project;
  try { project = JSON.parse(readFileSync(join(root, '.vercel/project.json'), 'utf8')); }
  catch { throw new ConfigurationError('.vercel/project.json'); }
  return validateRelease({ env, project });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    console.log(`Release configuration valid: ${runPreflight().join(', ')}.`);
    console.log('Local project link checked. Verify the remote project and deployed IP/header behavior before publishing.');
    console.log('Cross-instance login throttling is a deployment check; the built-in limiter is process-local.');
  } catch (error) {
    console.error(error instanceof ConfigurationError ? error.message : 'Release configuration preflight failed.');
    process.exitCode = 1;
  }
}
