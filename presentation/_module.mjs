import { util } from "./util/_module.mjs";
import FoundryWrapper from "../foundry-interop/foundry-wrapper.mjs";
import { application } from "./application/_module.mjs";
import { canvas } from "./canvas/_module.mjs";
import { font } from "./font/_module.mjs";
import RulesetExplainer from "./ruleset/ruleset-explainer.mjs";
import { sidebar } from "./application/sidebar/_module.mjs";
import { TEMPLATES } from "./templates.mjs";
import ViewModel from "./view-model/view-model.mjs";
import ViewModelCollection from "./view-model/view-model-collection.mjs";
import InputViewModel from "./view-model/input-view-model.mjs";
import { component } from "./component/_module.mjs";

export {
  application,
  TEMPLATES,
  canvas,
  sidebar,
  font,
  util,
  RulesetExplainer,
  ViewModel,
  ViewModelCollection,
  InputViewModel,
  component,
};

/**
 * Wraps the `presentation` module. 
 * 
 * IMPORTANT the `init` function MUST be called during the system's setup!
 */
export const presentation = {
  TEMPLATES: TEMPLATES,
  util: util,
  font: font,
  viewModel: {
    ViewModel: ViewModel,
    ViewModelCollection: ViewModelCollection,
    InputViewModel: InputViewModel,
  },
  application: application,
  canvas: canvas,
  sidebar: sidebar,
  RulesetExplainer: RulesetExplainer,
  component: component,
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
    await _preloadHandlebarsTemplates();
  },
  /**
   * Initialization to be called during the system's "setup" hook. 
   */
  setup: () => {
    util.setup();
  },
  /**
   * Initialization to be called during the system's "ready" hook. 
   */
  ready: () => {
    util.ready();
  },
};

/**
 * Returns the pre-loaded Handlebars templates, for fast access when rendering. 
 * 
 * @return {Promise<Any>}
 * 
 * @async
 * @private
 */
 export async function _preloadHandlebarsTemplates() {
  const templateArr = [];
  for (const propertyName in TEMPLATES) {
    templateArr.push(TEMPLATES[propertyName]);
  }
  return await new FoundryWrapper().loadTemplates(templateArr);
};
