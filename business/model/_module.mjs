import { dataField } from "./data-field/_module.mjs";
import { dataModel } from "./data-model/_module.mjs";
import { document } from "./document/_module.mjs";
import { domain } from "./domain/_module.mjs";

/**
 * Wraps the `business.model` module, which contains all data models, both for the 
 * backend and for use in the frontend. 
 * 
 * Note the `init` function MUST be called during system setup!
 */
export const model = {
  dataField: dataField,
  dataModel: dataModel,
  document: document,
  domain: domain,
  /**
   * Initialization, which MUST be called during system setup!
   * 
   * Ensures data models and documents are registered.
   */
  init: () => {
    dataModel.init();
    document.init();
    domain.init();
  },
};
