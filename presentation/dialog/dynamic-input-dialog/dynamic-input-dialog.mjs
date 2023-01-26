import { validateOrThrow } from '../../../business/util/validation-utility.mjs';
import { isDefined } from '../../../business/util/validation-utility.mjs';
import { TEMPLATES } from '../../templatePreloader.mjs';
import ConfirmableModalDialog from '../confirmable-modal-dialog/confirmable-modal-dialog.mjs';
import DialogButtonDefinition from '../dialog-button-definition.mjs';
import DynamicInputDialogViewModel from './dynamic-input-dialog-viewmodel.mjs';

/**
 * Represents a dialog with dynamically defined input controls, allowing for more 
 * detailled queries. 
 * 
 * @extends ConfirmableModalDialog
 * 
 * @property {Array<DynamicInputDefinition>} inputDefinitions
 */
export default class DynamicInputDialog extends ConfirmableModalDialog {
  /** @override */
  get template() { return TEMPLATES.DIALOG_DYNAMIC_INPUT; }

  /** @override */
  get id() { return "dynamic-input-dialog"; }

  /** @override */
  get buttons() { return [
    new DialogButtonDefinition({
      id: "confirm",
      clickCallback: (html, dialog) => {
        const validationResult = dialog._viewModel.validate();
        if (validationResult.allValid === true) {
          dialog.confirmed = true;
  
          if (dialog.closeOnConfirm === true) {
            dialog.close();
          }
        } else {
          html.find("#required-input-warning").removeClass("hidden");
          
          const requiredListElement = html.find("#required-input-list");
          requiredListElement.empty();
          for (const definitionResult of validationResult.validations) {
            if (definitionResult.valid === true) continue;

            const name = definitionResult.definition.localizedLabel === undefined ? definitionResult.definition.name : definitionResult.definition.localizedLabel;
            requiredListElement.append(`<li>${name}</li>`)
          }
        }
      },
      cssClass: "primary-button",
      iconCssClass: "fas fa-check",
      localizedLabel: game.i18n.localize("ambersteel.general.confirm"),
    }),
    new DialogButtonDefinition({
      id: "cancel",
      clickCallback: (html, dialog) => {
        dialog.close();
      },
      cssClass: "secondary-button",
      iconCssClass: "fas fa-times",
      localizedLabel: game.i18n.localize("ambersteel.general.cancel"),
    }),
  ]; }

  /**
   * @type {DynamicInputDialogViewModel}
   * @private
   */
  _viewModel;

  /**
   * @param {Object} options 
   * @param {Boolean | undefined} options.easyDismissal If true, allows for easier dialog dismissal, 
   * by clicking anywhere on the backdrop element. Default `true`. 
   * @param {Function | undefined} options.closeCallback A function to invoke upon the closing 
   * of the dialog. Receives this dialog instance as its only argument. 
   * @param {String | undefined} options.localizedTitle Localized string for the dialog title. 
   * @param {Array<DynamicInputDefinition>} options.inputDefinitions
   */
  constructor(options = {}) {
    super(options);
    validateOrThrow(options, ["inputDefinitions"]);

    this.inputDefinitions = options.inputDefinitions;
  }
  
  /** @override */
  getData(options) {
    if (isDefined(this._viewModel) !== true) {
      this._viewModel = new DynamicInputDialogViewModel({
        inputDefinitions: this.inputDefinitions,
      });
    }

    return {
      ...super.getData(options),
      viewModel: this._viewModel,
    }
  }

  
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    this._viewModel.activateListeners(html, true, true);
  }
  
  /**
   * @override
   * @see https://foundryvtt.com/api/FormApplication.html#close
   */
  async close() {
    if (this._viewModel !== undefined && this._viewModel !== null) {
      // Transfer inputted values to dialog, for direct reference by the caller. 
      for (const definition of this.inputDefinitions) {
        this[definition.name] = this._viewModel[definition.name];
      }

      // Clean up the view model. 
      this._viewModel.writeViewState();
      this._viewModel.dispose();
      this._viewModel = undefined;
    }
    
    return super.close();
  }
}