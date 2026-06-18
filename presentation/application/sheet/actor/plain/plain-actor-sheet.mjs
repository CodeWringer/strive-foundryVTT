import ActorSheetSubType from "../actor-sheet-subtype.mjs";
import PlainActorSheetViewModel from "./plain-actor-sheet-viewmodel.mjs";

export default class PlainActorSheet extends ActorSheetSubType {
  /** @override */
  get template() { return PlainActorSheetViewModel.TEMPLATE; }

  /** @override */
  get localizedType() { return game.i18n.localize("system.general.actor.plain.abbreviation"); }
  
  /** @override */
  createViewModel(context, document, sheet) {
    return new PlainActorSheetViewModel({
      id: document.id,
      document: document,
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      sheet: sheet,
    });
  }
}
