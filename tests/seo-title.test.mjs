import assert from "node:assert/strict";
import test from "node:test";
import { hasValidBrandTitle } from "../scripts/lib/seo-title.mjs";

test("the ikigai landing page accepts its approved program title", () => {
  assert.equal(hasValidBrandTitle("/ikigai-launchpad", "ikigai Launchpad | Startup Accelerator in Taipei"), true);
});

test("the program title exception does not relax branding on other routes or titles", () => {
  assert.equal(hasValidBrandTitle("/resources", "ikigai Launchpad | Startup Accelerator in Taipei"), false);
  assert.equal(hasValidBrandTitle("/ikigai-launchpad", "Startup Accelerator in Taipei"), false);
  assert.equal(hasValidBrandTitle("/ikigai-launchpad", "ikigai Launchpad | Unapproved title"), false);
});

test("standard titles still require the 886 Studios brand at either end", () => {
  assert.equal(hasValidBrandTitle("/", "886 Studios | Build What's Next"), true);
  assert.equal(hasValidBrandTitle("/resources/term-sheet-guide", "Startup Term Sheet Guide: Terms & Examples | 886 Studios"), true);
  for (const title of [undefined, "", "Resources", "Meet 886 Studios Today"]) {
    assert.equal(hasValidBrandTitle("/resources", title), false);
  }
});
