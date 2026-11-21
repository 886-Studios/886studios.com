interface DeploymentEnvironment {
  PROD?: boolean;
  VERCEL?: string;
  VERCEL_ENV?: string;
}

// These public pages are served through Vercel rewrites and have no Astro build output.
export const publicProxiedPages = ["/timer", "/itimer"] as const;

export function isProductionDeployment(environment: DeploymentEnvironment) {
  return environment.PROD === true &&
    environment.VERCEL === "1" &&
    environment.VERCEL_ENV === "production";
}
