import TransientAsset from "./transient-asset.mjs";
import TransientFateCard from "./transient-fate-card.mjs";
import TransientIllness from "./transient-illness.mjs";
import TransientInjury from "./transient-injury.mjs";
import TransientMutation from "./transient-mutation.mjs";
import TransientSkill from "./transient-skill.mjs";

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