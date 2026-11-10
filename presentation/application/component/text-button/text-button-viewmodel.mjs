import { HANDLEBARS_GLOBALS } from "../../../util/handlebars-globals.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

export default class TextButtonViewModel extends ButtonViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.textButton; }

  /** @override */
  get clazz() { return TextButtonViewModel; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    HANDLEBARS_GLOBALS.registerPartial('textButton', `{{> "${TextButtonViewModel.TEMPLATE}"}}`);
  }
}
