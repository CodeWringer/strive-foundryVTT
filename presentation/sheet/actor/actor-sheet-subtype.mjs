import TransientNpc from "../../../business/document/actor/transient-npc.mjs";
import TransientPc from "../../../business/document/actor/transient-pc.mjs";
import TransientPlainActor from "../../../business/document/actor/transient-plain-actor.mjs";
import GameSystemBaseActorSheet from "./game-system-base-actor-sheet.mjs";
import GameSystemNpcActorSheet from "./game-system-npc-actor-sheet.mjs";
import GameSystemPcActorSheet from "./game-system-pc-actor-sheet.mjs";

/**
 * A map of specific actor sheet "sub-type" names and a corresponding instance of their "type". 
 * @type {Map<String, GameSystemBaseActorSheet>}
 * @readonly
 */
export const ACTOR_SHEET_SUBTYPE = new Map([
  [TransientPlainActor.TYPE, new GameSystemBaseActorSheet()],
  [TransientNpc.TYPE, new GameSystemNpcActorSheet()],
  [TransientPc.TYPE, new GameSystemPcActorSheet()],
]);
