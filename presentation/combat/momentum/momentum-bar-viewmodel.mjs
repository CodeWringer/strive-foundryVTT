import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ReadOnlyValueViewModel from "../../component/read-only-value/read-only-value.mjs";
import { StringUtil } from "../../../business/util/string-utility.mjs";

// TODO: Persist Momentum
// TODO: clip middle image based on current value
export default class MomentumBarViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.MOMENTUM_BAR; }

  /**
   * @type {Number}
   * @private
   */
  _value = 0;
  get value() { return this._value; }
  set value(newValue) {
    this._value = Math.max(this.min, Math.min(this.max, newValue));

    const handleElement = this.element.find(`#${this.vmRange.id}`);
    handleElement.attr("style", `left: ${this.handlePosition};`);
  }

  /**
   * If `true`, then the user is currently dragging the handle to adjust the value. 
   * @type {Boolean}
   * @private
   */
  _isDragging = false;

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
    const absoluteMin = Math.abs(this.min);
    const valueShiftedByMin = this._value + absoluteMin;
    const maxShiftedByMin = this.max + absoluteMin;
    const percentage = valueShiftedByMin / maxShiftedByMin * 100;
    return `calc(${percentage}% - 9px)`;
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
    this.localizedToolTip = game.i18n.localize("system.combat.momentum.momentum"),

      ValidationUtil.validateOrThrow(args, ["document"]);
    this.document = args.document;

    this.vmRange = new ViewModel({
      id: "vmRange",
      parent: this,
    });
    this.vmMin = new ReadOnlyValueViewModel({
      id: "vmMin",
      parent: this,
      value: this.min,
      localizedToolTip: StringUtil.format2(game.i18n.localize("system.combat.momentum.min"), {
        min: this.min,
      }),
    });
    this.vmCurrent = new InputNumberSpinnerViewModel({
      id: "vmCurrent",
      parent: this,
      value: this._value,
      min: this.min,
      max: this.max,
      onChange: (_, newValue) => {
        this.value = newValue;
      },
    });
    this.vmMax = new ReadOnlyValueViewModel({
      id: "vmMax",
      parent: this,
      value: this.max,
      localizedToolTip: StringUtil.format2(game.i18n.localize("system.combat.momentum.max"), {
        max: this.max,
      }),
    });
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.element.on("mouseleave", (e) => {
      this._isDragging = false;
      this.element.off("mousemove.momentum");
    });
    this.element.on("mouseup", (e) => {
      this._isDragging = false;
      this.element.off("mousemove.momentum");
    });

    const handleElement = this.element.find(`#${this.vmRange.id}`);
    handleElement.on("mousedown", (e) => {
      this._isDragging = true;
      this.element.on("mousemove.momentum", (e) => {
        if (!this._isDragging) return;

        const parentX = this.element.offset().left;
        const percentageFactor = (e.pageX - parentX) / this.element.width();
        const absoluteMin = Math.abs(this.min);
        const maxShiftedByMin = this.max + absoluteMin;
        const newValue = (maxShiftedByMin * percentageFactor) - absoluteMin;
        this.vmCurrent.value = Math.round(newValue);
      });
    });
  }
}
