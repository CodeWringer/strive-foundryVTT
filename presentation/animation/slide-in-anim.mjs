import { ValidationUtil } from "../../common/util/validation-utility.mjs";
import BaseAnim from "./base-anim.mjs";

export class SlideInAnim extends BaseAnim {
  /** @override */
  get cssClass() { return "slide-anim"; }

  /**
   * @param {Object} args
   * @param {JQuery | HTMLElement} args.elm
   */
  constructor(args = {}) {
    super({
      elements: [
        args.elm,
      ],
    });
    ValidationUtil.validateOrThrow(args, ["elm"]);
    this.elm = args.elm;
  }

  /** @override @inheritdoc */
  _setup(elements) {
    super._setup(elements);

    this._elm = this._elements[0];
  }

  /** @override @inheritdoc */
  async _execute() {
    $(this._elm).addClass("enter");
    $(this._elm).removeClass("hidden");

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /** @override @inheritdoc */
  _complete() {
    super._complete();
    $(this.elm).removeClass("hidden");
  }
}
