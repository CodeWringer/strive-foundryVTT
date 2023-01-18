import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import { DYNAMIC_INPUT_TYPES } from "./dynamic-input-types.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import InputDropDownViewModel from "../../component/input-dropdown/input-dropdown-viewmodel.mjs";
import InputImageViewModel from "../../component/input-image/input-image-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputRadioButtonGroupViewModel from "../../component/input-radio-button-group/input-radio-button-group-viewmodel.mjs";
import InputRichTextViewModel from "../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import InputTextareaViewModel from "../../component/input-textarea/input-textarea-viewmodel.mjs";
import InputTextFieldViewModel from "../../component/input-textfield/input-textfield-viewmodel.mjs";
import { isBlankOrUndefined } from "../../../business/util/validation-utility.mjs";

/**
 * @property {Array<DynamicInputDefinition>} inputDefinitions
 * @property {Array<DynamicInputDialogControl>} controls
 * 
 * @extends ViewModel
 */
export default class DynamicInputDialogViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.DIALOG_DYNAMIC_INPUT; }

  /**
   * @param {Object} args 
   * @param {Array<DynamicInputDefinition>} args.inputDefinitions
   */
  constructor(args = {}) {
    super(args);

    validateOrThrow(args, ["inputDefinitions"]);

    this.inputDefinitions = args.inputDefinitions;

    this.controls = [];
    for (const definition of this.inputDefinitions) {
      this[definition.name] = definition.defaultValue;

      let viewModel;
      if (definition.type === DYNAMIC_INPUT_TYPES.DROP_DOWN) {
        viewModel = new InputDropDownViewModel({
          id: definition.name,
          parent: this,
          propertyPath: definition.name,
          propertyOwner: this,
          isEditable: true,
          options: definition.specificArgs.options,
          adapter: definition.specificArgs.adapter,
        });
      } else if (definition.type === DYNAMIC_INPUT_TYPES.IMAGE) {
        viewModel = new InputImageViewModel({
          id: definition.name,
          parent: this,
          propertyPath: definition.name,
          propertyOwner: this,
          isEditable: true,
        });
      } else if (definition.type === DYNAMIC_INPUT_TYPES.NUMBER_SPINNER) {
        viewModel = new InputNumberSpinnerViewModel({
          id: definition.name,
          parent: this,
          propertyPath: definition.name,
          propertyOwner: this,
          isEditable: true,
          min: definition.specificArgs.min,
          max: definition.specificArgs.max,
          step: definition.specificArgs.step,
        });
      } else if (definition.type === DYNAMIC_INPUT_TYPES.RADIO_BUTTONS) {
        viewModel = new InputRadioButtonGroupViewModel({
          id: definition.name,
          parent: this,
          propertyPath: definition.name,
          propertyOwner: this,
          isEditable: true,
          options: definition.specificArgs.options,
        });
      } else if (definition.type === DYNAMIC_INPUT_TYPES.RICH_TEXT) {
        viewModel = new InputRichTextViewModel({
          id: definition.name,
          parent: this,
          propertyPath: definition.name,
          propertyOwner: this,
          isEditable: true,
        });
      } else if (definition.type === DYNAMIC_INPUT_TYPES.TEXTAREA) {
        viewModel = new InputTextareaViewModel({
          id: definition.name,
          parent: this,
          propertyPath: definition.name,
          propertyOwner: this,
          isEditable: true,
          spellcheck: definition.specificArgs.spellcheck,
          placeholder: definition.specificArgs.placeholder,
        });
      } else if (definition.type === DYNAMIC_INPUT_TYPES.TEXTFIELD) {
        viewModel = new InputTextFieldViewModel({
          id: definition.name,
          parent: this,
          propertyPath: definition.name,
          propertyOwner: this,
          isEditable: true,
          placeholder: definition.specificArgs.placeholder,
        });
      } else {
        throw new Error(`Invalid input type: "${definition.type}"`);
      }

      this.controls.push(new DynamicInputDialogControl({
        definition: definition,
        viewModel: viewModel,
      }));
    }
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
      if (control.definition.required !== true) continue;

      const value = control.viewModel.value;
      let controlValidated = true;
      if (control.definition.type === DYNAMIC_INPUT_TYPES.DROP_DOWN) {
        // TODO #196
      } else if (control.definition.type === DYNAMIC_INPUT_TYPES.IMAGE) {
        if (isBlankOrUndefined(value) === true) {
          controlValidated = false;
        }
      } else if (control.definition.type === DYNAMIC_INPUT_TYPES.NUMBER_SPINNER) {
        if (isBlankOrUndefined(value) === true) {
          controlValidated = false;
        }
      } else if (control.definition.type === DYNAMIC_INPUT_TYPES.RADIO_BUTTONS) {
        // TODO #196
      } else if (control.definition.type === DYNAMIC_INPUT_TYPES.RICH_TEXT) {
        if (isBlankOrUndefined(value) === true) {
          controlValidated = false;
        }
      } else if (control.definition.type === DYNAMIC_INPUT_TYPES.TEXTAREA) {
        if (isBlankOrUndefined(value) === true) {
          controlValidated = false;
        }
      } else if (control.definition.type === DYNAMIC_INPUT_TYPES.TEXTFIELD) {
        if (isBlankOrUndefined(value) === true) {
          controlValidated = false;
        }
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
}

/**
 * Represents a dynamic input definition and its corresponding view model. 
 * 
 * @property {DynamicInputDefinition} definition
 * @property {ViewModel} viewModel
 */
class DynamicInputDialogControl {
  /**
   * @param {Object} args 
   * @param {DynamicInputDefinition} args.definition
   * @param {ViewModel} args.viewModel
   */
  constructor(args = {}) {
    validateOrThrow(args, ["definition", "viewModel"]);

    this.definition = args.definition;
    this.viewModel = args.viewModel;
  }
}