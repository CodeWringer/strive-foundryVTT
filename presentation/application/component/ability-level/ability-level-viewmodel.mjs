import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../input-number-spinner/input-number-spinner-viewmodel.mjs";

export default class AbilityLevelViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.abilityLevel; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('abilityLevel', `{{> "${AbilityLevelViewModel.TEMPLATE}"}}`);
  }

  /** @override */
  get clazz() { return AbilityLevelViewModel; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * 
   * @param {Boolean | undefined} args.autoHandleEvents If `true`, will automatically attach 
   * event listeners for the input element. This behavior may be undesirable by some inheritors, 
   * which can disable it by setting this to `false`. 
   * * default `true`
   * @param {Any | undefined} args.value The current value. 
   * @param {Boolean | undefined} args.suppressAnims If `true`, suppresses animations that would play when 
   * `isEditable` is changed at run-time. Useful for when this component is child to another, which 
   * instead handles the animations. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {Any}`
   * * `newValue: {Any}`
   * @param {Function | undefined} args.onInput Callback that is invoked when any input is made (by keyboard or mouse or other input device). 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   * @param {Function | undefined} args.onFocus Callback that is invoked when the input element is focused. 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   * @param {Function | undefined} args.onFocusLost Callback that is invoked when the input element is unfocused. 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   * 
   * @param {Number | undefined} args.diceCount Number of dice to display as rollable. 
   * @param {Function | undefined} args.onRoll Invoked when the roll button is clicked. 
   * @param {ViewModelToolTipDefinition | undefined} args.levelToolTip 
   * @param {ViewModelToolTipDefinition | undefined} args.rollButtonToolTip 
   */
  constructor(args = {}) {
    super(args);

    this.diceCount = args.diceCount;
    this.onRoll = args.onRoll ?? (() => {});

    let buttonContent;
    if (ValidationUtil.isDefined(this.diceCount)) {
      buttonContent = `<div class="flex flex-row flex-middle"><span class="margin-r-md">${this.diceCount}</span><i class="ico ico-die md"></i></div>`;
    } else {
      buttonContent = '<div class="flex flex-row flex-middle"><i class="ico ico-die md"></i></div>';
    }

    this.vmLevelEditMode = new InputNumberSpinnerViewModel({
      id: "vmLevelEditMode",
      parent: this,
      value: this.value,
      toolTip: args.levelToolTip,
      onChange: (_, newValue) => {
        this.value = newValue;
      },
    });
    this.vmLevelReadMode = new ViewModel({
      id: "vmLevelReadMode",
      parent: this,
      toolTip: args.levelToolTip,
    });

    this.vmRollReadMode = new ButtonViewModel({
      id: "vmRollReadMode",
      parent: this,
      content: buttonContent,
      toolTip: args.rollButtonToolTip,
      onClick: () => {
        this.onRoll();
      },
    });
  }
}
