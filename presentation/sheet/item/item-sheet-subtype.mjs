import TransientSkill from "../../../business/document/item/skill/transient-skill.mjs";
import TransientAsset from "../../../business/document/item/transient-asset.mjs";
import TransientFateCard from "../../../business/document/item/transient-fate-card.mjs";
import TransientIllness from "../../../business/document/item/transient-illness.mjs";
import TransientInjury from "../../../business/document/item/transient-injury.mjs";
import TransientMutation from "../../../business/document/item/transient-mutation.mjs";
import TransientScar from "../../../business/document/item/transient-scar.mjs";
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
  [TransientScar.TYPE, new ScarItemSheet()],
  [TransientMutation.TYPE, new MutationItemSheet()],
  [TransientInjury.TYPE, new InjuryItemSheet()],
  [TransientIllness.TYPE, new IllnessItemSheet()],
  [TransientFateCard.TYPE, new FateItemSheet()],
]);
