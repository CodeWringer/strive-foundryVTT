import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import FoundryWrapper from "../../../common/foundry-wrapper.mjs";
import ConfirmableModalDialog from "../confirmable-modal-dialog/confirmable-modal-dialog.mjs";
import ModalDialog from "../modal-dialog/modal-dialog.mjs";
import RollableSelectionModalDialogViewModel from "./rollable-selection-modal-dialog-viewmodel.mjs";

export default class RollableSelectionModalDialog extends ConfirmableModalDialog {
  /** @override */
  static get defaultOptions() {
    return new FoundryWrapper().mergeObject(super.defaultOptions, {
      classes: [ModalDialog.DIALOG_ELEMENT_CLASS, "width-min-lg", "height-min-xxl"],
    });
  }

  /** @override */
  get template() { return game.strive.const.TEMPLATES.DIALOG_ROLLABLE_SELECTION; }

  /** @override */
  get id() { return "rollable-selection-dialog"; }
  
  /**
   * @param {Object} args 
   * @param {Array<RollTable>} args.rollTables A list of RollTables that the user can 
   * choose from. At least one **must** be provided! 
   * @param {String | undefined} args.selectedRollTable Name of the pre-selected RollTable. 
   * * default is the first of the given RollTables. 
   * @param {String | undefined} args.localizedSelectionType The localized type of document 
   * that is rollable. E. g. `"Injury"`. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["rollTables"]);

    this.rollTables = args.rollTables;
    if (args.rollTables.length < 1) {
      throw new Error("Must provide at least one RollTable name");
    }

    this.viewModel = new RollableSelectionModalDialogViewModel({
      ui: this,
      rollTables: args.rollTables,
      selectedRollTable: args.selectedRollTable ?? args.rollTables[0].name,
      localizedSelectionType: args.localizedSelectionType,
    });
  }
  
  /** @override */
  getData(options) {
    return {
      ...super.getData(options),
      viewModel: this.viewModel,
    }
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.viewModel.activateListeners(html);
  }
}
