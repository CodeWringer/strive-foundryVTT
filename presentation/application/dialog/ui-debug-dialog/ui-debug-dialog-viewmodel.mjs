import { ITEM_TYPES } from "../../../../business/model/domain/const/item-types.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import ChoiceOption from "../../../model/choice-option.mjs";
import DynamicComponent from "../../component/dynamic-component/dynamic-component.mjs";
import PreparedSection from "../../component/dynamic-component/prepared-section.mjs";
import InputDropDownViewModel from "../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputImageViewModel from "../../component/input-image/input-image-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputReferenceViewModel from "../../component/input-reference/input-reference-viewmodel.mjs";
import InputRichTextViewModel from "../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import InputSplitNumberSpinnerViewModel from "../../component/input-split-number-spinner/input-split-number-spinner-viewmodel.mjs";
import InputTextFieldViewModel from "../../component/input-textfield/input-textfield-viewmodel.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";

export default class UiDebugDialogViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.dialog.uiDebug; }

  /** @override */
  get clazz() { return UiDebugDialogViewModel; }

  constructor(args = {}) {
    super(args);

    this._vmTextFieldValue = "Some Text";
    this._vmDropDownOptions = [
      new ChoiceOption({
        value: "0",
        localizedValue: "Abc",
      }),
      new ChoiceOption({
        value: "1",
        localizedValue: "Def",
        icon: "ico ico-edit md"
      }),
    ];
    this._vmDropDownValue = this._vmDropDownOptions[0];
    this._vmNumberSpinnerValue = 0;
    this._vmSplitNumberSpinnerValue = {
      current: 0,
      maximum: 10,
    };
    this._vmReferenceValue = null;
    this._vmRichTextValue = "";
    this._vmImgValue = "systems/strive/presentation/image/health-condition-light.svg";

    this.sections = [
      new DynamicComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        cssClass: "flex-grow",
        viewModelFactory: (parent) => {
          return new InputTextFieldViewModel({
            id: "vmTextField",
            parent: parent,
            value: this._vmTextFieldValue,
            isEditable: false,
            toolTip: new ViewModelToolTipDefinition({
              localized: "Text Field",
            }),
            onChange: (_, newValue) => {
              this._vmTextFieldValue = newValue;
            },
          });
        },
      }),
      new DynamicComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        cssClass: "flex-grow",
        viewModelFactory: (parent) => {
          return new InputTextFieldViewModel({
            id: "vmTextField2",
            parent: parent,
            value: this._vmTextFieldValue,
            isEditable: false,
            toolTip: new ViewModelToolTipDefinition({
              localized: "Clickable Text Field",
            }),
            onChange: (_, newValue) => {
              this._vmTextFieldValue = newValue;
            },
            onClickInReadMode: () => {
              this["vmTextField2"].value = "Clicked";
            },
          });
        },
      }),
      new DynamicComponent({
        template: InputDropDownViewModel.TEMPLATE,
        cssClass: "flex-grow",
        viewModelFactory: (parent) => {
          return new InputDropDownViewModel({
            id: "vmDropDown",
            parent: parent,
            value: this._vmDropDownValue,
            isEditable: false,
            toolTip: new ViewModelToolTipDefinition({
              localized: "Dropdown",
            }),
            options: this._vmDropDownOptions,
            onChange: (_, newValue) => {
              this._vmDropDownValue = newValue;
            },
          });
        }
      }),
      new DynamicComponent({
        template: InputNumberSpinnerViewModel.TEMPLATE,
        cssClass: "flex-grow",
        viewModelFactory: (parent) => {
          return new InputNumberSpinnerViewModel({
            id: "vmNumberSpinner",
            parent: parent,
            value: this._vmNumberSpinnerValue,
            isEditable: false,
            toolTip: new ViewModelToolTipDefinition({
              localized: "Number Spinner",
            }),
            onChange: (_, newValue) => {
              this._vmNumberSpinnerValue = newValue;
            },
          });
        }
      }),
      new DynamicComponent({
        template: InputSplitNumberSpinnerViewModel.TEMPLATE,
        cssClass: "flex-grow",
        viewModelFactory: (parent) => {
          return new InputSplitNumberSpinnerViewModel({
            id: "vmSplitNumberSpinner",
            parent: parent,
            toolTip: new ViewModelToolTipDefinition({
              localized: "Split Number Spinner",
            }),
            current: {
              value: this._vmSplitNumberSpinnerValue.current,
            },
            maximum: {
              value: this._vmSplitNumberSpinnerValue.maximum,
            },
            isEditable: false,
            onChange: (_, newValue) => {
              this._vmSplitNumberSpinnerValue = newValue;
            },
          });
        }
      }),
      new DynamicComponent({
        template: InputReferenceViewModel.TEMPLATE,
        cssClass: "flex-grow",
        viewModelFactory: (parent) => {
          return new InputReferenceViewModel({
            id: "vmReference",
            parent: parent,
            value: this._vmReferenceValue,
            isEditable: false,
            acceptedTypes: [ITEM_TYPES.language],
            placeholder: "Choose a Language",
            toolTip: new ViewModelToolTipDefinition({
              localized: "Reference",
            }),
            onChange: (_, newValue) => {
              this._vmReferenceValue = newValue;
            },
          });
        }
      }),
      new DynamicComponent({
        template: InputRichTextViewModel.TEMPLATE,
        cssClass: "flex-grow",
        viewModelFactory: (parent) => {
          return new InputRichTextViewModel({
            id: "vmRichText",
            parent: parent,
            value: this._vmRichTextValue,
            isEditable: false,
            toolTip: new ViewModelToolTipDefinition({
              localized: "Rich Text",
            }),
            onChange: (_, newValue) => {
              this._vmRichTextValue = newValue;
            },
          });
        }
      }),
      new DynamicComponent({
        template: InputImageViewModel.TEMPLATE,
        cssClass: "flex-grow",
        viewModelFactory: (parent) => {
          return new InputImageViewModel({
            id: "vmImg",
            parent: parent,
            value: this._vmImgValue,
            isEditable: false,
            toolTip: new ViewModelToolTipDefinition({
              localized: "Image",
            }),
            onChange: (_, newValue) => {
              this._vmImgValue = newValue;
            },
          });
        }
      }),
    ];

    this.preparedSections = this.sections.map(it => PreparedSection.fromDynamicComponent(it, this));
    for (const prepared of this.preparedSections) {
      if (ValidationUtil.isDefined(prepared.viewModel)) {
        this[prepared.viewModel._id] = prepared.viewModel;
      }
    }
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    for (const section of this.preparedSections) {
      const buttonSwitchToEdit = this.element.find(`button#${section.viewModel.id}-switch-edit`);
      const buttonSwitchToRead = this.element.find(`button#${section.viewModel.id}-switch-read`);

      buttonSwitchToEdit.click(() => {
        section.viewModel.isEditable = true;
      });
      buttonSwitchToRead.click(() => {
        section.viewModel.isEditable = false;
      });
    }
  }
}