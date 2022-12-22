/**
 * A map of specific actor "sub-type" names and a corresponding 
 * factory function of their "type". 
 * 
 * The factory function expects an `Actor` document instance as its sole argument. 
 * 
 * @type {Map<String, Function>}
 * 
 * @readonly
 * @constant
 */
export const ACTOR_SUBTYPE = new Map();