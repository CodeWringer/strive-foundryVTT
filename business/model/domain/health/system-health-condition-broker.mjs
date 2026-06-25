import { DOCUMENT_COLLECTION_SOURCES, DocumentFetcher, TransientHealthCondition } from "../../document/_module.mjs"
import { GENERAL_DOCUMENT_TYPES } from "../../document/general-document-types.mjs"
import { ITEM_TYPES } from "../const/item-types.mjs"

/**
 * Provides synchronous access to the system-defined Health Conditions, 
 * to be found in the `"strive.health-conditions"` pack. 
 * 
 * Ensure that the `preload` method is called during system set-up! 
 */
export default class SystemHealthConditionBroker {
  /**
   * Static accessor for all system-defined health conditions. 
   * 
   * @type {Array<TransientHealthCondition>}
   * @static
   * @readonly
   */
  static conditions = [];

  /**
   * @async
   * @static
   */
  static async preload() {
    const documents = await new DocumentFetcher().findAll({
      documentType: GENERAL_DOCUMENT_TYPES.ITEM,
      contentType: ITEM_TYPES.health_condition,
      source: DOCUMENT_COLLECTION_SOURCES.systemCompendia,
      sourcePackId: "strive.health-conditions",
      searchEmbedded: false,
      includeLocked: true,
    });
    SystemHealthConditionBroker.conditions = documents.map(it => it.getTransientObject());
  }
}
