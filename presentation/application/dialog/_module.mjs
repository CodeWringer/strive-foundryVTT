import ConfirmableModalDialog from "./confirmable-modal-dialog/confirmable-modal-dialog.mjs";
import ModalDialogViewModel from "./modal-dialog/modal-dialog-viewmodel.mjs";
import ModalDialog from "./modal-dialog/modal-dialog.mjs";
import UiDebugDialog from "./ui-debug-dialog/ui-debug-dialog.mjs";
import VisibilityChoiceDialog from "./visibility-choice-dialog/visibility-choice-dialog.mjs";

/**
 * Wraps the `presentation.application.dialog` module, which contains all 
 * general and special purpose dialogs. 
 */
export const dialog = {
  ModalDialogViewModel: ModalDialogViewModel,
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
