import { validateOrThrow } from "../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../templatePreloader.mjs";
import ViewModel from "../view-model/view-model.mjs";

/**
 * Represents a layout relative sizing. 
 * 
 * @property {String} width Layout width, in grid 
 * compliant unit. E. g. `"1fr"`
 * * default `"1fr"` 
 * @property {String} height Layout height, in grid 
 * compliant unit. E. g. `"1fr"`
 * * default `"1fr"` 
 */
export class LayoutSize {
  /**
   * @param {Object} args 
   * @param {String} args.width Layout width, in grid 
   * compliant unit. E. g. `"1fr"`
   * * default `"1fr"` 
   * @param {String} args.height Layout height, in grid 
   * compliant unit. E. g. `"1fr"`
   * * default `"1fr"` 
   */
  constructor(args = {}) {
    this.width = args.width ?? "1fr";
    this.height = args.height ?? "1fr";
  }
}

/**
 * Represents the base class for any layout-includable 
 * type. 
 * 
 * @property {String} template Template path. 
 * @property {Function} viewModelFunc Must return a new view 
 * model instance. Receives the following arguments: 
 * * `parent: {ViewModel}`
 * @property {LayoutSize} layoutSize 
 * @property {String | undefined} cssClass A css class.  
 */
export class Layoutable {
  /**
   * @param {Object} args 
   * @param {String} args.template Template path. 
   * @param {Function} args.viewModelFunc Must return a new view 
   * model instance. Receives the following arguments: 
   * * `parent: {ViewModel}`
   * @param {LayoutSize | undefined} args.layoutSize 
   * @param {String | undefined} args.cssClass A css class.  
   */
  constructor(args = {}) {
    validateOrThrow(args, ["template", "viewModelFunc"]);

    this.template = args.template;
    this.viewModelFunc = args.viewModelFunc;
    this.layoutSize = args.layoutSize ?? new LayoutSize();
    this.cssClass = args.cssClass;
  }

  /**
   * Returns a new view model instance that can present this instance. 
   * 
   * @param {ViewModel} parent The parent view model. 
   * 
   * @returns {ViewModel} A new view model instance. 
   * 
   * @virtual
   */
  getViewModel(parent) {
    return this.viewModelFunc(parent);
  }
}

/**
 * Orders its `content` in a row. 
 * 
 * @property {LayoutSize} layoutSize 
 * @property {String | undefined} cssClass A css class.  
 * 
 * @property {Array<Layoutable>} content 
 */
export class RowLayout extends Layoutable {
  /**
   * @param {Object} args 
   * @param {LayoutSize | undefined} args.layoutSize 
   * @param {String | undefined} args.cssClass A css class to 
   * associate with the row.  
   * 
   * @param {Array<Layoutable> | undefined} args.content 
   */
  constructor(args = {}) {
    super({
      ...args,
      template: TEMPLATES.LAYOUT,
      viewModelFunc: (parent) => {
        return new LayoutViewModel({
          parent: parent,
          style: `display: grid; grid-template-rows: ${this._getRowSizes(args.content)}`,
        });
      },
    });

    this.content = args.content ?? [];
  }

  /**
   * Returns the styling rules for the grid row sizes. 
   * 
   * @param {Array<Layoutable>} content 
   * 
   * @returns {String} The styling, e. g. `"1fr 32px 1fr"`
   * 
   * @private
   */
  _getRowSizes(content) {
    return content
    .map(it => it.layoutSize.height)
    .join(" ");
  }
}

/**
 * Orders its `content` in a column. 
 * 
 * @property {LayoutSize} layoutSize 
 * @property {String | undefined} cssClass A css class.  
 * 
 * @property {Array<Layoutable>} content 
 */
export class ColumnLayout extends Layoutable {
  /**
   * @param {Object} args 
   * @param {LayoutSize | undefined} args.layoutSize 
   * @param {String | undefined} args.cssClass A css class to 
   * associate with the column.  
   * 
   * @param {Array<Layoutable> | undefined} args.content 
   */
  constructor(args = {}) {
    super({
      ...args,
      template: TEMPLATES.LAYOUT,
      viewModelFunc: (parent) => {
        return new LayoutViewModel({
          parent: parent,
          style: `display: grid; grid-template-columns: ${this._getColumnSizes(args.content)}`,
        });
      },
    });

    this.content = args.content ?? [];
  }

  /**
   * Returns the styling rules for the grid column sizes. 
   * 
   * @param {Array<Layoutable>} content 
   * 
   * @returns {String} The styling, e. g. `"1fr 32px 1fr"`
   * 
   * @private
   */
  _getColumnSizes(content) {
    return content
      .map(it => it.layoutSize.width)
      .join(" ");
  }
}

export class LayoutViewModel extends ViewModel {
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
   * * Default `game.ambersteel.viewStates`. 
   * 
   * @param {String} args.style This layout's specific styling. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["style"]);

    this.style = args.style;
  }
}
