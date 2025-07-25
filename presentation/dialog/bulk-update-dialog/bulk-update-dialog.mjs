import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import FoundryWrapper from "../../../common/foundry-wrapper.mjs";
import ModalDialog from "../modal-dialog/modal-dialog.mjs";
import BulkUpdateDialogViewModel from "./bulk-update-dialog-viewmodel.mjs";

/**
 * Encapsulates the bulk updater dialog. 
 * 
 * @extends ModalDialog 
 */
export default class BulkUpdateDialog extends ModalDialog {
  /** @override */
  static get defaultOptions() {
    return new FoundryWrapper().mergeObject(super.defaultOptions, {
      width: 500,
      height: 330,
    });
  }

  /** @override */
  get template() { return game.strive.const.TEMPLATES.DIALOG_BULK_UPDATER; }

  /** @override */
  get id() { return "bulk-update-dialog"; }

  /**
   * @param {Object} options 
   * @param {Boolean | undefined} options.easyDismissal If true, allows for easier dialog dismissal, 
   * by clicking anywhere on the backdrop element. Default `true`. 
   * @param {Function | undefined} options.closeCallback A function to invoke upon the closing 
   * of the dialog. Receives this dialog instance as its only argument. 
   * @param {String | undefined} options.localizedTitle Localized string for the dialog title. 
   */
  constructor(options = {}) {
    super({
      ...options,
      easyDismissal: false,
      localizedTitle: "Bulk pack document updater",
    });
  }

  /** @override */
  getData(options) {
    if (ValidationUtil.isDefined(this._viewModel) === true) {
      this._viewModel.dispose();
      this._viewModel = undefined;
    }

    this._viewModel = new BulkUpdateDialogViewModel({
      ui: this,
    });

    return {
      ...super.getData(options),
      viewModel: this._viewModel,
    }
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    await this._viewModel.activateListeners(html);
  }

  /**
   * @override
   * @see https://foundryvtt.com/api/FormApplication.html#close
   */
  async close() {
    if (ValidationUtil.isDefined(this._viewModel)) {
      // Clean up the view model. 
      this._viewModel.dispose();
      this._viewModel = undefined;
    }

    return super.close();
  }
}
