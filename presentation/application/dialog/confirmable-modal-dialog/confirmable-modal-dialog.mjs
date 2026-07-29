import { StringUtil } from "../../../../common/util/string-utility.mjs";
import ButtonViewModel from "../../component/button/button-viewmodel.mjs";
import DynamicComponent from "../../component/dynamic-component/dynamic-component.mjs";
import RowViewModel from "../../component/row/row-viewmodel.mjs";
import ModalDialog from "../modal-dialog/modal-dialog.mjs";

/**
 * @summary
 * Represents the a confirmable dialog. 
 * 
 * @extends ModalDialog
 * 
 * @abstract Inheritors _should_ override:
 * * `get id`
 * 
 * @property {BaseDialogViewModel} viewModel
 * @property {Boolean} easyDismissal If `true`, allows for easier dialog 
 * dismissal, by clicking anywhere on the backdrop element. 
 * * Default `true`
 * @property {Boolean} confirmed If `true`, the user closed the dialog 
 * through confirmation. 
 * @property {String | undefined} initialFocus
 * 
 * @method onClose Invoked upon the dialog closing. 
 * Receives this dialog instance as its only argument. 
 */
export default class ConfirmableModalDialog extends ModalDialog {
  /**
   * @param {Object} args 
   * @param {Boolean | undefined} args.easyDismissal If true, allows for easier dialog 
   * dismissal, by clicking anywhere on the backdrop element. 
   * * default `true`
   * @param {Function | undefined} args.onClose A function to invoke upon the 
   * closing of the dialog. Receives this dialog instance as its only argument. 
   * @param {String | undefined} args.title Localized string for the dialog title. 
   * @param {Array<DynamicComponent> | undefined} args.sections The sections that will 
   * be rendered as content of the dialog. 
   * @param {String | undefined} args.initialFocus
   */
  constructor(args = {}) {
    super({
      ...args,
      initialFocus: args.initialFocus ?? "vmConfirm",
      sections: (args.sections ?? []).concat([
        new DynamicComponent({
          html: '<span class="flex-grow"></span>',
        }),
        new DynamicComponent({
          template: RowViewModel.TEMPLATE,
          viewModelFactory: (parent) => new RowViewModel({
            parent: parent,
            sections: [
              new DynamicComponent({
                template: ButtonViewModel.TEMPLATE,
                cssClass: "flex-grow",
                viewModelFactory: (parent) => new ButtonViewModel({
                  id: "vmConfirm",
                  parent: parent,
                  content: `<i class="fas fa-check"></i><span class="strive-regular-font font-size-lg">${StringUtil.getLoca("system.general.confirm")}</span>`,
                  onClick: () => {
                    this.confirmed = true;
                    this.close();
                  }
                }),
              }),
              new DynamicComponent({
                template: ButtonViewModel.TEMPLATE,
                cssClass: "flex-grow",
                viewModelFactory: (parent) => new ButtonViewModel({
                  id: "vmCancel",
                  parent: parent,
                  content: `<i class="fas fa-times"></i><span class="strive-regular-font font-size-lg">${StringUtil.getLoca("system.general.cancel")}</span>`,
                  onClick: () => {
                    this.confirmed = false;
                    this.close();
                  }
                }),
              }),
            ],
          }),
        }),
      ]),
    });

    this.confirmed = false;
  }
}