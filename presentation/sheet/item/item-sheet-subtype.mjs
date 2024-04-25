import { ITEM_TYPES } from "../../../business/document/item/item-types.mjs";
import AssetItemSheet from "./asset/asset-item-sheet.mjs";
import FateItemSheet from "./fate-card/fate-item-sheet.mjs";
import IllnessItemSheet from "./illness/illness-item-sheet.mjs";
import InjuryItemSheet from "./injury/injury-item-sheet.mjs";
import MutationItemSheet from "./mutation/mutation-item-sheet.mjs";
import ScarItemSheet from "./scar/scar-item-sheet.mjs";
import SkillItemSheet from "./skill/skill-item-sheet.mjs";

/**
 * A map of specific item sheet "sub-type" names and a corresponding instance of their "type". 
 * @type {Map<String, GameSystemBaseItemSheet>}
 * @readonly
 */
export const ITEM_SHEET_SUBTYPE = new Map([
  [ITEM_TYPES.ASSET, new AssetItemSheet()],
  [ITEM_TYPES.SKILL, new SkillItemSheet()],
  [ITEM_TYPES.SCAR, new ScarItemSheet()],
  [ITEM_TYPES.MUTATION, new MutationItemSheet()],
  [ITEM_TYPES.INJURY, new InjuryItemSheet()],
  [ITEM_TYPES.ILLNESS, new IllnessItemSheet()],
  [ITEM_TYPES.FATE_CARD, new FateItemSheet()],
]);
