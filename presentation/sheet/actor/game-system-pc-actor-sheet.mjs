import { ACTOR_SHEET_SUBTYPE } from "./actor-sheet-subtype.mjs";
import GameSystemBaseActorSheet from "./game-system-base-actor-sheet.mjs";

export default class GameSystemPcActorSheet extends GameSystemBaseActorSheet {
  /** @override */
  get title() { return game.i18n.localize("system.general.actor.pc.label"); }
}

ACTOR_SHEET_SUBTYPE.set("pc", new GameSystemPcActorSheet());
