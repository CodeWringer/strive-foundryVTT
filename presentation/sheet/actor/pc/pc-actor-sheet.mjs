import GameSystemBaseActorSheet from "../base/base-actor-sheet.mjs";

export default class GameSystemPcActorSheet extends GameSystemBaseActorSheet {
  /** @override */
  get title() { return game.i18n.localize("system.general.actor.pc.label"); }
}
