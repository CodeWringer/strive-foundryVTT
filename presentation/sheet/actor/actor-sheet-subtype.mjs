// Imports of specific actor sheet "sub-types", to ensure their imports cause the `ACTOR_SHEET_SUBTYPE` map to be populated. 
import AmbersteelBaseActorSheet from "./ambersteel-base-actor-sheet.mjs";
import AmbersteelNpcActorSheet from "./ambersteel-npc-actor-sheet.mjs";
import AmbersteelPcActorSheet from "./ambersteel-pc-actor-sheet.mjs";

/**
 * A map of specific actor sheet "sub-type" names and a corresponding instance of their "type". 
 * @type {Map<String, AmbersteelBaseActorSheet>}
 * @readonly
 */
export const ACTOR_SHEET_SUBTYPE = new Map();