import ButtonAddViewModel from "../component/button-add/button-add-viewmodel.mjs";
import ButtonContextMenuViewModel from "../component/button-context-menu/button-context-menu-viewmodel.mjs";
import ButtonDeleteViewModel from "../component/button-delete/button-delete-viewmodel.mjs";
import ButtonOpenSheetViewModel from "../component/button-open-sheet/button-open-sheet-viewmodel.mjs";
import ButtonRollViewModel from "../component/button-roll/button-roll-viewmodel.mjs";
import ButtonSendToChatViewModel from "../component/button-send-to-chat/button-send-to-chat-viewmodel.mjs";
import ButtonTakeItemViewModel from "../component/button-take-item/button-take-item-viewmodel.mjs";
import ButtonToggleIconViewModel from "../component/button-toggle-icon/button-toggle-icon-viewmodel.mjs";
import ButtonToggleVisibilityViewModel from "../component/button-toggle-visibility/button-toggle-visibility-viewmodel.mjs";
import ButtonToggleViewModel from "../component/button-toggle/button-toggle-viewmodel.mjs";
import ButtonViewModel from "../component/button/button-viewmodel.mjs";
import DamageDefinitionListItemViewModel from "../component/damage-definition-list/damage-definition-list-item-viewmodel.mjs";
import DamageDefinitionListViewModel from "../component/damage-definition-list/damage-definition-list-viewmodel.mjs";
import DiceRollListViewModel from "../component/dice-roll-list/dice-roll-list-viewmodel.mjs";
import InputDropDownViewModel from "../component/input-dropdown/input-dropdown-viewmodel.mjs";
import InputImageViewModel from "../component/input-image/input-image-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputPropertiesViewModel from "../component/input-properties/input-properties-viewmodel.mjs";
import InputRadioButtonGroupViewModel from "../component/input-radio-button-group/input-radio-button-group-viewmodel.mjs";
import InputRichTextViewModel from "../component/input-rich-text/input-rich-text-viewmodel.mjs";
import InputTextareaViewModel from "../component/input-textarea/input-textarea-viewmodel.mjs";
import InputTextFieldViewModel from "../component/input-textfield/input-textfield-viewmodel.mjs";
import LazyLoadViewModel from "../component/lazy-load/lazy-load-viewmodel.mjs";
import LazyRichTextViewModel from "../component/lazy-rich-text/lazy-rich-text-viewmodel.mjs";
import SimpleListViewModel from "../component/simple-list/simple-list-viewmodel.mjs";
import SortableListViewModel from "../component/sortable-list/sortable-list-viewmodel.mjs";
import VisibilityToggleListViewModel from "../component/visibility-toggle-list/visibility-toggle-list-viewmodel.mjs";
import ModalDialog from "../dialog/modal-dialog/modal-dialog.mjs";

/**
 * Registers the Handlebars partials of the components. 
 */
export function initHandlebarsComponents() {
  ButtonViewModel.registerHandlebarsPartial();
  ButtonAddViewModel.registerHandlebarsPartial();
  ButtonContextMenuViewModel.registerHandlebarsPartial();
  ButtonDeleteViewModel.registerHandlebarsPartial();
  ButtonOpenSheetViewModel.registerHandlebarsPartial();
  ButtonRollViewModel.registerHandlebarsPartial();
  ButtonSendToChatViewModel.registerHandlebarsPartial();
  ButtonTakeItemViewModel.registerHandlebarsPartial();
  ButtonToggleViewModel.registerHandlebarsPartial();
  ButtonToggleIconViewModel.registerHandlebarsPartial();
  ButtonToggleVisibilityViewModel.registerHandlebarsPartial();
  DamageDefinitionListViewModel.registerHandlebarsPartial();
  DamageDefinitionListItemViewModel.registerHandlebarsPartial();
  DiceRollListViewModel.registerHandlebarsPartial();
  InputDropDownViewModel.registerHandlebarsPartial();
  InputImageViewModel.registerHandlebarsPartial();
  InputNumberSpinnerViewModel.registerHandlebarsPartial();
  InputPropertiesViewModel.registerHandlebarsPartial();
  InputRadioButtonGroupViewModel.registerHandlebarsPartial();
  InputRichTextViewModel.registerHandlebarsPartial();
  InputTextareaViewModel.registerHandlebarsPartial();
  InputTextFieldViewModel.registerHandlebarsPartial();
  LazyLoadViewModel.registerHandlebarsPartial();
  LazyRichTextViewModel.registerHandlebarsPartial();
  SimpleListViewModel.registerHandlebarsPartial();
  SortableListViewModel.registerHandlebarsPartial();
  VisibilityToggleListViewModel.registerHandlebarsPartial();
  ModalDialog.registerHandlebarsPartial();
}