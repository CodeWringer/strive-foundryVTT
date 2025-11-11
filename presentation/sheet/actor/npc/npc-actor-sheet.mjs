import ActorSheetSubType from "../actor-sheet-subtype.mjs";
import NpcActorSheetViewModel from "./npc-actor-sheet-viewmodel.mjs";

export default class NpcActorSheet extends ActorSheetSubType {
  /** @override */
  get template() { return NpcActorSheetViewModel.TEMPLATE; }
  
  /** @override */
  get localizedType() { return game.i18n.localize("system.general.actor.npc.abbreviation"); }
  
  /** @override */
  createViewModel(context, document, sheet) {
    return new NpcActorSheetViewModel({
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
        class: "roll-synthetic",
        icon: "fas fa-dice-three",
        onclick: async () => {
          await sheet.viewModel.promptRollSynthetic();
        },
      });
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
