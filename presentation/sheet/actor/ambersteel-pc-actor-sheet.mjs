import { ACTOR_SHEET_SUBTYPE } from "./actor-sheet-subtype.mjs";
import AmbersteelBaseActorSheet from "./ambersteel-base-actor-sheet.mjs";

export default class AmbersteelPcActorSheet extends AmbersteelBaseActorSheet {
  /** @override */
  get title() { return game.i18n.localize("ambersteel.general.actor.pc.label"); }
}

ACTOR_SHEET_SUBTYPE.set("pc", new AmbersteelPcActorSheet());
