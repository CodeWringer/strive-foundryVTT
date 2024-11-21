import { UuidUtil } from "../../../business/util/uuid-utility.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";

export const TOOLTIP_PLACEMENTS = {
  TOP: "TOP",
  RIGHT: "RIGHT",
  BOTTOM: "BOTTOM",
  LEFT: "LEFT",
}

export class TooltipPlacementConstraint {
  /**
   * @param {Object} args 
   * @param {TOOLTIP_PLACEMENTS | undefined} args.placement 
   * * default `TOOLTIP_PLACEMENTS.TOP`
   * @param {Number | undefined} args.offset 
   * * default `0`
   */
  constructor(args = {}) {
    this.placement = args.placement ?? TOOLTIP_PLACEMENTS.TOP;
    this.offset = args.offset ?? 0;
  }
}

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
   * @param {Object} args 
   * @param {JQuery | undefined} args.anchorElement 
   * @param {String | undefined} args.content 
   * @param {Boolean | undefined} args.enableArrow 
   * * default `false`
   * @param {TooltipPlacementConstraint | undefined} args.constraint 
   * @param {String | undefined} args.maxWidth 
   * * default `"100rem"`
   * @param {Boolean | undefined} args.showOnHover 
   * * default `true`
   * @param {Function | undefined} args.onShown Callback that is invoked whenever the 
   * tooltip is shown. 
   * @param {Function | undefined} args.onHidden Callback that is invoked whenever the 
   * tooltip is hidden. 
   */
  constructor(args = {}) {
    this._id = UuidUtil.createUUID();

    this.anchorElement = args.anchorElement;
    this.content = args.content;
    this.enableArrow = args.enableArrow ?? false;
    this.constraint = args.constraint ?? new TooltipPlacementConstraint();
    this.maxWidth = args.maxWidth ?? "100rem";
    this.showOnHover = args.showOnHover ?? true;

    this.onShown = args.onShown ?? (() => {});
    this.onHidden = args.onHidden ?? (() => {});
  }

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

  deactivateListeners() {
    if (ValidationUtil.isDefined(this.anchorElement)) {
      this.anchorElement.off(`mouseenter.${Tooltip.EVENT_NAMESPACE}.${this._id}`);
      this.anchorElement.off(`mouseleave.${Tooltip.EVENT_NAMESPACE}.${this._id}`);
    }
    this.hide();
  }

  show() {
    if (!ValidationUtil.isDefined(this.anchorElement)) return;

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

    if (this.constraint.placement === TOOLTIP_PLACEMENTS.TOP) {
      x = parentPos.left + (parentSize.width / 2) - (size.width / 2);
      y = parentPos.top - size.height - this.constraint.offset;
    } else if (this.constraint.placement === TOOLTIP_PLACEMENTS.BOTTOM) {
      x = parentPos.left + (parentSize.width / 2) - (size.width / 2);
      y = parentPos.top + size.height +  this.constraint.offset;
    } else if (this.constraint.placement === TOOLTIP_PLACEMENTS.RIGHT) {
      x = parentPos.left + parentSize.width + this.constraint.offset;
      y = parentPos.top + (parentSize / 2) - (size.height / 2);
    } else if (this.constraint.placement === TOOLTIP_PLACEMENTS.LEFT) {
      x = parentPos.left - size.width - this.constraint.offset;
      y = parentPos.top + (parentSize / 2) - (size.height / 2);
    }

    this._element.attr("style", `left: ${x}px; top: ${y}px; max-width: ${this.maxWidth};`);
    this.onShown();
  }
  
  hide() {
    this._ensureElementRemoved();
    this.onHidden();
  }

  /**
   * @private
   */
  _ensureElement() {
    const elementInDom = $(`body > .${Tooltip.CSS_CLASS}#${this._id}`);

    if (!ValidationUtil.isDefined(this._element)) {
      const elementString = `<div id="${this._id}" class="${Tooltip.CSS_CLASS}" style="max-width: ${this.maxWidth};">${this.content}</div>`;
      this._element = $($("body").add(elementString)[1]);
    }

    if (elementInDom.length < 1) {
      $("body").append(this._element);
    }
  }

  /**
   * @private
   */
  _ensureElementRemoved() {
    if (ValidationUtil.isDefined(this._element)) {
      this._element.remove();
    } else {
      const elementInDom = $(`body > .${Tooltip.CSS_CLASS}#${this._id}`);
  
      if (elementInDom.length > 0) {
        elementInDom.remove();
      }
    }
  }
}