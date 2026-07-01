import ItemSheetSubType from "../item-sheet-subtype.mjs";
import ProjectItemSheetViewModel from "./project-item-sheet-viewmodel.mjs";

export default class ProjectItemSheet extends ItemSheetSubType {
  /** @override */
  get template() { return ProjectItemSheetViewModel.TEMPLATE; }

  /** @override */
  get localizedType() { return game.i18n.localize("system.project.project"); }

  /** @override */
  createViewModel(context, document, sheet) {
    return new ProjectItemSheetViewModel({
      id: document.id,
      document: document.getTransientObject(),
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      sheet: sheet,
    });
  }
}
