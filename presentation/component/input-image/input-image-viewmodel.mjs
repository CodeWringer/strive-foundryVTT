import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

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
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputImage', `{{> "${InputImageViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {Object} args.propertyOwner An object on which to to look up the value. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a template that embeds this input component. 
   * @param {String | undefined} args.localizedTooltip Localized tooltip. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyPath", "propertyOwner"]);
  }

  /**
   * @override
   * 
   * @throws {Error} NullPointerException Thrown if the element could not be found on the DOM. 
   */
  async activateListeners(html) {
    await super.activateListeners(html);
    
    this.element.click(this._onClick.bind(this, html, this.isOwner, this.isEditable));
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
