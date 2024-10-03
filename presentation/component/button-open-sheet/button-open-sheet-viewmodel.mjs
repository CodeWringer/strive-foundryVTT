import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * A button that allows opening a specific document's sheet. 
 * 
 * @extends ButtonViewModel
 * 
 * @method onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
 * * `event: Event`
 * * `data: undefined`
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
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, will be interactible. 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.localizedLabel A localized text to 
   * display as a button label. 
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
   * * `event: Event`
   * * `data: undefined`
   * 
   * @param {TransientDocument} args.target The target object to affect. 
   */
  constructor(args = {}) {
    super({
      ...args,
      iconHtml: '<i class="fas fa-external-link-alt"></i>',
    });
    ValidationUtil.validateOrThrow(args, ["target"]);

    this.target = args.target;
    this.localizedToolTip = args.localizedToolTip ?? game.i18n.localize("system.general.openSheet");
  }

  /**
   * @param {Event} event
   * 
   * @throws {Error} NullPointerException - Thrown, if 'target' is undefined. 
   * @throws {Error} NullPointerException - Thrown, if trying to delete by property path and 'target.deleteByPath' is undefined. 
   * 
   * @async
   * @protected
   * @override
   */
  async _onClick(event) {
    if (this.isEditable !== true) return;

    const toShow = await new DocumentFetcher().find({
      id: this.target.id ?? this.target,
      name: this.target.name ?? undefined,
      documentType: this.target.documentName ?? undefined,
      contentType: this.target.type ?? undefined,
    });

    if (toShow === undefined) {
      game.strive.logger.logWarn(`NullPointerException: Failed to find document '${this.target}' to open sheet`);
      return;
    }
    toShow.sheet.render(true);
  }
}
