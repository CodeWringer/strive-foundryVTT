import { constants } from "./const/_module.mjs";
import { dataField } from "./data-field/_module.mjs";
import { dataModel } from "./data-model/_module.mjs";
import { document } from "./document/_module.mjs";
import { domain } from "./domain/_module.mjs";
import Ruleset from "./domain/ruleset.mjs";
import Modifier from "./modifier.mjs";
import { Sum, SumComponent } from "./summed-data.mjs";

export {
  constants,
  dataField,
  dataModel,
  document,
  domain,
  Sum,
  SumComponent,
  Modifier,
  Ruleset,
};

/**
 * Wraps the `business.model` module, which contains all data models, both for the 
 * backend and for use in the frontend. 
 * 
 * Note the `init` function MUST be called during system setup!
 */
export const model = {
  const: constants,
  dataField: dataField,
  dataModel: dataModel,
  document: document,
  domain: domain,
  Sum: Sum,
  SumComponent: SumComponent,
  Modifier: Modifier,
  Ruleset: Ruleset,
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
