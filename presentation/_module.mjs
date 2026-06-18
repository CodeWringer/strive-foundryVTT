import FoundryWrapper from "../foundry-interop/foundry-wrapper.mjs";
import { application } from "./application/_module.mjs";
import { canvas } from "./canvas/_module.mjs";
import { font } from "./font/_module.mjs";
import { sidebar } from "./sidebar/_module.mjs";
import { TEMPLATES } from "./templates.mjs";

export {
  application,
  TEMPLATES,
  canvas,
  sidebar,
  font,
};

/**
 * Wraps the `presentation` module. 
 * 
 * IMPORTANT the `init` function MUST be called during the system's setup!
 */
export const presentation = {
  application: application,
  TEMPLATES: TEMPLATES,
  canvas: canvas,
  sidebar: sidebar,
  font: font,
  /**
   * Initialization, which MUST be called during system setup!
   * 
   * Ensures sheets are registered and preloads Handlebars templates.
   * 
   */
  init: async () => {
    application.init();
    canvas.init();
    sidebar.init();
    font.init();
    await preloadHandlebarsTemplates();
  },
  ready: () => {
  },
};

/**
 * Returns the pre-loaded Handlebars templates, for fast access when rendering. 
 * 
 * @return {Promise<Any>}
 * 
 * @async
 */
 export async function preloadHandlebarsTemplates() {
  const templateArr = [];
  for (const propertyName in TEMPLATES) {
    templateArr.push(TEMPLATES[propertyName]);
  }
  return await new FoundryWrapper().loadTemplates(templateArr);
};