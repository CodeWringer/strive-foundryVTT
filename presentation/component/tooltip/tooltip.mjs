import { UuidUtil } from "../../../business/util/uuid-utility.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";

/**
 * Defines valid relative tooltip placements. 
 * 
 * These are relative to the anchor element. 
 * 
 * @constant
 */
export const TOOLTIP_PLACEMENTS = {
  TOP: "TOP",
  RIGHT: "RIGHT",
  BOTTOM: "BOTTOM",
  LEFT: "LEFT",
}

/**
 * Defines tooltip positioning constraints. 
 * 
 * These are relative to the anchor element. 
 * 
 * @see Tooltip
 */
export class TooltipPlacementConstraint {
  /**
   * @param {Object} args 
   * @param {TOOLTIP_PLACEMENTS | undefined} args.placement 
   * * default `TOOLTIP_PLACEMENTS.TOP`
   * @param {Number | undefined} args.offset Sets an additional distance, in pixels, 
   * from the anchor element. 
   * * default `0`
   */
  constructor(args = {}) {
    this.placement = args.placement ?? TOOLTIP_PLACEMENTS.TOP;
    this.offset = args.offset ?? 0;
  }
}

/**
 * Displays informative content when users hover over a specified element. 
 * 
 * @property {JQuery | undefined} anchorElement The element to which to anchor the tooltip. 
 * This is also the element that controls the tooltips visibility on hover. 
 * @property {String | undefined} content The content to display in the tooltip. 
 * This can be any valid HTML content, or just a simple text. 
 * @property {Boolean | undefined} enableArrow If `true`, will add a little arrow to the 
 * tooltip, for visual distinction. 
 * @property {TooltipPlacementConstraint | undefined} constraint Defines positioning 
 * constraints. 
 * @property {String | undefined} maxWidth Sets the maximum width the tooltip can assume. 
 * This must be a numeric value with css unit. E. g. `"10rem"`. 
 * @property {Boolean | undefined} showOnHover If `true`, will automatically show the 
 * tooltip when the `anchorElement` is hovered over. If `false`, then the tooltip must 
 * be manually shown and hidden. 
 * @property {Function | undefined} onShown Callback that is invoked whenever the 
 * @property {Function | undefined} onHidden Callback that is invoked whenever the 
 * 
 * @property {JQuery | undefined} _element The DOM element. 
 * * private
 */
export default class Tooltip {
  /**
   * The event name space with which to ensure the correct event listeners can 
   * be removed. 
   * 
   * @static
   * @type {String}
   * 
   * @private
   */
  static EVENT_NAMESPACE = "Tooltip";

  /**
   * @static
   * @type {String}
   * 
   * @private
   */
  static CSS_CLASS = "custom-tooltip";
  
  /**
   * The size of the "arrow" decoration, in pixels. 
   * 
   * Must be kept synchronous with the value in the `_tooltip.scss` file! 
   * 
   * @static
   * @type {Number}
   * 
   * @private
   */
  static ARROW_SIZE = 8;

  /**
   * Removes ALL tool tip elements from the DOM. 
   * 
   * @static
   * @method
   */
  static removeAllToolTipElements() {
    $(`body > .${Tooltip.CSS_CLASS}`).remove();
  }

