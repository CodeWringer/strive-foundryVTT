import InputViewModel from "../../view-model/input-view-model.mjs"

/**
 * Represents a read-only value, with optional decorations. 
 * 
 * @extends InputViewModel
 * 
 * @property {String} id Unique ID of this view model instance. 
 * @property {Boolean} isEditable If `true`, input(s) will 
 * be in edit mode. If `false`, will be in read-only mode.
 * @property {JQuery | HTMLElement} element The DOM element that is 
 * associated with this view model. 
 * * Read-only
 * 
 * @property {String | undefined} localizedToolTip A localized text to 
 * display as a tool tip. 
 * @property {String | undefined} value The current value. 
 * * Upon change, invokes the `onChange` callback. 
 * @property {String} localizedValue The current value, localized. 
 * * Read-only
 */
export default class ReadOnlyValueViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPONENT_READ_ONLY_VALUE; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('readOnlyValue', `{{> "${ReadOnlyValueViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.value The current value. 
   * 
   * @param {Boolean | undefined} args.admonish If `true`, will add warning decorators. 
   * * default `false`
   */
  constructor(args = {}) {
    super(args);

    this.admonish = args.admonish ?? false;
  }
}
