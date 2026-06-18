import { DOCUMENT_COLLECTION_SOURCES } from "../../model/document/document-fetcher/document-collection-source.mjs"
import DocumentFetcher from "../../model/document/document-fetcher/document-fetcher.mjs"
import { GENERAL_DOCUMENT_TYPES } from "../../model/document/general-document-types.mjs"
import TransientHealthCondition from "../../model/document/item/transient-health-condition.mjs"

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
      contentType: business.model.const.ITEM_TYPES.HEALTH_CONDITION,
      source: DOCUMENT_COLLECTION_SOURCES.systemCompendia,
      sourcePackId: "strive.health-conditions",
      searchEmbedded: false,
      includeLocked: true,
    });
    SystemHealthConditionBroker.conditions = documents.map(it => it.getTransientObject());
  }
}
