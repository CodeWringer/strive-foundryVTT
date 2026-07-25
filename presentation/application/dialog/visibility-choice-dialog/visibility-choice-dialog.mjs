import { VISIBILITY_MODES, VisibilityMode } from "../../../../business/model/domain/const/visibility-modes.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ChoicesUtil } from "../../../util/choices-utility.mjs";
import DynamicComponent from "../../component/dynamic-component/dynamic-component.mjs";
import InputDropDownViewModel from "../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import ConfirmableModalDialog from "../confirmable-modal-dialog/confirmable-modal-dialog.mjs";

/**
 * Allows the selection of a visibility mode option. 
 * 
 * Useful for whenever a user wants to send a message to the chat. 
 * 
 * @extends ConfirmableModalDialog
 */
export default class VisibilityChoiceDialog extends ConfirmableModalDialog {
  /**
   * Returns the chosen visibility mode value. 
   * @type {VisibilityMode}
   * @readonly
   */
  get value() { return VISIBILITY_MODES[this.viewModel.vmVisibilityMode.value.value]; }

  constructor(args = {}) {
    super({
      ...args,
      title: StringUtil.getLoca("system.general.messageVisibility.query"),
      sections: [
        new DynamicComponent({
          template: InputDropDownViewModel.TEMPLATE,
          cssClass: "flex-grow",
          viewModelFactory: (parent) => new InputDropDownViewModel({
            id: "vmVisibilityMode",
            parent: parent,
            options: ChoicesUtil.getAsChoices(VISIBILITY_MODES),
          }),
        }),
      ],
    });
  }
}