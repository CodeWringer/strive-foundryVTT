import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * Constant that defines the css class to look for when identifying image input elements. 
 * 
 * @type {String}
 * @constant
 */
export const SELECTOR_INPUT_IMAGE = "component-input-image";

/**
 * Represents a changeable image. 
 * 
 * A click on the image element prompts for the selection of a new image. 
 * 
 * @extends InputViewModel
 */
export default class InputImageViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_IMAGE; }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {Object} args.propertyOwner An object on which to to look up the value. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a template that embeds this input component. 
   * @param {String | undefined} args.localizableTitle Optional. The localizable title (tooltip). 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyPath", "propertyOwner"]);
  }

  /**
   * @override
   * @see "module\components\input-viewmodel.mjs"
   * @throws {Error} NullPointerException Thrown if the element could not be found on the DOM. 
   */
  activateListeners(html, isOwner, isEditable) {
    if (isEditable !== true) return;

    this._element = html.find(`.${SELECTOR_INPUT_IMAGE}#${this.id}`);

    if (this._element === undefined || this._element === null || this._element.length === 0) {
      const errorMessage = `NullPointerException: Failed to get input element with id '${this.id}'`;
      if (this._contextTemplate !== undefined) {
        throw new Error(`[${this._contextTemplate}] ${errorMessage}`);
      } else {
        throw new Error(errorMessage);
      }
    }

    this._element.click(this._onClick.bind(this, html, isOwner, this.isEditable));
  }
  
  /**
   * @param event 
   * @private
   * @async
   * @see https://foundryvtt.com/api/global.html#FilePickerOptions
   */
  async _onClick(html, isOwner, isEditable, event) {
    event.preventDefault();

    const thiz = this;

    const fp = new FilePicker({
      type: "image",
      current: this.value ?? "",
      callback: path => {
        thiz.value = path;
      },
    });
    return fp.browse();
  }
}

Handlebars.registerPartial('inputImage', `{{> "${InputImageViewModel.TEMPLATE}"}}`);
