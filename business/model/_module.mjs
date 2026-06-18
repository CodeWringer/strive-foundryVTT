import CharacterAttribute from "./attribute/character-attribute.mjs";
import { constants } from "./const/_module.mjs";
import { dataField } from "./data-field/_module.mjs";
import { dataModel } from "./data-model/_module.mjs";
import { document } from "./document/_module.mjs";

export {
  CharacterAttribute,
  constants,
  dataField,
  dataModel,
  document,
};

/**
 * Wraps the `business.model` module.
 * 
 * Note the `init` function MUST be called during system setup!
 */
export const model = {
  attribute: {
    CharacterAttribute: CharacterAttribute,
  },
  const: constants,
  dataField: dataField,
  dataModel: dataModel,
  document: document,
  /**
   * Initialization, which MUST be called during system setup!
   * 
   * Ensures data models and documents are registered.
   */
  init: () => {
    // Ensure data model classes are registered.
    dataModel.init();
    // Ensure document classes are registered. 
    document.init();
  },
};
