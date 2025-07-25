import { ValidationUtil } from '../../../business/util/validation-utility.mjs';
import ConfirmableModalDialog from '../confirmable-modal-dialog/confirmable-modal-dialog.mjs';
import DialogButtonDefinition from '../dialog-button-definition.mjs';
import DynamicInputDefinition from './dynamic-input-definition.mjs';
import DynamicInputDialogViewModel from './dynamic-input-dialog-viewmodel.mjs';

/**
 * Represents a dialog with dynamically defined input controls, allowing for more 
 * detailled queries. 
 * 
 * @extends ConfirmableModalDialog
 * 
 * @property {Array<DynamicInputDefinition>} inputDefinitions The list of input fields 
 * to include. 
 * @property {String | undefined} focused Name of the input field to pre-focus when 
 * the dialog is opened. 
 * 
 * @example
 * ```JS
 * const myAssets = [
 *   { id: 0, name: "Bob" },
 * ];
 * const assetChoices = [
 *   new ChoiceOption({
 *     value: myAssets[0].id,
 *     localizedValue: myAssets[0].name,
 *   }),
 * ];
 * 
 * const dialog = await new DynamicInputDialog({
 *   localizedTitle: StringUtil.format(
 *     game.i18n.localize("system.general.input.queryFor"), 
 *     game.i18n.localize("system.character.asset.slot.label"), 
 *   ),
 *   inputDefinitions: [
 *     new DynamicInputDefinition({
 *       name: "inputChoices",
 *       localizedLabel: game.i18n.localize("system.general.name.label"),
 *       template: InputDropDownViewModel.TEMPLATE,
 *       viewModelFactory: (id, parent, overrides) => new InputTextFieldViewModel({
 *         id: id,
 *         parent: parent,
 *         options: assetChoices,
 *         value: assetChoices[0],
 *         ...overrides,
 *       }),
 *     }),
 *   ],
 * }).renderAndAwait(true); 
 * 
 * if (dialog.confirmed !== true) return; 
 * 
 * const asset = myAssets.find(it => it.id === dialog["inputChoices"].value);
 * ```
 */
export default class DynamicInputDialog extends ConfirmableModalDialog {
  /** @override */
  get template() { return game.strive.const.TEMPLATES.DIALOG_DYNAMIC_INPUT; }

  /** @override */
  get id() { return this._id ?? "dynamic-input-dialog"; }
  set id(value) { this._id = value; }

  /** @override */
  static get defaultOptions() {
    const r = super.defaultOptions;
    r.classes = ["width-max-lg"].concat(r.classes);
    return r;
  }

  /** @override */
  get buttons() { return [
    new DialogButtonDefinition({
      id: ConfirmableModalDialog.CONFIRM_ID,
      clickCallback: (html, dialog) => {
        if (!ValidationUtil.isDefined(dialog._viewModel)) return; // Hack - can not be caught with debugger. Race condition?

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
      localizedLabel: game.i18n.localize("system.general.confirm"),
    }),
    new DialogButtonDefinition({
      id: ConfirmableModalDialog.CANCEL_ID,
      clickCallback: (html, dialog) => {
        dialog.close();
      },
      cssClass: "secondary-button",
      iconCssClass: "fas fa-times",
      localizedLabel: game.i18n.localize("system.general.cancel"),
    }),
  ]; }

  /**
   * @type {DynamicInputDialogViewModel}
   * @private
   */
  _viewModel;

  /**
   * @param {Object} options 
   * @param {String | undefined} options.id An ID by which to uniquely identify instances of this 
   * dialog. 
   * 
   * **Required** *in case* any of the inputs' values are to be remembered! 
   * @param {Boolean | undefined} options.easyDismissal If true, allows for easier dialog dismissal, 
   * by clicking anywhere on the backdrop element. Default `true`. 
   * @param {Function | undefined} options.closeCallback A function to invoke upon the closing 
   * of the dialog. Receives this dialog instance as its only argument. 
   * @param {String | undefined} options.localizedTitle Localized string for the dialog title. 
   * @param {Array<DynamicInputDefinition>} options.inputDefinitions
   * @param {String | undefined} options.focused Name of the input field to pre-focus when 
   * the dialog is opened. 
   * 
   * @param {Function | undefined} options.onReady Invoked once all view model instances have 
   * been created. Receives arguments:
   * * `dialogViewModel: DynamicInputDialogViewModel`
   */
  constructor(options = {}) {
    super(options);
    ValidationUtil.validateOrThrow(options, ["inputDefinitions"]);

    this._id = options.id;
    this.inputDefinitions = options.inputDefinitions;
    this.focused = options.focused;
    this.onReady = options.onReady;
  }
  
  /** @override */
  getData(options) {
    if (ValidationUtil.isDefined(this._viewModel) === true) {
      this._viewModel.dispose();
      this._viewModel = undefined;
    }

    this._viewModel = new DynamicInputDialogViewModel({
      id: this.id,
      inputDefinitions: this.inputDefinitions,
      isEditable: true,
      isSendable: true,
      ui: this,
      focused: this.focused,
      onReady: this.onReady,
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
    if (this._viewModel !== undefined && this._viewModel !== null) {
      // Transfer inputted values to dialog, for direct reference by the caller. 
      for (const definition of this.inputDefinitions) {
        this[definition.name] = this._viewModel[definition.name];
      }

      // Clean up the view model. 
      this._viewModel.dispose();
      this._viewModel = undefined;
    }
    
    return super.close();
  }
}
