import FoundryWrapper from "../../../common/foundry-wrapper.mjs";
import DamageDesignerDialogViewModel from "./damage-designer-dialog-viewmodel.mjs";

/**
 * A dialog to discover damage numbers. 
 * 
 * @abstract
 * @extends Application
 * @see https://foundryvtt.com/api/classes/client.Application.html
 */
export default class DamageDesignerDialog extends Application {
  /** @override */
  static get defaultOptions() {
    return new FoundryWrapper().mergeObject(super.defaultOptions, {
      popOut: true,
      resizable: true,
      minimizable: true,
      width: 1200,
      height: 800,
    });
  }

  /** @override */
  get template() { return game.strive.const.TEMPLATES.DIALOG_DAMAGE_DESIGNER; }

  /** @override */
  get title() { return "Damage Designer"; }

  /** @override */
  get id() { return "damage-designer-dialog"; }

  /**
   * A function to invoke upon the closing of the dialog. 
   * 
   * Receives this dialog instance as its only argument. 
   * 
   * @type {Function | undefined}
   */
  closeCallback = undefined;

  /**
   * The DOM of the dialog. 
   * 
   * Only available **after** `activateListeners` is called! 
   * 
   * @type {JQuery}
   * @protected
   */
  _html = undefined;

  /**
   * @type {ViewModel}
   * @private
   */
  _viewModel = undefined;

  /**
   * @param {Object} options 
   */
  constructor(options = {}) {
    super(options);

    this._viewModel = new DamageDesignerDialogViewModel({
      ui: this,
    });
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this._html = html;

    this._viewModel.activateListeners(html);
  }

  /** @override */
  getData(options) {
    return {
      ...super.getData(options),
      viewModel: this._viewModel,
    }
  }
}
