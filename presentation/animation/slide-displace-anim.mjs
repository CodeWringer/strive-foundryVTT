import { ValidationUtil } from "../../common/util/validation-utility.mjs";
import BaseAnim from "./base-anim.mjs";

export class SlideDisplaceAnim extends BaseAnim {
  /**
   * @param {Object} args
   * @param {JQuery | HTMLElement} args.elmA The element that will displace the other.
   * @param {JQuery | HTMLElement} args.elmB The element to be displaced.
   */
  constructor(args = {}) {
    super({
      elements: [
        args.elmA,
        args.elmB,
      ],
    });
    ValidationUtil.validateOrThrow(args, ["elmA", "elmB"]);
    this.elmA = args.elmA;
    this.elmB = args.elmB;
  }

  /** @override @inheritdoc */
  _setup(elements) {
    super._setup(elements);

    this._elmA = this._elements[0];
    this._elmB = this._elements[1];
  }

  /** @override @inheritdoc */
  async _execute() {
    $(this._elmA).addClass("enter");
    $(this._elmA).removeClass("hidden");

    $(this._elmB).removeClass("hidden");
    $(this._elmB).addClass("exit");

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /** @override @inheritdoc */
  _complete() {
    super._complete();
    $(this.elmA).removeClass("hidden");
    $(this.elmB).addClass("hidden");
  }
}
