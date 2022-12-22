/**
 * A map of specific item "sub-type" names and a corresponding 
 * factory function of their "type". 
 * 
 * The factory function expects an `Item` document instance as its sole argument. 
 * 
 * @type {Map<String, Function>}
 * @readonly
 * @constant
 */
export const ITEM_SUBTYPE = new Map();