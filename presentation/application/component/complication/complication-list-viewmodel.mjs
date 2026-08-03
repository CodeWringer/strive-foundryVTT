import { TEMPLATES } from "../../templates.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

export default class ComplicationListViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.complication.list; }

  /** @override */
  get clazz() { return ComplicationListViewModel; }

  constructor(args = {}) {
    super(args);
    
    this.vmContextMenuButton = new ButtonViewModel({
      id: "vmContextMenuButton",
      parent: this,
      isEditable: this.isEditable,
      content: '<i class="ico ico-burger-menu xl"></i>',
      onClick: () => {
        // TODO #767
      },
    });
  }
}
