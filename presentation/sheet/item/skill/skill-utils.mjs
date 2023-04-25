import * as StringUtil from "../../../../../business/util/string-utility.mjs";
import TransientSkill, { SKILL_HEAD_STATES } from "../../../../business/document/item/transient-skill.mjs";
import DynamicInputDefinition from "../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../../dialog/dynamic-input-dialog/dynamic-input-types.mjs";

/**
 * Queries the user for input for a character asset slot and returns the 
 * inputs made. 
 * 
 * @param {TransientSkill} skill
 * 
 * @returns {Object} Returns an object with the input values. 
 * * Has the fields: 
 * * * `headState: {SkillHeadState}`
 * 
 * @async
 */
export async function querySkillConfiguration(skill) {
  const inputHeadState = "headState";

  const dialog = await new DynamicInputDialog({
    localizedTitle: StringUtil.format(
      game.i18n.localize("ambersteel.general.input.queryFor"), 
      game.i18n.localize("ambersteel.character.asset.slot.label"), 
    ),
    inputDefinitions: [
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.DROP_DOWN,
        name: inputHeadState,
        localizableLabel: "ambersteel.character.skill.headState",
        required: true,
        defaultValue: (skill.headState ?? SKILL_HEAD_STATES.full),
        specificArgs: {
          options: TODO
        }
      }),
    ],
  }).renderAndAwait(true);
  
  if (dialog.confirmed !== true) return;

  const headState = dialog[inputHeadState];

  return {
    headState: headState,
  }
}