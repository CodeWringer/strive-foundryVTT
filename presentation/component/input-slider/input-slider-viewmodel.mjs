import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";
import ViewModel from "../../view-model/view-model.mjs";

/**
 * Allows selection of a value from a given range via a knob on a slider. 
 * 
 * @extends ViewModel
 * 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {Function} onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {Number}`
   * * `newValue: {Number}`
 * 
 * @property {Number} min 
 * @property {Number} max 
 * @property {Number} step 
 * @property {Number} value 
 */
export default class InputSliderViewModel extends InputViewModel {
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPONENT_INPUT_SLIDER; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputSlider', `{{> "${InputSliderViewModel.TEMPLATE}"}}`);
  }

  /**
   * @type {Number}
   */
  get min() { return this._min; }
  /**
   * @param {Number} value
   */
  set min(value) {
    this._min = value;
    $(this.element).attr("min", value);
  }

  /**
   * @type {Number}
   */
  get max() { return this._max; }
  /**
   * @param {Number} value
   */
  set max(value) {
    this._max = value;
    $(this.element).attr("max", value);
  }

  /**
   * @type {Number}
   */
  get step() { return this._step; }
  /**
   * @param {Number} value
   */
  set step(value) {
    this._step = value;
    $(this.element).attr("step", value);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.iconHtml Raw HTML to render as 
   * an associated icon. E. g. `'<i class="fas fa-scroll"></i>'`
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {Number}`
   * * `newValue: {Number}`
   * 
   * @param {Number} args.min 
   * @param {Number} args.max 
   * @param {Number | undefined} args.step 
   * * default `1`
   * @param {Number | undefined} args.value 
   * * default `args.min`
   */
  constructor(args = {}) {
    super(args);

    ValidationUtil.validateOrThrow(args, ["min", "max"]);

    this._min = args.min;
    this._max = args.max;
    this._step = args.step ?? 1;
    this._value = args.value ?? args.min;
  }
}
