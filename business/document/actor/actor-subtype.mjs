import AmbersteelPcActor from './ambersteel-pc-actor.mjs';
import AmbersteelNpcActor from './ambersteel-npc-actor.mjs';
import AmbersteelPlainActor from './ambersteel-plain-actor.mjs';

/**
 * A map of specific actor "sub-type" names and a corresponding 
 * factory function of their "type". 
 * 
 * The function expects an `Actor` instance as its sole argument. 
 * 
 * @type {Map<String, Function>}
 * @readonly
 * @constant
 */
export const ACTOR_SUBTYPE = new Map();