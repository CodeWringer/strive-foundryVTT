import { ACTOR_SHEET_SUBTYPE } from "./actor-sheet-subtype.mjs";
import AmbersteelBaseActorSheet from "./ambersteel-base-actor-sheet.mjs";

export default class AmbersteelNpcActorSheet extends AmbersteelBaseActorSheet {
  /** @override */
  get title() { return game.i18n.localize("ambersteel.general.actor.npc.label"); }
}

ACTOR_SHEET_SUBTYPE.set("npc", new AmbersteelNpcActorSheet());
