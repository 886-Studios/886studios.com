export function hasValidBrandTitle(route, title) {
  if (typeof title !== "string" || !title.trim()) return false;

  // The program landing page intentionally leads with its own brand.
  if (route === "/ikigai-launchpad" && title === "ikigai Launchpad | Startup Accelerator in Taipei") {
    return true;
  }

  return title.startsWith("886 Studios |") || title.endsWith("| 886 Studios");
}
