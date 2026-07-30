import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import BaseDialog from "../base-dialog/base-dialog.mjs";
import UiDebugDialogViewModel from "./ui-debug-dialog-viewmodel.mjs";

export default class UiDebugDialog extends BaseDialog {
  /** @override */
  static DEFAULT_OPTIONS = {
    position: { width: 600, height: 800, },
    classes: ["strive", "modal", "ui-debug-dialog", "strive-regular-font"],
    tag: "form",
    window: {
      resizable: true,
      minimizable: false,
    },
  }

  /** @override */
  static PARTS = {
    form: {
      template: TEMPLATES.application.dialog.uiDebug,
    },
  }
  
  /** @override */
  get id() { return "ui-debug-dialog"; }

  constructor(args = {}) {
    super({
      ...args,
      title: StringUtil.getLoca("system.debug.uiDebugDialogTitle"),
    });
  }

  /** @override */
  createViewModel() {
    return new UiDebugDialogViewModel({
      isEditable: true,
      sections: this.sections,
      initialFocus: this.initialFocus,
    });
  }
}