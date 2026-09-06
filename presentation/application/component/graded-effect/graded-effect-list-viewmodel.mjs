import GradedEffect from "../../../../business/model/domain/graded-effect.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import FoundryWrapper from "../../../../foundry-interop/foundry-wrapper.mjs";
import { SlideInAnim } from "../../../animation/slide-in-anim.mjs";
import { SlideOutAnim } from "../../../animation/slide-out-anim.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ValueViewModel from "../../view-model/value-view-model.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import ButtonDropDownViewModel from "../button-dropdown/button-dropdown-viewmodel.mjs";
import { DropDownOption } from "../button-dropdown/dropdown-option.mjs";
import GradedEffectViewModel from "./graded-effect-viewmodel.mjs";

export default class GradedEffectListViewModel extends ValueViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.gradedEffect.list; }

  /** @override */
  get clazz() { return GradedEffectListViewModel; }

  /**
   * Returns the current value. 
   * 
   * @type {GradedEffect}
   */
  get value() { return super.value; }
  /**
   * Sets the current value. 
   * 
   * @param {GradedEffect} newValue
   */
  set value(newValue) {
    if (this.isDisposed) return;

    super.value = newValue;

    this._render();
  }

  /**
   * @type {Array<GradedEffectViewModel>}
   * @private
   */
  #entryViewModels = [];
  /**
   * @type {Array<GradedEffectViewModel>}
   */
  get entryViewModels() { return this.#entryViewModels; }

  get isEditable() { return super.isEditable; }
  set isEditable(value) {
    super.isEditable = value;

    if (value) {
      new SlideInAnim({
        elm: this.element.find("> .edit-mode"),
      }).execute();
    } else {
      new SlideOutAnim({
        elm: this.element.find("> .edit-mode"),
      }).execute();
    }
  }

  /**
   * @param {Object} args
   * @param {Object} args The arguments object. 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * 
   * If no value is provided, a shortened UUID will be generated for it. 
   * 
   * This string may not contain any special characters! Alphanumeric symbols, as well as hyphen ('-') and 
   * underscore ('_') are permitted, but no dots, brackets, braces, slashes, equal sign, and so on. Failing to comply to this 
   * naming restriction may result in DOM elements not being properly detected by the `activateListeners` method. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * Default `false`. 
   * @param {Object | undefined} args.document An associated data document. 
   * @param {Boolean | undefined} args.visible
   * * default `true`
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * 
   * @param {GradedEffect | undefined} args.value Initial value. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives arguments: 
   * * `newValue: {Any}`
   * * `oldValue: {Any}`
   */
  constructor(args = {}) {
    super({
      ...args,
      value: args.value ?? [],
    });

    this.#entryViewModels = this.#getMappedViewModels();

    this.vmContextMenuButton = new ButtonDropDownViewModel({
      id: "vmContextMenuButton",
      parent: this,
      isEditable: this.isEditable,
      content: '<i class="ico ico-burger-menu lg"></i>',
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

  async activateListeners(html) {
    await super.activateListeners(html);

    if (!this.isEditable) {
      this.element.find("> .edit-mode").addClass("hidden");
    }
  }

  /**
   * (Re-)renders the list. 
   * @protected
   */
  async _render() {
    if (!ValidationUtil.isDefined(this.element) || this.element.length === 0) return;

    for (const vm of this.#entryViewModels) {
      vm.dispose();
      vm.parent = undefined;
    }
    this.#entryViewModels = this.#getMappedViewModels();

    const ulElm = $(this.element.find("> ul"));
    ulElm.empty();

    for await (const vm of this.#entryViewModels) {
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
      onChange: () => {
        this.onChange.invoke(this.value);
      },
      onDelete: () => {
        const newValue = this.value.concat([]);
        const index = this.value.findIndex(it => it == entry);
        newValue.splice(index, 1);
        this.value = newValue;
      },
    }));
  }
}
