import * as StringUtil from "../../../../business/util/string-utility.mjs";
import TransientSkill, { SKILL_HEAD_STATES } from "../../../../business/document/item/transient-skill.mjs";
import DynamicInputDefinition from "../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../../dialog/dynamic-input-dialog/dynamic-input-types.mjs";
import ChoiceAdapter from "../../../component/input-choice/choice-adapter.mjs";
import ChoiceOption from "../../../component/input-choice/choice-option.mjs";

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
      game.i18n.localize("ambersteel.character.skill.singular"), 
    ),
    inputDefinitions: [
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.DROP_DOWN,
        name: inputHeadState,
        localizableLabel: "ambersteel.character.skill.headState",
        required: true,
        defaultValue: (skill.headState ?? SKILL_HEAD_STATES.FULL),
        specificArgs: {
          options: SKILL_HEAD_STATES.asChoices(),
          adapter: new ChoiceAdapter({
            toChoiceOption: (obj) => { return new ChoiceOption({
              value: obj.name,
              localizedValue: game.i18n.localize(obj.localizableName),
            }); },
            fromChoiceOption: (choice) => { return SKILL_HEAD_STATES.asArray().find(it => it.name === choice.value); }
          }),
        }
      }),
    ],
  }).renderAndAwait(true);
  
  if (dialog.confirmed !== true) return;

  const headState = SKILL_HEAD_STATES.asArray().find(it => it.name === dialog[inputHeadState]);

  return {
    headState: headState,
  }
}