  /**
   * @returns {Boolean}
   */
  get visible() { return this._visible; }
  set visible(value) {
    this._visible = value;
    if (value) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id A unique identifier. 
   * @param {JQuery | undefined} args.anchorElement The element to which to anchor the tooltip. 
   * This is also the element that controls the tooltips visibility on hover. 
   * @param {String | undefined} args.content The content to display in the tooltip. 
   * This can be any valid HTML content, or just a simple text. 
   * @param {Boolean | undefined} args.enableArrow If `true`, will add a little arrow to the 
   * tooltip, for visual distinction. 
   * * default `false`
   * @param {TooltipPlacementConstraint | undefined} args.constraint Defines positioning 
   * constraints. 
   * @param {String | undefined} args.maxWidth Sets the maximum width the tooltip can assume. 
   * This must be a numeric value with css unit. E. g. `"10rem"`. 
   * * default `"50rem"`
   * @param {Boolean | undefined} args.showOnHover If `true`, will automatically show the 
   * tooltip when the `anchorElement` is hovered over. If `false`, then the tooltip must 
   * be manually shown and hidden. 
   * * default `true`
   * @param {String | undefined} args.style A style override to attach to the tool tip's DOM element. 
   * E. g. `text-align: center`
   * @param {Function | undefined} args.onShown Callback that is invoked whenever the 
   * tooltip is shown. 
   * @param {Function | undefined} args.onHidden Callback that is invoked whenever the 
   * tooltip is hidden. 
   */
  constructor(args = {}) {
    this._id = UuidUtil.sanitizeId(args.id ?? UuidUtil.createUUID());

    this.anchorElement = args.anchorElement;
    this.content = args.content;
    this.enableArrow = args.enableArrow ?? false;
    this.constraint = args.constraint ?? new TooltipPlacementConstraint();
    this.maxWidth = args.maxWidth ?? "50rem";
    this.showOnHover = args.showOnHover ?? true;
    this.style = args.style ?? "";

    this._visible = false;

    this.onShown = args.onShown ?? (() => {});
    this.onHidden = args.onHidden ?? (() => {});
  }

  /**
   * Registers event handlers on the `anchorElement`. 
   * 
   * @param {JQuery} anchorElement The element to which the tooltip will be anchored. 
   */
  activateListeners(anchorElement) {
    this.anchorElement = anchorElement;

    if (this.showOnHover === true && ValidationUtil.isDefined(this.anchorElement)) {
      this.anchorElement.on(`mouseenter.${Tooltip.EVENT_NAMESPACE}.${this._id}`, (event) => {
        this.show();
      });
      this.anchorElement.on(`mouseleave.${Tooltip.EVENT_NAMESPACE}.${this._id}`, () => {
        this.hide();
      });
    }
  }

  /**
   * Unregisters event handlers from the `anchorElement`. 
   */
  deactivateListeners() {
    if (ValidationUtil.isDefined(this.anchorElement)) {
      this.anchorElement.off(`mouseenter.${Tooltip.EVENT_NAMESPACE}.${this._id}`);
      this.anchorElement.off(`mouseleave.${Tooltip.EVENT_NAMESPACE}.${this._id}`);
    }
    this.hide();
  }

  /**
   * Makes the tooltip visible, by adding it to the DOM and positioning it accordingly. 
   */
  show() {
    if (!ValidationUtil.isDefined(this.anchorElement)) return;
    this._visible = true;

    // Ensure lingering instances are cleared and a clean, new one exists. 
    this._ensureElementRemoved();
    this._ensureElement();
    // Ensure the content is up to date. 
    this._element.html(this.content);

    const parentPos = this.anchorElement.offset();
    const parentSize = { 
      width: this.anchorElement.outerWidth(), 
      height: this.anchorElement.outerHeight() 
    };
    
    const size = { 
      width: this._element.outerWidth(), 
      height: this._element.outerHeight() 
    };

    let x = 0;
    let y = 0;
    const offset = this.enableArrow ? (this.constraint.offset + Tooltip.ARROW_SIZE) : this.constraint.offset;

    if (this.constraint.placement === TOOLTIP_PLACEMENTS.TOP) {
      x = parentPos.left + (parentSize.width / 2) - (size.width / 2);
      y = parentPos.top - size.height - offset;
    } else if (this.constraint.placement === TOOLTIP_PLACEMENTS.BOTTOM) {
      x = parentPos.left + (parentSize.width / 2) - (size.width / 2);
      y = parentPos.top + parentSize.height +  offset;
    } else if (this.constraint.placement === TOOLTIP_PLACEMENTS.RIGHT) {
      x = parentPos.left + parentSize.width + offset;
      y = parentPos.top + (parentSize.height / 2) - (size.height / 2);
    } else if (this.constraint.placement === TOOLTIP_PLACEMENTS.LEFT) {
      x = parentPos.left - size.width - offset;
      y = parentPos.top + (parentSize.height / 2) - (size.height / 2);
    }

    this._element.attr("style", `left: ${x}px; top: ${y}px; max-width: ${this.maxWidth};`);
    this.onShown();
  }
  
  /**
   * Hides the tooltip, by removing it from the DOM. 
   */
  hide() {
    this._visible = false;
    this._ensureElementRemoved();
    this.onHidden();
  }

  /**
   * Attempts to return the element as it is on the DOM. 
   * 
   * @returns {JQuery | undefined}
   * 
   * @private
   */
  _getElementFromDom() {
    const elementInDom = $(`body > .${Tooltip.CSS_CLASS}#${this._id}`);

    if (elementInDom.length > 0) {
      return elementInDom;
    } else {
      return undefined;
    }
  }

  /**
   * Ensures the element that represents the tooltip is defined and present in the DOM. 
   * 
   * @private
   */
  _ensureElement() {
    const elementInDom = this._getElementFromDom();
    if (ValidationUtil.isDefined(elementInDom)) {
      this._element = elementInDom;
    } else {
      let cssClass = Tooltip.CSS_CLASS;
  
      if (this.enableArrow) {
        if (this.constraint.placement === TOOLTIP_PLACEMENTS.BOTTOM) {
          cssClass = `${cssClass} with-arrow-t`;
        } else if (this.constraint.placement === TOOLTIP_PLACEMENTS.TOP) {
          cssClass = `${cssClass} with-arrow-b`;
        } else if (this.constraint.placement === TOOLTIP_PLACEMENTS.LEFT) {
          cssClass = `${cssClass} with-arrow-r`;
        } else if (this.constraint.placement === TOOLTIP_PLACEMENTS.RIGHT) {
          cssClass = `${cssClass} with-arrow-l`;
        }
      }
  
      const elementCreationString = `<div id="${this._id}" class="${cssClass}" style="max-width: ${this.maxWidth};${this.style}">${this.content}</div>`;
      this._element = $($("body").add(elementCreationString)[1]);
  
      $("body").append(this._element);
    }
  }

  /**
   * Removes the tooltip element from the DOM and clears its reference. 
   * 
   * @private
   */
  _ensureElementRemoved() {
    if (ValidationUtil.isDefined(this._element)) {
      this._element.remove();
    }

    const elementInDom = this._getElementFromDom();
    if (ValidationUtil.isDefined(elementInDom)) {
      elementInDom.remove();
    }

    this._element = undefined;
  }
}