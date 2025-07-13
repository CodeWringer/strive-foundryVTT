import ViewModel from "../../view-model/view-model.mjs";

/**
 * @extends ViewModel
 */
export default class DynamicLabelViewModel extends ViewModel {
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPONENT_DYNAMIC_LABEL; }

  /**
   * Returns the current label text. 
   * 
   * @type {String | undefined}
   */
  get localizedLabel() { return this._localizedLabel; }
  /**
   * Updates the text of the label element. 
   * @param {String | undefined} value
   */
  set localizedLabel(value) {
    this._localizedLabel = value;
    $(this.element).text(value);
  }

  /**
   * @param {Object} args The arguments object. 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * 
   * If no value is provided, a shortened UUID will be generated for it. 
   * 
   * This string may not contain any special characters! Alphanumeric symbols, as well as hyphen ('-') and 
   * underscore ('_') are permitted, but no dots, brackets, braces, slashes, equal sign, and so on. Failing to comply to this 
   * naming restriction may result in DOM elements not being properly detected by the `activateListeners` method. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document.
   * * Default `false`. 
   * @param {String | undefined} args.contextTemplate Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging.
   * @param {Map<String, Object>} args.viewStateSource The data source for view state objects. 
   * * Default `game.strive.viewStates`. 
   * @param {Object | undefined} args.document An associated data document. 
   * @param {Boolean | undefined} args.showFancyFont If `true`, will render any text, where 
   * appropriate, with the "fancy" font. 
   * * Default is the globally configured setting. 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.toolTipStyle A style override to attach to the tool tip's DOM element. 
   * E. g. `text-align: center`
   * @param {TooltipPlacementConstraint | undefined} args.toolTipConstraint Sets a constraint that determines 
   * where the tool tip will be placed, around the element. 
   * * default `TOOLTIP_PLACEMENTS.TOP` with offset `0`. 
   * 
   * @param {String | undefined} args.localizedLabel
   */
  constructor(args = {}) {
    super(args);

    this._localizedLabel = args.localizedLabel;
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);
  }
}
