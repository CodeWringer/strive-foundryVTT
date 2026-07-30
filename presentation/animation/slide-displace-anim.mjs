import { ValidationUtil } from "../../common/util/validation-utility.mjs";
import BaseAnim from "./base-anim.mjs";

export class SlideDisplaceAnim extends BaseAnim {
  /** @override */
  get cssClass() { return "displace-anim"; }

  /**
   * @param {Object} args
   * @param {JQuery | HTMLElement} args.displacingElement The element that will displace the other.
   * @param {JQuery | HTMLElement} args.displacedElement The element to be displaced.
   * @param {Boolean | undefined} args.keepCurrentDisplacedVisibility If `true`, will force 
   * the `displacedElement` visible for the animation, but rather keeps its current visibility. 
   * * default `false`
   */
  constructor(args = {}) {
    super({
      elements: [
        args.displacingElement,
        args.displacedElement,
      ],
    });
    ValidationUtil.validateOrThrow(args, ["displacingElement", "displacedElement"]);
    this.displacingElement = args.displacingElement;
    this.displacedElement = args.displacedElement;
    this.keepCurrentDisplacedVisibility = args.keepCurrentDisplacedVisibility ?? false;
  }

  /** @override @inheritdoc */
  _setup(elements) {
    super._setup(elements);

    this._displacingElement = this._elements[0];
    this._displacedElement = this._elements[1];
  }

  /** @override @inheritdoc */
  async _execute() {
    $(this._displacingElement).addClass("enter");
    $(this._displacingElement).removeClass("hidden");

    if (!this.keepCurrentDisplacedVisibility) {
      $(this._displacedElement).removeClass("hidden");
    }
    $(this._displacedElement).addClass("exit");

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /** @override @inheritdoc */
  _complete() {
    super._complete();
    $(this.displacingElement).removeClass("hidden");
    $(this.displacedElement).addClass("hidden");
  }
}
