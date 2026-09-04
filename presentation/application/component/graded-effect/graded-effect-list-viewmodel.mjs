import GradedEffect from "../../../../business/model/domain/graded-effect.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import { SlideInAnim } from "../../../animation/slide-in-anim.mjs";
import { SlideOutAnim } from "../../../animation/slide-out-anim.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import ButtonDropDownViewModel from "../button-dropdown/button-dropdown-viewmodel.mjs";
import { DropDownOption } from "../button-dropdown/dropdown-option.mjs";
import InputTextFieldViewModel from "../input-textfield/input-textfield-viewmodel.mjs";
import GradedEffectViewModel from "./graded-effect-viewmodel.mjs";

export default class GradedEffectListViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.gradedEffect.list; }

  /** @override */
  get clazz() { return GradedEffectListViewModel; }

  /**
   * @type {GradedEffect}
   * @private
   */
  #value;
  /**
   * Returns the current value. 
   * 
   * @type {GradedEffect}
   */
  get value() { return this.#value; }
  /**
   * Sets the current value. 
   * 
   * @param {GradedEffect} newValue
   */
  set value(newValue) {
    if (this.isDisposed) return;

    const oldValue = this.#value;
    this.#value = newValue;

    if (ValidationUtil.isDefined(this.inputElement) && this.inputElement.length > 0) {
      const readElement = this.element.find("> .read-mode");
      readElement.html(newValue);
    }

    this.onChange(newValue, oldValue);
    this._render();
  }

  /**
   * @type {Array<GradedEffectViewModel>}
   * @private
   */
  entryViewModels = [];

  get isEditable() { return super.isEditable; }
  set isEditable(value) {
    super.isEditable = value;

    if (value) {
      new SlideInAnim({
        elm: this.vmContextMenuButton.element,
      }).execute();
    } else {
      new SlideOutAnim({
        elm: this.vmContextMenuButton.element,
      }).execute();
    }
  }

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
   * @param {Boolean | undefined} args.suppressAnims If `true`, suppresses animations that would play when 
   * `isEditable` is changed at run-time. Useful for when this component is child to another, which 
   * instead handles the animations. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `newValue: {Any}`
   * * `oldValue: {Any}`
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
   * @param {Array<GradedEffect> | undefined} args.value
   */
  constructor(args = {}) {
    super(args);

    this.#value = args.value ?? [];
    this.entryViewModels = this.#getMappedViewModels();

    this.vmContextMenuButton = new ButtonDropDownViewModel({
      id: "vmContextMenuButton",
      parent: this,
      isEditable: this.isEditable,
      content: '<i class="ico ico-burger-menu lg"></i>',
      visible: this.isEditable,
      options: [
        new DropDownOption({
          localizedValue: StringUtil.getLoca("system.domain.gradedEffect.add"),
          onClick: () => {
            const newEntry = new GradedEffect();
            this.value = this.value.concat([newEntry]);
          },
        }),
      ],
    });
  }

  /**
   * (Re-)renders the list. 
   * @protected
   */
  async _render() {
    if (!ValidationUtil.isDefined(this.element) || this.element.length === 0) return;

    for (const vm of this.entryViewModels) {
      vm.dispose();
      vm.parent = undefined;
    }
    this._entryViewModels = this.#getMappedViewModels();

    const ulElm = $(this.element.find("> ul"));
    ulElm.empty();

    for await (const vm of this.entryViewModels) {
      const rendered = await FoundryWrapper.renderTemplate(vm.clazz.TEMPLATE, {
        viewModel: vm,
      });
      ulElm.append(rendered);
      const elm = ulElm.find(`#${vm.id}`);
      vm.activateListeners(elm[0]);
    }
  }

  /**
   * @returns {Array<GradedEffectViewModel>}
   * @private
   */
  #getMappedViewModels() {
    let index = 0;
    return this.value.map(entry => new GradedEffectViewModel({
      id: `gradedeffect-${index++}`,
      parent: this,
      document: entry,
      onChange: (fieldName, oldValue, _) => {
        this.#onEntryChange(fieldName, oldValue, entry);
      },
      onDelete: () => {
        this.#onEntryDelete(entry);
      },
    }));
  }

  /**
   * Internal handler of an entry's internal value change. 
   * @param {String} fieldName 
   * @param {Any} oldValue 
   * @param {GradedEffect} entry 
   * @private
   */
  #onEntryChange(fieldName, oldValue, entry) {
    const thisOldValue = this.value.map(c => new GradedEffect({
      comparisonType: c.comparisonType,
      threshold: c.threshold,
      comparisonTarget: c.comparisonTarget,
      unstructured: c.unstructured,
    }));
    const index = this.value.findIndex(it => it == entry);
    const oldEntry = thisOldValue[index];
    oldEntry[fieldName] = oldValue;
    this.onChange(this.value, thisOldValue);
  }

  /**
   * Internal handler for the deletion of an entry.
   * @param {GradedEffect} entry 
   * @private
   */
  #onEntryDelete(entry) {
    const newValue = this.value.concat([]);
    const index = this.value.findIndex(it => it == entry);
    newValue.splice(index, 1);
    this.value = newValue;
  }
}
