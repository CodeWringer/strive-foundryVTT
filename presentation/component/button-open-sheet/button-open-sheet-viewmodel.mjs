import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * A button that allows opening a specific document's sheet. 
 * 
 * @extends ButtonViewModel
 */
export default class ButtonOpenSheetViewModel extends ButtonViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON_OPEN_SHEET; }
  
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonOpenSheet', `{{> "${ButtonOpenSheetViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {TransientDocument} args.target The target object to affect. 
   * @param {Function | String | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
   * @param {String | undefined} args.localizableTitle Optional. The localizable title (tooltip). 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["target"]);

    this.localizableTitle = args.localizableTitle ?? "ambersteel.general.openSheet";
  }

  /**
   * @override
   * @see {ButtonViewModel.onClick}
   * @async
   * @throws {Error} NullPointerException - Thrown, if 'target' is undefined. 
   * @throws {Error} NullPointerException - Thrown, if trying to delete by property path and 'target.deleteByPath' is undefined. 
   */
  async onClick(html, isOwner, isEditable) {
    if (isEditable !== true) return;

    const toShow = await new DocumentFetcher().find({
      id: this.target.id ?? this.target,
      name: this.target.name ?? undefined,
      documentType: this.target.documentName ?? undefined,
      contentType: this.target.type ?? undefined,
    });

    if (toShow === undefined) {
      game.ambersteel.logger.logWarn(`NullPointerException: Failed to find document '${this.target}' to open sheet`);
      return;
    }
    toShow.sheet.render(true);
  }
}
