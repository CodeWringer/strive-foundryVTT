import ActorSheetSubType from "../actor-sheet-subtype.mjs";
import PcActorSheetViewModel from "./pc-actor-sheet-viewmodel.mjs";

export default class PcActorSheet extends ActorSheetSubType {
  /** @override */
  get template() { return PcActorSheetViewModel.TEMPLATE; }
  
  /** @override */
  get localizedType() { return game.i18n.localize("system.general.actor.pc.abbreviation"); }
  
  /** @override */
  createViewModel(context, document, sheet) {
    return new PcActorSheetViewModel({
      id: document.id,
      document: document,
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      sheet: sheet,
    });
  }

  /** @override */
  getHeaderButtons(sheet) {
    const buttons = super.getHeaderButtons(sheet);

    if (game.user.isGM || sheet.actor.isOwner) {
      buttons.push({
        label: game.i18n.localize("system.character.edit"),
        class: "edit-meta",
        icon: "fas fa-cog",
        onclick: async () => {
          await sheet.viewModel.promptConfigure();
        },
      });
    }
    
    return buttons;
  }

}
