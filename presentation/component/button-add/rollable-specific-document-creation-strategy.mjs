import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import { GENERAL_DOCUMENT_TYPES } from "../../../business/document/general-document-types.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import RollableSelectionModalDialog from "../../dialog/rollable-selection-modal-dialog/rollable-selection-modal-dialog.mjs";
import DocumentCreationStrategy from "./document-creation-strategy.mjs";

/**
 * Adds a new, blank Expertise to the given `target` skill document instance. 
 * 
 * Does not prompt for anything and can not be canceled. 
 * 
 * @property {String} selectedRollTable The currently selected RollTable's name. 
 * @property {String} localizedSelectionType The localized type of document 
 * that is rollable. E. g. `"Injury"`. 
 * @property {TransientBaseActor | undefined} target The Actor document instance on which 
 * to embed the new document instance. 
 * @property {Object | undefined} creationDataOverrides Overrides applied to the selected 
 * creation data. Can be used to override a specific property, while leaving 
 * the others untouched. For example, to set a starting level for a skill Item. 
 * 
 * @extends DocumentCreationStrategy
 */
export default class RollableSpecificDocumentCreationStrategy extends DocumentCreationStrategy {
  /**
   * @param {Object} args 
   * @param {Array<String>} args.rollTables A list of the names of RollTables that should be 
   * available to choose from. If only one is provided, then no RollTable choice is available. 
   * @param {String | undefined} args.localizedSelectionType The localized type of document 
   * that is rollable. E. g. `"Injury"`. 
   * @param {String | undefined} args.selectedRollTable Name of the RollTable to pre-select. 
   * * default is the first entry of the `rollTables` list. 
   * @param {TransientBaseActor | undefined} args.target The Actor document instance on which 
   * to embed the new document instance. 
   * @param {Object | undefined} args.creationDataOverrides Overrides applied to the selected 
   * creation data. Can be used to override a specific property, while leaving 
   * the others untouched. For example, to set a starting level for a skill Item. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["rollTables"]);

    this.rollTables = args.rollTables;
    if (args.rollTables.length < 1) {
      throw new Error("Must provide at least one RollTable name");
    }

    this.selectedRollTable = args.selectedRollTable ?? args.rollTables[0].name;
    this.localizedSelectionType = args.localizedSelectionType;
  }

  /**
   * Returns a RollTable instance with the given id. 
   * 
   * @param {String} rollTableName Name of the RollTable to get. 
   * 
   * @returns {RollTable} A FoundryVTT RollTable instance. 
   * 
   * @async
   * @private
   */
  async _getRollTable(rollTableName) {
    const rollTable = await new DocumentFetcher().find({
      name: rollTableName,
      documentType: GENERAL_DOCUMENT_TYPES.ROLLTABLE,
      includeLocked: true,
    });

    if (!ValidationUtil.isDefined(rollTable)) {
      throw new Error("Failed to get RollTable"); 
    }

    return rollTable;
  }

  /** @override */
  async _getCreationData() {
    const rollTables = [];
    for await (const rollTableName of this.rollTables) {
      const rollTable = await this._getRollTable(rollTableName);
      rollTables.push(rollTable);
    }

    const dialog = await new RollableSelectionModalDialog({
      rollTables: rollTables,
      localizedSelectionType: this.localizedSelectionType,
      selectedRollTable: this.selectedRollTable,
    }).renderAndAwait();
    
    if (!dialog.confirmed) return; // User canceled

    const document = await new DocumentFetcher().find({
      id: dialog.viewModel.selected.id,
    });
    return {
      name: document.name,
      type: document.type,
      system: {
        ...document.system,
        isCustom: false,
      }
    };
  }
}
