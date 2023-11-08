import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * A button that allows opening a specific document's sheet. 
 * 
 * @extends ButtonViewModel
 * 
 * @method onClick Asynchronous callback that is invoked when the button is clicked. 
 * Receives the button's original click-handler as its sole argument. In most cases, it should be called 
 * and awaited before one's own click handling logic. But in case the original logic is unwanted, the method can be ignored.
 * * Returns nothing. 
 */
export default class ButtonOpenSheetViewModel extends ButtonViewModel {
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonOpenSheet', `{{> "${ButtonOpenSheetViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
   * @param {String | undefined} args.localizedTooltip Localized tooltip. 
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when the button is clicked. 
   * Receives the button's original click-handler as its sole argument. In most cases, it should be called 
   * and awaited before one's own click handling logic. But in case the original logic is unwanted, the method can be ignored.
   * * Returns nothing. 
   * 
   * @param {TransientDocument} args.target The target object to affect. 
   */
  constructor(args = {}) {
    super({
      ...args,
      iconHtml: '<i class="fas fa-external-link-alt"></i>',
    });
    validateOrThrow(args, ["target"]);

    this.target = args.target;
    this.localizedTooltip = args.localizedTooltip ?? game.i18n.localize("ambersteel.general.openSheet");
  }

  /**
   * @override
   * @see {ButtonViewModel._onClick}
   * @async
   * @throws {Error} NullPointerException - Thrown, if 'target' is undefined. 
   * @throws {Error} NullPointerException - Thrown, if trying to delete by property path and 'target.deleteByPath' is undefined. 
   */
  async _onClick() {
    if (this.isEditable !== true) return;

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
