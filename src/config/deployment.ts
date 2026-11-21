interface DeploymentEnvironment {
  PROD?: boolean;
  VERCEL?: string;
  VERCEL_ENV?: string;
}

// These indexable pages are served through Vercel rewrites and have no Astro build output.
export const indexableProxiedPages = ["/timer"] as const;

export function isProductionDeployment(environment: DeploymentEnvironment) {
  return environment.PROD === true &&
    environment.VERCEL === "1" &&
    environment.VERCEL_ENV === "production";
}
