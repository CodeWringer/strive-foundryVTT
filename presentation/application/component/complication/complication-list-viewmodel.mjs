import Complication from "../../../../business/model/domain/complication/complication.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import FoundryWrapper from "../../../../foundry-interop/foundry-wrapper.mjs";
import { TEMPLATES } from "../../templates.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";
import ButtonDropDownViewModel from "../button-dropdown/button-dropdown-viewmodel.mjs";
import { DropDownOption } from "../button-dropdown/dropdown-option.mjs";
import ComplicationViewModel from "./complication-viewmodel.mjs";

export default class ComplicationListViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.complication.list; }

  /** @override */
  get clazz() { return ComplicationListViewModel; }

  /**
   * Returns the current value. 
   * 
   * @type {Array<Complication>}
   */
  get value() { return super.value; }
  /**
   * Sets the current value. 
   * 
   * @param {Array<Complication>} newValue
   */
  set value(newValue) {
    super.value = newValue;

    this._render();
  }

  /**
   * @type {Array<ComplicationViewModel>}
   * @private
   */
  _complicationViewModels = [];

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
   * @param {Array<Complication> | undefined} args.value
   */
  constructor(args = {}) {
    super(args);

    this._complicationViewModels = this.#getMappedComplicationViewModels();

    this.vmContextMenuButton = new ButtonDropDownViewModel({
      id: "vmContextMenuButton",
      parent: this,
      isEditable: this.isEditable,
      options: [
        new DropDownOption({
          localizedValue: StringUtil.getLoca("system.domain.complication.add"),
          onClick: () => {
            const newComplication = new Complication({
              name: StringUtil.getLoca("system.domain.complication.defaultName")
            });
            this.value = this.value.concat([newComplication]);
          },
        }),
        new DropDownOption({
          localizedValue: StringUtil.getLoca("system.domain.complication.sortAsc"),
          onClick: () => {
            const newValue = this.value.concat([]);
            newValue.sort((a, b) => a.name.localeCompare(b.name));
            this.value = newValue;
          },
          condition: (event) => {
            return !event.altKey;
          },
        }),
        new DropDownOption({
          localizedValue: StringUtil.getLoca("system.domain.complication.sortDesc"),
          onClick: () => {
            const newValue = this.value.concat([]);
            newValue.sort((a, b) => b.name.localeCompare(a.name));
            this.value = newValue;
          },
          condition: (event) => {
            return event.altKey;
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
    for (const vm of this._complicationViewModels) {
      vm.dispose();
      vm.parent = undefined;
    }
    this._complicationViewModels = this.#getMappedComplicationViewModels();

    const ulElm = $(this.element.find("> ul"));
    ulElm.empty();

    for await (const vm of this._complicationViewModels) {
      const rendered = await FoundryWrapper.renderTemplate(vm.clazz.TEMPLATE, {
        viewModel: vm,
      });
      ulElm.append(rendered);
      const elm = ulElm.find(`#${vm.id}`);
      vm.activateListeners(elm[0]);
    }
  }

  /**
   * Maps the `Complication`s to `ComplicationViewModel`s and returns them. 
   * @returns {Array<ComplicationViewModel>}
   * @private
   */
  #getMappedComplicationViewModels() {
    let index = 0;
    return this.value.map(complication => new ComplicationViewModel({
      id: `complication-${index++}`,
      parent: this,
      document: complication,
      onChange: (fieldName, oldValue, _) => {
        this.#onComplicationChange(fieldName, oldValue, complication);
      },
      onDelete: () => {
        this.#onComplicationDelete(complication);
      },
    }));
  }

  /**
   * Internal handler of a Complication's internal value change. 
   * @param {String} fieldName 
   * @param {Any} oldValue 
   * @param {Complication} complication 
   * @private
   */
  #onComplicationChange(fieldName, oldValue, complication) {
    const thisOldValue = this.value.map(c => new Complication({
      name: c.name,
      description: c.description,
    }));
    const index = this.value.findIndex(it => it == complication);
    const oldComplication = thisOldValue[index];
    oldComplication[fieldName] = oldValue;
    this.onChange(thisOldValue, this.value);
  }

  /**
   * Internal handler for the deletion of a Complication.
   * @param {Complication} complication 
   * @private
   */
  #onComplicationDelete(complication) {
    const newValue = this.value.concat([]);
    const index = this.value.findIndex(it => it == complication);
    newValue.splice(index, 1);
    this.value = newValue;
  }
}
