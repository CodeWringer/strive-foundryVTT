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

  constructor(args = {}) {
    super(args);
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);
    
    this.element.click(this._onClick.bind(this, html, isOwner, this.isEditable));
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
