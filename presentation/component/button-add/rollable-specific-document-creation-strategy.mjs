import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import { GENERAL_DOCUMENT_TYPES } from "../../../business/document/general-document-types.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import ConfirmableModalDialog from "../../dialog/confirmable-modal-dialog/confirmable-modal-dialog.mjs";
import RollableSelectionModalDialog from "../../dialog/rollable-selection-modal-dialog/rollable-selection-modal-dialog.mjs";
import DocumentCreationStrategy from "./document-creation-strategy.mjs";

/**
 * Adds a new, blank Expertise to the given `target` skill document instance. 
 * 
 * Does not prompt for anything and can not be canceled. 
 * 
 * @extends DocumentCreationStrategy
 */
export default class RollableSpecificDocumentCreationStrategy extends DocumentCreationStrategy {
  /**
   * @param {Object} args 
   * @param {String} args.rollTableName 
   * @param {TransientBaseActor | undefined} args.target The Actor document instance on which 
   * to embed the new document instance. 
   * @param {Object | undefined} args.creationDataOverrides Overrides applied to the selected 
   * creation data. Can be used to override a specific property, while leaving 
   * the others untouched. For example, to set a starting level for a skill Item. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["rollTableName"]);

    this.rollTableName = args.rollTableName;
    this.creationDataOverrides = args.creationDataOverrides ?? Object.create(null);
  }

  /**
   * Returns a RollTable instance with the given id. 
   * 
   * @returns {RollTable} A FoundryVTT RollTable instance. 
   * 
   * @async
   * @private
   */
  async _getRollTable() {
    const rollTable = await new DocumentFetcher().find({
      name: this.rollTableName,
      documentType: GENERAL_DOCUMENT_TYPES.ROLLTABLE,
      includeLocked: true,
    });

    if (!ValidationUtil.isDefined(rollTable)) {
      throw new Error("Failed to get RollTable"); 
    }

    return rollTable;
  }

  /** @override */
  async _get() {
    const rollTable = await this._getRollTable();

    const dialog = await new RollableSelectionModalDialog({
      rollTable: rollTable,
    }).renderAndAwait();
    // const r = await rollTable.roll();
    // r.documentId // "OvAqbzQwCJ0vi0jF"
    // r.documentCollection // "strive.illnesses"
  }
}
