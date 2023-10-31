import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * Represents a text input. The user can enter an arbitrary text, but only in a single line. 
 * 
 * @extends InputViewModel
 * 
 * @property {String} placeholder A localized placeholder text to display while the textfield is empty. 
 */
export default class InputTextFieldViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_TEXTFIELD; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputTextField', `{{> "${InputTextFieldViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * 
   * @param {String | undefined} args.placeholder Optional. A placeholder text to display while the textfield is empty. 
   */
  constructor(args = {}) {
    super(args);

    this._placeholder = args.placeholder ?? "";
  }
}
