import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import InputSliderViewModel from "../../component/input-slider/input-slider-viewmodel.mjs";
import ViewModel from "../../view-model/view-model.mjs";

export default class MomentumBarViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.MOMENTUM_BAR; }

  /**
   * @type {Number}
   * @private
   */
  _value = 0;
  
  /**
   * @type {Number}
   * @readonly
   */
  get min() { return -20; }
  /**
   * @type {Number}
   * @readonly
   */
  get max() { return 20; }

  /**
   * @type {String}
   * @readonly
   */
  get handlePosition() {
    return "calc(50% - 9px)";
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {Combat} args.document 
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    this.localizedToolTip = `${game.i18n.localize("system.combat.momentum.momentum")}: ${this._value}`;

    ValidationUtil.validateOrThrow(args, ["document"]);
    this.document = args.document;

    this.vmRange = new ViewModel({
      id: "vmRange",
      parent: this,
      value: this._value,
    });
  }
}
