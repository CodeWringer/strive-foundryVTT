import ConfirmableModalDialog from "../confirmable-modal-dialog/confirmable-modal-dialog.mjs";
import RollableSelectionModalDialogViewModel from "./rollable-selection-modal-dialog-viewmodel.mjs";

export default class RollableSelectionModalDialog extends ConfirmableModalDialog {
  /** @override */
  get template() { return game.strive.const.TEMPLATES.DIALOG_ROLLABLE_SELECTION; }

  /** @override */
  get id() { return "rollable-selection-dialog"; }
  
  /**
   * @param {Object} args 
   * @param {RollTable} args.rollTable 
   */
  constructor(args = {}) {
    super(args);

    this.viewModel = new RollableSelectionModalDialogViewModel({
      rollTable: args.rollTable,
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
