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
  [TransientAsset.TYPE, new AssetItemSheet()],
  [TransientSkill.TYPE, new SkillItemSheet()],
  ["scar", new ScarItemSheet()],
  ["mutation", new MutationItemSheet()],
  ["injury", new InjuryItemSheet()],
  [TransientIllness.TYPE, new IllnessItemSheet()],
  [TransientFateCard.TYPE, new FateItemSheet()],
]);
