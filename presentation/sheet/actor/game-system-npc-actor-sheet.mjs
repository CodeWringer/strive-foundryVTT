import GameSystemBaseActorSheet from "./game-system-base-actor-sheet.mjs";

export default class GameSystemNpcActorSheet extends GameSystemBaseActorSheet {
  /** @override */
  get title() { return game.i18n.localize("system.general.actor.npc.label"); }
}

