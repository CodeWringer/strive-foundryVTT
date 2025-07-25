import ViewModel from "../../view-model/view-model.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import { KEYBOARD } from "../../keyboard/keyboard.mjs";
import { KEY_CODES } from "../../keyboard/key-codes.mjs";
import ConfirmableModalDialog from "../confirmable-modal-dialog/confirmable-modal-dialog.mjs";
import DynamicInputDefinition from "./dynamic-input-definition.mjs";
import FoundryWrapper from "../../../common/foundry-wrapper.mjs";

/**
 * @property {Array<DynamicInputDefinition>} inputDefinitions The list of input definitions of 
 * this dynamic dialog. 
 * 
 * @property {Array<DynamicInputDefinitionInstance>} inputInstances
 * * read-only
 * 
 * @extends ViewModel
 */
export default class DynamicInputDialogViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.DIALOG_DYNAMIC_INPUT; }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id An ID by which to uniquely identify this instance. 
   * 
   * **Required** *in case* any of the inputs' values are to be remembered! 
   * @param {Array<DynamicInputDefinition>} args.inputDefinitions
   * @param {Application} args.ui The dialog that owns this view model. 
   * @param {String | undefined} args.focused Name of the input field to pre-focus when 
   * the dialog is opened. 
   * 
   * @param {Function | undefined} args.onReady Invoked once all view model instances have 
   * been created. Receives arguments:
   * * `dialogViewModel: DynamicInputDialogViewModel`
   */
  constructor(args = {}) {
    super(args);

    ValidationUtil.validateOrThrow(args, ["inputDefinitions", "ui"]);

    this.inputDefinitions = args.inputDefinitions;
    this.ui = args.ui;
    this.focused = args.focused;
    this.onReady = args.onReady;

    if (ValidationUtil.isDefined(args.id)) {
      this.registerViewStateProperty("_definitionValues");
      this.readViewState();
      if (!ValidationUtil.isDefined(this._definitionValues)) {
        this._definitionValues = new Map();
      }
    }

    this.inputInstances = [];
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    // Determine how many view models require instantiation. 
    let expectedViewModelInstanceCount = 0;
    for (const definition of this.inputDefinitions) {
      if (ValidationUtil.isDefined(definition.viewModelFactory) && ValidationUtil.isNotBlankOrUndefined(definition.template)) {
        expectedViewModelInstanceCount++;
      }
    }

    let viewModelInstanceCount = 0;

    // Render input elements. 
    for await (const definition of this.inputDefinitions) {
      let viewModel;
      if (ValidationUtil.isDefined(definition.viewModelFactory) && ValidationUtil.isNotBlankOrUndefined(definition.template)) {
        const overrides = {};
        // Override value with remembered value, if possible. 
        if (definition.rememberValue) {
          const rememberedValue = this._definitionValues.get(definition.name);
          if (rememberedValue !== undefined) {
            overrides.value = rememberedValue;
          }
        }
        // Instantiate the view model. 
        viewModel = await definition.viewModelFactory(
          definition.name, 
          this,
          overrides,
        );

        // Render the view model and attach it to the DOM. 
        const renderedTemplate = await new FoundryWrapper().renderTemplate(definition.template, {
          viewModel: viewModel,
        });
        this.element.find(`#${definition.name}-placeholder`).remove();
        this.element.find(`#${definition.name}-slot`).append(renderedTemplate);

        // Pass through the view model's onChange, if possible, so that value changes can be properly propagated. 
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

        // Activate the view model's listeners. 
        const childElement = this.element.find(`#${viewModel.id}`);
        await viewModel.activateListeners(childElement);
      }

      this.inputInstances.push(new DynamicInputDefinitionInstance({
        ...definition,
        viewModel: viewModel,
      }));
      viewModelInstanceCount++;
    }

    // Pre-focus an element. 
    if (ValidationUtil.isDefined(this.focused)) {
      const controlToFocus = this.inputInstances.find(it => it.name === this.focused)
      $(controlToFocus.viewModel.element).focus();
    }

    KEYBOARD.onKeyDown(KEY_CODES.ENTER, this._handleConfirm.bind(this));
    KEYBOARD.onKeyDown(KEY_CODES.ESCAPE, this._handleCancel.bind(this));

    // Invoke onReady
    if (ValidationUtil.isDefined(this.onReady)) {
      if (viewModelInstanceCount >= expectedViewModelInstanceCount) {
        this.onReady(this);
      }
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

    for (const inputInstance of this.inputInstances) {
      if (!ValidationUtil.isDefined(inputInstance.viewModel)) continue;
      if (!ValidationUtil.isDefined(inputInstance.validationFunc) && inputInstance.required === true) {
        throw new Error("Required control must have a validation function");
      }

      const value = inputInstance.viewModel.value;
      let controlValidated = true;
      if (ValidationUtil.isDefined(inputInstance.validationFunc) === true 
        && inputInstance.validationFunc(value) === false) {
        controlValidated = false;
      }

      validations.push({
        definition: inputInstance,
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
    // Ensure input values are remembered. 
    if (ValidationUtil.isDefined(this._definitionValues)) {
      this.inputInstances.forEach(instance => {
        if (instance.rememberValue) {
          this._definitionValues.set(instance.name, instance.viewModel.value);
        }
      });
    }

    this.writeViewState();

    KEYBOARD.offKeyDown(KEY_CODES.ENTER, this._handleConfirm);
    KEYBOARD.offKeyDown(KEY_CODES.ESCAPE, this._handleCancel);

    super.dispose();
  }

  /**
   * Re-generates the view model of and re-renders the input identified by the given `name`. 
   * 
   * @param {String} name Name of the input to refresh. 
   * 
   * @async
   */
  async refreshInput(name) {
    const instance = this.inputInstances.find(it => it.name === name);

    if (!ValidationUtil.isDefined(instance)) {
      game.strive.logger.logWarn(`Failed to find instance by name '${name}'`);
      return;
    };

    $(instance.viewModel.element).remove();
    $(this.element).find(`#${instance.name}-slot`).append(`<div id="${instance.name}-placeholder" class="flex flex-center"><i class="fa-spinner fas font-size-lg spin"></i></div>`)

    // Re-create the view model instance. 
    instance.viewModel = await instance.viewModelFactory(instance.name, this);

    // Render the view model and attach it to the DOM. 
    const renderedTemplate = await new FoundryWrapper().renderTemplate(instance.template, {
      viewModel: instance.viewModel,
    });
    $(this.element).find(`#${instance.name}-placeholder`).remove();
    $(this.element).find(`#${instance.name}-slot`).append(renderedTemplate);

    // Pass through the view model's onChange, if possible, so that value changes can be properly propagated. 
    if (ValidationUtil.isDefined(instance.viewModel.onChange)) {
      instance.viewModel.onChange = async (oldValue, newValue) => {
        this[instance.name] = newValue;
        if (ValidationUtil.isDefined(instance.onChange)) {
          await instance.onChange(oldValue, newValue, this);
        }
      };
    }

    // Ensure the default value of the child view model is present on this view model for easy access. 
    this[instance.name] = instance.viewModel.value;

    // Activate the view model's listeners. 
    const childElement = this.element.find(`#${instance.viewModel.id}`);
    await instance.viewModel.activateListeners(childElement);
  }
  
  /**
   * Invokes the confirmation button when the user presses the ENTER key. 
   * 
   * @private
   */
  _handleConfirm() { 
    const button = this.ui.buttons.find(it => it.id === ConfirmableModalDialog.CONFIRM_ID);
    this.element.find(`#${button.id}`).focus();
    this.element.find(`#${button.id}`).click();
  }

  /**
   * Invokes the cancelation button when the user presses the ESCAPE key. 
   * 
   * @private
   */
  _handleCancel() { 
    const button = this.ui.buttons.find(it => it.id === ConfirmableModalDialog.CANCEL_ID);
    this.element.find(`#${button.id}`).focus();
    this.element.find(`#${button.id}`).click();
  }
}

/**
 * Represents an input control definition instance for a `DynamicInputDialog`. 
 * 
 * @property {String} name Internal name. The value of the input will be referencable 
 * by this name. 
 * @property {String | undefined} template String path to the template to render the control with. 
 * @property {Function | undefined} viewModelFactory Must return a `ViewModel` instance. Is `async` and receives the following arguments:
 * * `id: String`
 * * `parent: ViewModel`
 * @property {String | undefined} localizedLabel Localized companion label. 
 * * default `""`
 * @property {String | undefined} iconHtml E. g. `'<i class="fas fa-plus"></i>'`
 * @property {Boolean | undefined} required If true, the represented input must have a valid 
 * input, to allow dialog confirmation. 
 * * Default `false`. 
 * @property {Boolean | undefined} showFancyFont If true, will render labels using the 
 * fancy font. 
 * * Default `false`
 * @property {Function | undefined} validationFunc A validation function. 
 * * Receives the current value of the control as its input and must return a boolean 
 * value. `true` signalizes a successful validation without errors, while `false` 
 * indicates validation failed. 
 * 
 * @property {ViewModel | undefined} viewModel A generated view model instance. 
 * @property {Boolean} isRenderable Returns `true`, if the control has a defined view model factory and a template. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {Any}`
 * * `newValue: {Any}`
 * * `dialogViewModel: {DynamicInputDialogViewModel}`
 */
class DynamicInputDefinitionInstance extends DynamicInputDefinition {
  /**
   * @param {Object} args 
   * @param {String} args.name Internal name. The value of the input will be referencable 
   * by this name. 
   * @param {String | undefined} args.template String path to the template to render the control with. 
   * @param {Function | undefined} args.viewModelFactory Must return a `ViewModel` instance. Is `async` 
   * and receives the following arguments:
   * * `id: String`
   * * `parent: ViewModel`
   * @param {String | undefined} args.localizedLabel Localized companion label. 
   * * default `""`
   * @param {String | undefined} args.iconHtml E. g. `'<i class="fas fa-plus"></i>'`
   * @param {Boolean | undefined} args.required If true, the represented input must have a valid 
   * input, to allow dialog confirmation. 
   * * Default `false`. 
   * @param {Boolean | undefined} args.showFancyFont If true, will render labels using the 
   * fancy font. 
   * * Default `false`
   * @param {Function | undefined} args.validationFunc A validation function. **Must** return a boolean 
   * value. `true` signalizes a successful validation without errors, while `false` 
   * indicates validation failed. Receives arguments: 
   * * `currentValue: Any`
   * 
   * @param {ViewModel | undefined} args.viewModel A generated view model instance. 
   * 
   * @param {Function | undefined} onChange Callback that is invoked when the value changes. 
   * Receives the following arguments: 
   * * `oldValue: {Any}`
   * * `newValue: {Any}`
   * * `dialogViewModel: {DynamicInputDialogViewModel}`
   */
  constructor(args = {}) {
    super(args);

    this.viewModel = args.viewModel;
  }
}
