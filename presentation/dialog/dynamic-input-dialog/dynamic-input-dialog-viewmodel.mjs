import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { DYNAMIC_INPUT_TYPES } from "./dynamic-input-types.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import InputDropDownViewModel from "../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputImageViewModel from "../../component/input-image/input-image-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputRadioButtonGroupViewModel from "../../component/input-choice/input-radio-button-group/input-radio-button-group-viewmodel.mjs";
import InputRichTextViewModel from "../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import InputTextareaViewModel from "../../component/input-textarea/input-textarea-viewmodel.mjs";
import InputTextFieldViewModel from "../../component/input-textfield/input-textfield-viewmodel.mjs";
import { isBlankOrUndefined } from "../../../business/util/validation-utility.mjs";
import { isDefined } from "../../../business/util/validation-utility.mjs";
import SimpleListViewModel from "../../component/simple-list/simple-list-viewmodel.mjs";
import InputToggleViewModel from "../../component/input-toggle/input-toggle-viewmodel.mjs";
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
   */
  constructor(args = {}) {
    super(args);

    validateOrThrow(args, ["inputDefinitions", "ui"]);

    this.inputDefinitions = args.inputDefinitions;
    this.ui = args.ui;

    this.controls = [];
    for (const definition of this.inputDefinitions) {
      // Create the underlying data field on the view model. 
      // The value of this field _may_ be undefined! 
      this[definition.name] = definition.defaultValue;

      let viewModel;
      if (definition.type === DYNAMIC_INPUT_TYPES.DROP_DOWN) {
        viewModel = new InputDropDownViewModel({
          id: definition.name,
          parent: this,
          value: definition.defaultValue,
          onChange: (_, newValue) => {
            this[definition.name] = newValue;
          },
          options: definition.specificArgs.options,
        });
      } else if (definition.type === DYNAMIC_INPUT_TYPES.IMAGE) {
        viewModel = new InputImageViewModel({
          id: definition.name,
          parent: this,
          value: definition.defaultValue,
          onChange: (_, newValue) => {
            this[definition.name] = newValue;
          },
        });
      } else if (definition.type === DYNAMIC_INPUT_TYPES.NUMBER_SPINNER) {
        viewModel = new InputNumberSpinnerViewModel({
          id: definition.name,
          parent: this,
          value: definition.defaultValue,
          onChange: (_, newValue) => {
            this[definition.name] = newValue;
          },
          min: definition.specificArgs.min,
          max: definition.specificArgs.max,
          step: definition.specificArgs.step,
        });
      } else if (definition.type === DYNAMIC_INPUT_TYPES.RADIO_BUTTONS) {
        viewModel = new InputRadioButtonGroupViewModel({
          id: definition.name,
          parent: this,
          value: definition.defaultValue,
          onChange: (_, newValue) => {
            this[definition.name] = newValue;
          },
          options: definition.specificArgs.options,
        });
      } else if (definition.type === DYNAMIC_INPUT_TYPES.RICH_TEXT) {
        viewModel = new InputRichTextViewModel({
          id: definition.name,
          parent: this,
          value: definition.defaultValue,
          onChange: (_, newValue) => {
            this[definition.name] = newValue;
          },
        });
      } else if (definition.type === DYNAMIC_INPUT_TYPES.TEXTAREA) {
        viewModel = new InputTextareaViewModel({
          id: definition.name,
          parent: this,
          value: definition.defaultValue,
          onChange: (_, newValue) => {
            this[definition.name] = newValue;
          },
          spellcheck: definition.specificArgs.spellcheck,
          placeholder: definition.specificArgs.placeholder,
        });
      } else if (definition.type === DYNAMIC_INPUT_TYPES.TEXTFIELD) {
        viewModel = new InputTextFieldViewModel({
          id: definition.name,
          parent: this,
          value: definition.defaultValue,
          onChange: (_, newValue) => {
            this[definition.name] = newValue;
          },
          placeholder: definition.specificArgs.placeholder,
        });
      } else if (definition.type === DYNAMIC_INPUT_TYPES.LABEL) {
        viewModel = new ViewModel({
          id: definition.name,
          parent: this,
        });
      } else if (definition.type === DYNAMIC_INPUT_TYPES.SIMPLE_LIST) {
        const values = this[definition.name];

        const viewModels = [];
        for (let index = 0; index < values.length; index++) {
          const vm = definition.specificArgs.contentItemViewModelFactory(index, values);
          viewModels.push(vm);
        }

        viewModel = new SimpleListViewModel({
          id: definition.name,
          parent: this,
          contentItemViewModels: viewModels,
          contentItemTemplate: definition.specificArgs.contentItemTemplate,
          onAddClick: () => {
            values.push(definition.specificArgs.newItemDefaultValue);
            this.ui.render(true);
          },
          onRemoveClick: (_, index) => {
            values.splice(index, 1);
            this.ui.render(true);
          },
          isItemAddable: definition.specificArgs.isItemAddable,
          isItemRemovable: definition.specificArgs.isItemRemovable,
          localizedAddLabel: definition.specificArgs.localizedAddLabel,
        });
        viewModel.value = values;
      } else if (definition.type === DYNAMIC_INPUT_TYPES.TOGGLE) {
        viewModel = new InputToggleViewModel({
          id: definition.name,
          parent: this,
          value: definition.defaultValue,
          onChange: (_, newValue) => {
            this[definition.name] = newValue;
          },
        });
      } else {
        throw new Error(`Invalid input type: "${definition.type}"`);
      }

      // Ensure the default value is properly set. 
      // This has to happen _after_ control instantiation, because determining the default 
      // value is the control's business. 
      if (!isDefined(definition.defaultValue)) {
        this[definition.name] = viewModel.value;
      }

      viewModel.showFancyFont = definition.showFancyFont ?? false

      let validationFunc = definition.validationFunc;
      if (validationFunc === undefined && definition.required === true) {
        // Fallback function, for a required field only. 
        validationFunc = (value) => {
          return isBlankOrUndefined(value) === false;
        };
      }

      this.controls.push(new DynamicInputDialogControl({
        definition: definition,
        viewModel: viewModel,
        validationFunc: validationFunc,
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
      const value = control.viewModel.value;
      let controlValidated = true;
      if (isDefined(control.validationFunc) === true && control.validationFunc(value) === false) {
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
   * @param {Function | undefined} args.validationFunc A validation function. 
   * * Receives the current value of the control as its input and must return a boolean 
   * value. `true` signalizes a successful validation without errors, while `false` 
   * indicates validation failed. 
   */
  constructor(args = {}) {
    validateOrThrow(args, ["definition", "viewModel"]);

    this.definition = args.definition;
    this.viewModel = args.viewModel;
    this.validationFunc = args.validationFunc;
  }
}