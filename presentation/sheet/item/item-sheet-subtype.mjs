// Imports of specific item sheet "sub-types", to ensure their imports cause the `ITEM_SHEET_SUBTYPE` map to be populated. 
import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";
import AmbersteelSkillItemSheet from "./ambersteel-skill-item-sheet.mjs";
import AmbersteelFateCardItemSheet from "./ambersteel-fate-item-sheet.mjs";
import AmbersteelInjuryItemSheet from "./ambersteel-injury-item-sheet.mjs";
import AmbersteelIllnessItemSheet from "./ambersteel-illness-item-sheet.mjs";
import AmbersteelMutationItemSheet from "./ambersteel-mutation-item-sheet.mjs";

/**
 * A map of specific item sheet "sub-type" names and a corresponding instance of their "type". 
 * @type {Map<String, AmbersteelBaseItemSheet>}
 * @readonly
 */
export const ITEM_SHEET_SUBTYPE = new Map();