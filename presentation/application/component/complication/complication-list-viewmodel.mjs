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
   * @param {Array<Complication> | undefined} args.value
   */
  constructor(args = {}) {
    super(args);

    this._complicationViewModels = this.#getMappedComplicationViewModels();

    this.vmContextMenuButton = new ButtonDropDownViewModel({
      id: "vmContextMenuButton",
      parent: this,
      isEditable: this.isEditable,
      content: '<i class="ico ico-burger-menu lg"></i>',
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
