import { TEMPLATES } from "../../template/templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";

/**
 * Represents a label. It simply displays the text it is given. Localization must be done by the user. 
 * 
 * @extends ViewModel
 * 
 * @property {String} text Optional. The localization key of the text to display. 
 * @property {String} for Optional. The id of the associated input component. 
 * @property {String} cssClass Optional. A custom css class. 
 */
export default class LabelViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_LABEL; }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {String | undefined} args.text Optional. The localization key of the text to display. 
   * @param {String | undefined} args.for Optional. The id of the associated input component. 
   * @param {String | undefined} args.cssClass Optional. A custom css class. 
   */
  constructor(args = {}) {
    super(args);

    this.text = args.text ?? "";
    this.for = args.for ?? "";
    this.cssClass = args.cssClass;
  }
}

Handlebars.registerPartial('inputLabel', `{{> "${LabelViewModel.TEMPLATE}"}}`);
