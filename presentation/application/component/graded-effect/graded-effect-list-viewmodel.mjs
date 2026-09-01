import GradedEffect from "../../../../business/model/domain/graded-effect.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";
import ButtonDropDownViewModel from "../button-dropdown/button-dropdown-viewmodel.mjs";
import { DropDownOption } from "../button-dropdown/dropdown-option.mjs";
import GradedEffectViewModel from "./graded-effect-viewmodel.mjs";

export default class GradedEffectListViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.gradedEffect.list; }

  /** @override */
  get clazz() { return GradedEffectListViewModel; }

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
   * @param {Boolean | undefined} args.autoHandleEvents If `true`, will automatically attach 
   * event listeners for the input element. This behavior may be undesirable by some inheritors, 
   * which can disable it by setting this to `false`. 
   * * default `true`
   * @param {Array<GradedEffect> | undefined} args.value The current value. 
   * @param {Boolean | undefined} args.suppressAnims If `true`, suppresses animations that would play when 
   * `isEditable` is changed at run-time. Useful for when this component is child to another, which 
   * instead handles the animations. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {Array<GradedEffect>}`
   * * `newValue: {Array<GradedEffect>}`
   * @param {Function | undefined} args.onInput Callback that is invoked when any input is made (by keyboard or mouse or other input device). 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   * @param {Function | undefined} args.onFocus Callback that is invoked when the input element is focused. 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   * @param {Function | undefined} args.onFocusLost Callback that is invoked when the input element is unfocused. 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   */
  constructor(args = {}) {
    super(args);

    this.vmContext = new ButtonDropDownViewModel({
      id: "vmContext",
      parent: this,
      options: [
        new DropDownOption({
          localizedValue: StringUtil.getLoca("system.domain.gradedEffect.add"),
          onClick: () => {
            this.value = this.value.concat([
              new GradedEffect(),
            ]);
          },
        }),
      ],
    });

    let _id = 0;
    this.gradedEffectVms = this.value.map(gradedEffect => new GradedEffectViewModel({
      id: `graded-effect-${_id++}`,
      parent: this,
      document: gradedEffect,
      onChange: () => {
        this.onChange(undefined, this.value);
      },
    }));
  }
}