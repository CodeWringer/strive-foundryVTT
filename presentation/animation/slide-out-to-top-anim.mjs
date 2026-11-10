import { ValidationUtil } from "../../common/util/validation-utility.mjs";
import BaseAnim from "./base-anim.mjs";

export class SlideOutToTopAnim extends BaseAnim {
  /** @override */
  get cssClass() { return "slide-anim"; }

  /**
   * @param {Object} args
   * @param {JQuery | HTMLElement} args.elm
   * @param {Function | undefined} args.onComplete Invoked upon animation completion, 
   * but only if it isn't canceled. 
   * @param {Function | undefined} args.onCancel Invoked upon animation cancellation. 
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
    $(this._elm).addClass("exit-to-top");
    $(this._elm).removeClass("hidden");
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /** @override @inheritdoc */
  _complete() {
    $(this.elm).addClass("hidden");
    super._complete();
  }
}
