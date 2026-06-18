import { UuidUtil } from "../../../common/util/uuid-utility.mjs";
import { ValidationUtil } from "../../../common/util/validation-utility.mjs";

/**
 * Displays informative content when users hover over a specified element. 
 * 
 * @property {JQuery | undefined} anchorElement The element to which to anchor the tooltip. 
 * This is also the element that controls the tooltips visibility on hover. 
 * @property {String | undefined} content The content to display in the tooltip. 
 * This can be any valid HTML content, or just a simple text. 
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
   * @param {String | undefined} args.maxWidth Sets the maximum width the tooltip can assume. 
   * This must be a numeric value with css unit. E. g. `"50rem"`. 
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
    this.maxWidth = args.maxWidth ?? "50rem";
    this.showOnHover = args.showOnHover ?? true;
    this.style = args.style ?? "";

    this._visible = false;

    this.onShown = args.onShown ?? (() => { });
    this.onHidden = args.onHidden ?? (() => { });
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

    // Determine position and bounds. 

    // Get tool tip size. 
    const size = {
      width: this._element.outerWidth(),
      height: this._element.outerHeight(),
    };

    const parentRect = this._getParentRect();
    // By default, try to horizontally center above the anchor element. 
    const tooltipRect = new Rect({
      x: parentRect.left + (parentRect.width / 2) - (size.width / 2),
      y: parentRect.top - (size.height + Tooltip.ARROW_SIZE),
      width: size.width,
      height: size.height,
    });
    let arrowCssClass = "with-arrow-b";

    // Now ensure the tool tip stays bounded in the window.

    // Flags to keep track of which window borders the tool tip rectangle is out-of-bounds. 
    let oobTop = false;
    let oobBottom = false;
    let oobLeft = false;
    let oobRight = false;

    if (tooltipRect.top < 0) {
      oobTop = true;
    } else if (tooltipRect.bottom > window.screen.height) {
      oobBottom = true;
    }
    if (tooltipRect.left < 0) {
      oobLeft = true;
    } else if (tooltipRect.right > window.screen.width) {
      oobRight = true;
    }

    if (oobTop && oobLeft) {
      tooltipRect.top = parentRect.bottom + Tooltip.ARROW_SIZE;
      tooltipRect.left = parentRect.right + Tooltip.ARROW_SIZE;
      arrowCssClass = "with-arrow-tl";
    } else if (oobTop && oobRight) {
      tooltipRect.top = parentRect.bottom + Tooltip.ARROW_SIZE;
      tooltipRect.left = parentRect.left - (tooltipRect.width + Tooltip.ARROW_SIZE);
      arrowCssClass = "with-arrow-tr";
    } else if (oobBottom && oobLeft) {
      tooltipRect.top = parentRect.top - (tooltipRect.height + Tooltip.ARROW_SIZE);
      tooltipRect.left = parentRect.right + Tooltip.ARROW_SIZE;
      arrowCssClass = "with-arrow-bl";
    } else if (oobBottom && oobRight) {
      tooltipRect.top = parentRect.top - (tooltipRect.height + Tooltip.ARROW_SIZE);
      tooltipRect.left = parentRect.left - (tooltipRect.width + Tooltip.ARROW_SIZE);
      arrowCssClass = "with-arrow-br";
    } else if (oobTop) {
      tooltipRect.top = parentRect.bottom + Tooltip.ARROW_SIZE;
      arrowCssClass = "with-arrow-t";
    } else if (oobBottom) {
      tooltipRect.top = parentRect.top - (tooltipRect.height + Tooltip.ARROW_SIZE);
      arrowCssClass = "with-arrow-b";
    } else if (oobLeft) {
      tooltipRect.top = parentRect.top + (parentRect.height / 2) - (tooltipRect.height / 2);
      tooltipRect.left = parentRect.right + Tooltip.ARROW_SIZE;
      arrowCssClass = "with-arrow-l";
    } else if (oobRight) {
      tooltipRect.top = parentRect.top + (parentRect.height / 2) - (tooltipRect.height / 2);
      tooltipRect.left = parentRect.left - (tooltipRect.width + Tooltip.ARROW_SIZE);
      arrowCssClass = "with-arrow-r";
    }

    const cssClass = `${Tooltip.CSS_CLASS} ${arrowCssClass}`;
    this._element.attr("class", cssClass);
    this._element.attr("style", `left: ${tooltipRect.left}px; top: ${tooltipRect.top}px; max-width: ${this.maxWidth}; ${this.style}`);
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
      const elementCreationString = `<div class="${Tooltip.CSS_CLASS}" id="${this._id}" style="max-width:${this.maxWidth}">${this.content}</div>`;
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

  /**
   * Returns the anchor element's rectangle. 
   * 
   * @returns {Rect}
   * 
   * @private
   */
  _getParentRect() {
    const parentPos = this.anchorElement.offset();
    return new Rect({
      x: parentPos.left,
      y: parentPos.top,
      width: this.anchorElement.outerWidth(),
      height: this.anchorElement.outerHeight(),
    });
  }
}

/**
 * Represents a plain axis-aligned rectangle. 
 * 
 * @property {Number} top
 * @property {Number} left
 * @property {Number} right
 * * read-only
 * @property {Number} bottom
 * * read-only
 * @property {Number} width
 * @property {Number} height
 */
class Rect {
  get bottom() { return this.top + this.height; }

  get right() { return this.left + this.width; }

  /**
   * @param {Object} args 
   * @param {Number} args.x 
   * @param {Number} args.y 
   * @param {Number} args.width 
   * @param {Number} args.height 
   */
  constructor(args = {}) {
    this.left = args.x;
    this.top = args.y;
    this.width = args.width;
    this.height = args.height;
  }
}
