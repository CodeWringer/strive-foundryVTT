import { ACTOR_TYPES } from "../../../business/document/actor/actor-types.mjs";
import GameSystemBaseActorSheet from "./game-system-base-actor-sheet.mjs";
import GameSystemNpcActorSheet from "./game-system-npc-actor-sheet.mjs";
import GameSystemPcActorSheet from "./game-system-pc-actor-sheet.mjs";

/**
 * A map of specific actor sheet "sub-type" names and a corresponding instance of their "type". 
 * @type {Map<String, GameSystemBaseActorSheet>}
 * @readonly
 */
export const ACTOR_SHEET_SUBTYPE = new Map([
  [ACTOR_TYPES.PLAIN, new GameSystemBaseActorSheet()],
  [ACTOR_TYPES.NPC, new GameSystemNpcActorSheet()],
  [ACTOR_TYPES.PC, new GameSystemPcActorSheet()],
]);
