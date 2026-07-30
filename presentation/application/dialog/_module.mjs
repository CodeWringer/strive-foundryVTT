import BaseDialogViewModel from "./base-dialog/base-dialog-viewmodel.mjs";
import BaseDialog from "./base-dialog/base-dialog.mjs";
import ConfirmableModalDialog from "./confirmable-modal-dialog/confirmable-modal-dialog.mjs";
import ModalDialog from "./modal-dialog/modal-dialog.mjs";
import UiDebugDialog from "./ui-debug-dialog/ui-debug-dialog.mjs";
import VisibilityChoiceDialog from "./visibility-choice-dialog/visibility-choice-dialog.mjs";

/**
 * Wraps the `presentation.application.dialog` module, which contains all 
 * general and special purpose dialogs. 
 */
export const dialog = {
  BaseDialogViewModel: BaseDialogViewModel,
  BaseDialog: BaseDialog,
  ModalDialog: ModalDialog,
  ConfirmableModalDialog: ConfirmableModalDialog,
  VisibilityChoiceDialog: VisibilityChoiceDialog,
  UiDebugDialog: UiDebugDialog,
  init: () => {
    game.strive.showUiDebugDialog = () => {
      new UiDebugDialog().renderAndAwait(true);
    };
  }
};
