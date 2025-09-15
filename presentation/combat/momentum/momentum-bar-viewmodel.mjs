import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ReadOnlyValueViewModel from "../../component/read-only-value/read-only-value.mjs";
import { StringUtil } from "../../../business/util/string-utility.mjs";

// TODO: clip middle image based on current value
export default class MomentumBarViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.MOMENTUM_BAR; }

  /**
   * @type {Number}
   * @private
   */
  get value() { return this._value; }
  set value(newValue) {
    const oldValue = this._value;
    this._value = Math.max(this.min, Math.min(this.max, newValue));

    const handleElement = this.element.find(`#${this.vmSliderHandle.id}`);
    handleElement.attr("style", `left: ${this.handlePosition};`);

    if (this._isDragging === false) {
      this.onChange(oldValue, newValue);
    }
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
    const valueShiftedByMin = this.value + absoluteMin;
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
   * @param {Boolean | undefined} args.isEditable 
   * 
   * @param {Number | undefined} args.value 
   * @param {Function | undefined} args.onChange Arguments: 
   * * `oldValue: Number`
   * * `newValue: Number`
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    this.localizedToolTip = game.i18n.localize("system.combat.momentum.momentum"),

    this._value = args.value ?? 0;
    this.onChange = args.onChange ?? (() => {});

    this.vmSliderHandle = new ViewModel({
      id: "vmSliderHandle",
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
      value: this.value,
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

    const sliderElement = this.element.find(`#${this.id}-slider`);
    sliderElement.on("mouseleave", (e) => {
      const isDraggingInterrupted = this._isDragging;
      this._isDragging = false;
      sliderElement.off("mousemove.momentum");
      if (isDraggingInterrupted) {
        this._handleValueUpdate(e);
      }
    });
    sliderElement.on("mouseup", (e) => {
      const isDraggingEnded = this._isDragging;
      this._isDragging = false;
      sliderElement.off("mousemove.momentum");
      if (isDraggingEnded) {
        this._handleValueUpdate(e);
      }
    });

    const handleElement = sliderElement.find(`#${this.vmSliderHandle.id}`);
    handleElement.on("mousedown", (e) => {
      this._isDragging = true;
      sliderElement.on("mousemove.momentum", (e) => {
        if (!this._isDragging) return;
        this._handleValueUpdate(e);
      });
    });
  }
  
  /**
   * @param {*} e 
   * @private
   */
  _handleValueUpdate(e) {
    const sliderElement = this.element.find(`#${this.id}-slider`);
    const parentX = sliderElement.offset().left;
    const percentageFactor = (e.pageX - parentX) / sliderElement.width();
    const absoluteMin = Math.abs(this.min);
    const maxShiftedByMin = this.max + absoluteMin;
    const newValue = Math.round((maxShiftedByMin * percentageFactor) - absoluteMin);

    this.vmCurrent.value = newValue;
  }
}
