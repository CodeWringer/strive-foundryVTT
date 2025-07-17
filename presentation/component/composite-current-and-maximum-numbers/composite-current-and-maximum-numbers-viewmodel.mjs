import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import DynamicInputDefinition from "../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../input-number-spinner/input-number-spinner-viewmodel.mjs";

/**
 * @extends ViewModel
 */
export default class CompositeCurrentAndMaximumNumbersViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPOSITE_CURRENT_AND_MAXIMUM_NUMBERS; }

  /**
   * Returns true, if the adjust button is to be rendered. 
   * 
   * @type {Boolean}
   */
  get renderAdjustButton() { return ValidationUtil.isDefined(this.onAdjusted); }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * 
   * @param {Number} args.currentValue 
   * @param {Function} args.onCurrentValueChange 
   * @param {Number | undefined} args.currentValueMin 
   * @param {Number | undefined} args.currentValueMax 
   * @param {String | undefined} args.currentValueToolTip Tooltip for the "current" value input. 
   * 
   * @param {String | undefined} args.currentValueIconClass CSS class for the "current" value icon. 
   * E. g. `"fas fa-edit"` or `"ico dark ico-quantity-solid"`
   * @param {String | undefined} args.currentValueIconToolTip Tooltip for the "current" value icon. 
   * 
   * @param {Number} args.maximumValue 
   * @param {Function} args.onMaximumValueChange 
   * @param {Number | undefined} args.maximumValueMin 
   * @param {Number | undefined} args.maximumValueMax 
   * @param {String | undefined} args.maximumValueToolTip Tooltip for the "maximum" value input. 
   * 
   * @param {String | undefined} args.maximumValueIconClass CSS class for the "maximum" value icon. 
   * E. g. `"fas fa-edit"` or `"ico dark ico-limit-solid"`
   * @param {String | undefined} args.maximumValueIconToolTip Tooltip for the "maximum" value icon. 
   * 
   * @param {String | undefined} args.adjustToolTip Tooltip for the "adjust" button. 
   * @param {String | undefined} args.adjustReminder An additional label's contnet to display 
   * in the dialog when the user clicks the "adjust" button. 
   * @param {Function | undefined} args.onAdjusted Callback that is invoked when the user 
   * entered a value via the "adjust" button dialog. Does *not* get invoked in case the 
   * user cancels. If left undefined, then no "adjust" button will be rendered. Arguments: 
   * * `value: Number`
   */
  constructor(args = {}) {
    super(args);

    ValidationUtil.validateOrThrow(args, ["currentValue", "maximumValue", "onCurrentValueChange", "onMaximumValueChange"]);
    // Current value settings
    this.currentValue = args.currentValue;
    this.onCurrentValueChange = args.onCurrentValueChange;
    this.currentValueMin = args.currentValueMin;
    this.currentValueMax = args.currentValueMax;
    this.currentValueToolTip = args.currentValueToolTip;
    
    // Current icon settings
    this.currentValueIconClass = args.currentValueIconClass;
    this.currentValueIconToolTip = args.currentValueIconToolTip;
    
    // Maximum value settings
    this.maximumValue = args.maximumValue;
    this.onMaximumValueChange = args.onMaximumValueChange;
    this.maximumValueMin = args.maximumValueMin;
    this.maximumValueMax = args.maximumValueMax;
    this.maximumValueToolTip = args.maximumValueToolTip;
    
    // Maximum icon settings
    this.maximumValueIconClass = args.maximumValueIconClass;
    this.maximumValueIconToolTip = args.maximumValueIconToolTip;
    
    // Adjust button settings
    this.adjustToolTip = args.adjustToolTip;
    this.adjustReminder = args.adjustReminder;
    this.onAdjusted = args.onAdjusted;

    this.vmIcon = new ViewModel({
      id: "vmIcon",
      parent: this,
      localizedToolTip: this.currentValueIconToolTip,
    });
    this.vmCurrent = new InputNumberSpinnerViewModel({
      id: "vmCurrent",
      parent: this,
      localizedToolTip: this.currentValueToolTip,
      value: this.currentValue,
      min: this.currentValueMin,
      max: this.currentValueMax,
      onChange: this.onCurrentValueChange,
    });
    this.vmMax = new InputNumberSpinnerViewModel({
      id: "vmMax",
      parent: this,
      localizedToolTip: this.maximumValueToolTip,
      value: this.maximumValue,
      min: this.maximumValueMin,
      max: this.maximumValueMax,
      onChange: this.onMaximumValueChange,
    });
    this.vmMaxIcon = new ViewModel({
      id: "vmMaxIcon",
      parent: this,
      localizedToolTip: this.maximumValueIconToolTip,
    });
    this.vmAdjust = new ButtonViewModel({
      id: "vmAdjust",
      parent: this,
      localizedToolTip: this.adjustToolTip,
      iconHtml: '<i class="fas fa-edit" style="height: 26px;"></i>',
      onClick: async () => {
        const inputNumber = "inputNumber";
        const inputDefinitions = [
          new DynamicInputDefinition({
            name: inputNumber,
            localizedLabel: game.i18n.localize("system.general.adjustInputLabel"),
            template: InputNumberSpinnerViewModel.TEMPLATE,
            viewModelFactory: (id, parent) => new InputNumberSpinnerViewModel({
              id: id,
              parent: parent,
            }),
            required: true,
            validationFunc: (value) => { return parseInt(value) !== NaN; },
          }),
        ];
        if (ValidationUtil.isDefined(this.adjustReminder)) {
          inputDefinitions.push(
            new DynamicInputDefinition({
              name: "reminder",
              localizedLabel: this.adjustReminder,
            })
          );
        }

        const dialog = await new DynamicInputDialog({
          easyDismissal: true,
          focused: inputNumber,
          inputDefinitions: inputDefinitions,
        }).renderAndAwait(true);

        if (dialog.confirmed !== true) return;

        const number = parseInt(dialog[inputNumber]);
        this.onAdjusted(number);
      },
    });
  }
}
