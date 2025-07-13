import ViewModel from "../../view-model/view-model.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import { KEYBOARD } from "../../keyboard/keyboard.mjs";
import { KEY_CODES } from "../../keyboard/key-codes.mjs";
import ConfirmableModalDialog from "../confirmable-modal-dialog/confirmable-modal-dialog.mjs";
import DynamicInputDefinition from "./dynamic-input-definition.mjs";

/**
 * @property {Array<DynamicInputDefinition>} inputDefinitions The list of input definitions of 
 * this dynamic dialog. 
 * @property {Array<DynamicInputDialogControl>} controls The list of input control instances. 
 * 
 * @extends ViewModel
 */
export default class DynamicInputDialogViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.DIALOG_DYNAMIC_INPUT; }

  /**
   * @param {Object} args 
   * @param {Array<DynamicInputDefinition>} args.inputDefinitions
   * @param {Application} args.ui The dialog that owns this view model. 
   * @param {String | undefined} args.focused Name of the input field to pre-focus when 
   * the dialog is opened. 
   */
  constructor(args = {}) {
    super(args);

    ValidationUtil.validateOrThrow(args, ["inputDefinitions", "ui"]);

    this.inputDefinitions = args.inputDefinitions;
    this.ui = args.ui;
    this.focused = args.focused;

    this.controls = [];
    for (const definition of this.inputDefinitions) {
      if (!ValidationUtil.isDefined(definition.validationFunc) && definition.required === true) {
        throw new Error("Required control must have a validation function");
      }

      let viewModel;
      if (ValidationUtil.isDefined(definition.viewModelFactory)) {
        viewModel = definition.viewModelFactory(
          definition.name, 
          this,
        );

        viewModel.isEditable = this.isEditable;

        if (ValidationUtil.isDefined(viewModel.onChange)) {
          viewModel.onChange = async (oldValue, newValue) => {
            this[definition.name] = newValue;
            if (ValidationUtil.isDefined(definition.onChange)) {
              await definition.onChange(oldValue, newValue, this);
            }
          };
        }

        // Ensure the default value of the child view model is present on this view model for easy access. 
        this[definition.name] = viewModel.value;
      }

      this.controls.push(new DynamicInputDialogControl({
        definition: definition,
        viewModel: viewModel,
        template: definition.template,
        validationFunc: definition.validationFunc ?? (() => true),
      }));
    }
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    if (ValidationUtil.isDefined(this.focused)) {
      const controlToFocus = this.controls.find(it => it.definition.name === this.focused)
      $(`#${controlToFocus.viewModel.id}`).focus();
    }

    KEYBOARD.onKeyDown(KEY_CODES.ENTER, this._handleConfirm.bind(this));
    KEYBOARD.onKeyDown(KEY_CODES.ESCAPE, this._handleCancel.bind(this));
  }

  /**
   * Returns an object which contains information on whether all 
   * the required fields are properly set. 
   * 
   * @returns {Object} An object with the properties: 
   * * `validations`: {Array<Object>} An array of control definitions and their 
   * validation results. 
   * * * `definition`: {DynamicInputDefinition} The control definition that was 
   * validated. 
   * * * `valid`: {Boolean} True, if the definition validated successfully. 
   * * `allValid`: {Boolean} True, if all definitions validated successfully. 
   */
  validate() {
    const validations = [];
    let allValid = true;

    for (const control of this.controls) {
      if (!ValidationUtil.isDefined(control.viewModel)) continue;

      const value = control.viewModel.value;
      let controlValidated = true;
      if (ValidationUtil.isDefined(control.validationFunc) === true 
        && control.validationFunc(value) === false) {
        controlValidated = false;
      }

      validations.push({
        definition: control.definition,
        valid: controlValidated
      });

      if (controlValidated !== true) {
        allValid = false;
      }
    }

    return {
      validations: validations,
      allValid: allValid
    };
  }

  /** @override */
  dispose() {
    KEYBOARD.offKeyDown(KEY_CODES.ENTER, this._handleConfirm);
    KEYBOARD.offKeyDown(KEY_CODES.ESCAPE, this._handleCancel);

    super.dispose();
  }
  
  /**
   * @private
   */
  _handleConfirm() { 
    const button = this.ui.buttons.find(it => it.id === ConfirmableModalDialog.CONFIRM_ID);
    this.element.find(`#${button.id}`).focus();
    this.element.find(`#${button.id}`).click();
  }

  /**
   * @private
   */
  _handleCancel() { 
    const button = this.ui.buttons.find(it => it.id === ConfirmableModalDialog.CANCEL_ID);
    this.element.find(`#${button.id}`).focus();
    this.element.find(`#${button.id}`).click();
  }
}

/**
 * Represents a dynamic input definition and its corresponding view model. 
 * 
 * @property {DynamicInputDefinition} definition
 * @property {ViewModel | undefined} viewModel
 * @property {String | undefined} template
 * @property {Function | undefined} validationFunc
 * @property {Boolean} isRenderable Returns `true`, if the control has a defined 
 * view model and template. 
 * * read-only
*/
class DynamicInputDialogControl {
  /**
   * Returns `true`, if the control has a defined view model and template. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get isRenderable() { return ValidationUtil.isDefined(this.viewModel) && ValidationUtil.isNotBlankOrUndefined(this.template); }

  /**
   * @param {Object} args 
   * @param {DynamicInputDefinition} args.definition
   * @param {ViewModel | undefined} args.viewModel
   * @param {String | undefined} args.template 
   * @param {Function | undefined} args.validationFunc A validation function. 
   * * Receives the current value of the control as its input and must return a boolean 
   * value. `true` signalizes a successful validation without errors, while `false` 
   * indicates validation failed. 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["definition"]);

    this.definition = args.definition;
    this.viewModel = args.viewModel;
    this.template = args.template;
    this.validationFunc = args.validationFunc;
  }
}
