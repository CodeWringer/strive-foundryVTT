import Complication from "../../../../business/model/domain/complication/complication.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { SlideDisplaceAnim } from "../../../animation/slide-displace-anim.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import ButtonDropDownViewModel from "../button-dropdown/button-dropdown-viewmodel.mjs";
import { DropDownOption } from "../button-dropdown/dropdown-option.mjs";
import InputRichTextViewModel from "../input-rich-text/input-rich-text-viewmodel.mjs";
import InputTextFieldViewModel from "../input-textfield/input-textfield-viewmodel.mjs";

export default class ComplicationViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.complication.item; }

  /** @override */
  get clazz() { return ComplicationViewModel; }

  get isEditable() { return super.isEditable; }
  set isEditable(value) {
    super.isEditable = value;

    const editElement = this.element.find("> div > .edit-mode");
    const readElement = this.element.find("> div > .read-mode");
    if (!this._suppressAnims) {
      if (value) {
        new SlideDisplaceAnim({
          displacingElement: editElement,
          displacedElement: readElement,
        }).execute();
      } else {
        new SlideDisplaceAnim({
          displacingElement: readElement,
          displacedElement: editElement,
        }).execute();
      }
    } else {
      if (value) {
        editElement.removeClass("hidden");
        readElement.addClass("hidden");
      } else {
        editElement.addClass("hidden");
        readElement.removeClass("hidden");
      }
    }
  }

  /**
   * @param {Object} args 
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
   * @param {Complication} args.document 
   * @param {Function<void> | undefined} args.onChange Invoked when any property value of 
   * the complication document changes. Arguments: 
   * * `fieldName: String` - Name of the field/property on this instance that was changed. 
   * * `oldValue: Any` - Value prior to the change. 
   * * `newValue: Any` - Value after the change, and the current value. 
   * @param {Function<void> | undefined} args.onDelete Invoked when the entry is to be deleted. 
   */
  constructor(args = {}) {
    super(args);

    this.onChange = args.onChange ?? (() => { });
    this.onDelete = args.onDelete ?? (() => { });

    this.document = args.document;
    this.document.onChange = (fieldName, oldValue, newValue) => {
      this.onChange(fieldName, oldValue, newValue);
    }

    this.vmName = new InputTextFieldViewModel({
      id: "vmName",
      parent: this,
      isEditable: this.isEditable,
      value: this.document.name,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.domain.complication.name"),
      }),
      onChange: (_, newValue) => {
        this.document.name = newValue;
      }
    });
    this.vmContextMenuButton = new ButtonDropDownViewModel({
      id: "vmContextMenuButton",
      parent: this,
      isEditable: this.isEditable,
      content: '<i class="ico ico-burger-menu lg"></i>',
      options: [
        new DropDownOption({
          localizedValue: StringUtil.getLoca("system.domain.complication.delete"),
          onClick: () => {
            this.onDelete();
          },
        }),
      ],
    });
    this.vmDescription = new InputRichTextViewModel({
      id: "vmDescription",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.general.description"),
      }),
      value: this.document.description,
      onChange: (_, newValue) => {
        this.document.description = newValue;
      },
    });
  }

  async activateListeners(html) {
    await super.activateListeners(html);

    const editElement = this.element.find("> div > .edit-mode");
    const readElement = this.element.find("> div > .read-mode");
    if (this.isEditable) {
      editElement.removeClass("hidden");
      readElement.addClass("hidden");
    } else {
      editElement.addClass("hidden");
      readElement.removeClass("hidden");
    }
  }
}
