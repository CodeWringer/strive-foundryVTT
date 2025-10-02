import GameSystemBaseActorSheet from "../base/base-actor-sheet.mjs";

export default class GameSystemPlainActorSheet extends GameSystemBaseActorSheet {
  /** @override */
  get title() { return game.i18n.localize("system.general.actor.plain.label"); }
}
