import InputDropDownViewModel from "../../../presentation/component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import DynamicInputDefinition from "../../../presentation/dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../../presentation/dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { ATTRIBUTES } from "../../ruleset/attribute/attributes.mjs";
import { DAMAGE_TYPES } from "../../ruleset/damage-types.mjs";
import { INJURY_STATES } from "../../ruleset/health/injury-states.mjs";
import { StringUtil } from "../../util/string-utility.mjs";
import { ITEM_TYPES } from "../item/item-types.mjs";
import DocumentCreationStrategy from "./document-creation-strategy.mjs";

/**
 * A creation strategy specifically for Injury type documents. 
 * 
 * @extends DocumentCreationStrategy
 */
export default class InjuryCreationStrategy extends DocumentCreationStrategy {
  /** @override */
  async _getCreationData() {
    const damageTypeChoices = DAMAGE_TYPES.asChoices();

    const dialog = await new DynamicInputDialog({
      id: "injury-creation",
      easyDismissal: true,
      localizedTitle: game.i18n.localize("system.character.health.injury.create.dialogTitle"),
      inputDefinitions: [
        new DynamicInputDefinition({
          name: "damageType",
          localizedLabel: game.i18n.localize("system.damageType.label"),
          template: InputDropDownViewModel.TEMPLATE,
          viewModelFactory: (id, parent, overrides) => new InputDropDownViewModel({
            id: id,
            parent: parent,
            options: damageTypeChoices,
            ...overrides,
          }),
        }),
      ],
    }).renderAndAwait(true);

    if (!dialog.confirmed) return;

    const attributes = ATTRIBUTES.asArray();
    const attributeRoll = await new Roll(`1D${attributes.length}`).evaluate();
    const attribute = attributes[attributeRoll.total];

    let treatmentSkill = undefined;
    const damageType = DAMAGE_TYPES[dialog["damageType"].value];
    const additionalPenalties = game.i18n.localize(`system.character.health.injury.additionalPenalties.${damageType.name}`);
    if (damageType === DAMAGE_TYPES.acid) {
      treatmentSkill = game.i18n.localize("system.character.health.treatmentSkill.medicine");
    } else if (damageType === DAMAGE_TYPES.bleeding) {
      treatmentSkill = game.i18n.localize("system.character.health.treatmentSkill.medicine");
    } else if (damageType === DAMAGE_TYPES.bludgeoning) {
      treatmentSkill = game.i18n.localize("system.character.health.treatmentSkill.surgery");
    } else if (damageType === DAMAGE_TYPES.burning) {
      treatmentSkill = game.i18n.localize("system.character.health.treatmentSkill.surgery");
    } else if (damageType === DAMAGE_TYPES.electrical) {
      treatmentSkill = game.i18n.localize("system.character.health.treatmentSkill.medicine");
    } else if (damageType === DAMAGE_TYPES.freezing) {
      treatmentSkill = game.i18n.localize("system.character.health.treatmentSkill.medicine");
    } else if (damageType === DAMAGE_TYPES.piercing) {
      treatmentSkill = game.i18n.localize("system.character.health.treatmentSkill.surgery");
    } else if (damageType === DAMAGE_TYPES.poison) {
      treatmentSkill = game.i18n.localize("system.character.health.treatmentSkill.medicine");
    } else if (damageType === DAMAGE_TYPES.pure) {
      treatmentSkill = game.i18n.localize("system.character.health.treatmentSkill.surgery");
    } else if (damageType === DAMAGE_TYPES.slashing) {
      treatmentSkill = game.i18n.localize("system.character.health.treatmentSkill.medicine");
    }
    
    const obstacleRoll = await new Roll("1D4").evaluate();
    const timeToHealRoll = await new Roll("2D10 + 10").evaluate();

    return {
      name: `${game.i18n.localize(damageType.localizableName)} ${game.i18n.localize("system.character.health.injury.singular")}`,
      type: ITEM_TYPES.INJURY,
      img: "icons/svg/bones.svg",
      system: {
        description: StringUtil.format2(game.i18n.localize("system.character.health.injury.automaticDescription"), {
          attribute: game.i18n.localize(attribute.localizableName),
          additionalPenalties: additionalPenalties,
        }),
        obstacleTreatment: obstacleRoll.total,
        requiredSupplies: game.i18n.localize("system.character.health.injury.requiredSupplies"),
        state: INJURY_STATES.active,
        timeToHeal: timeToHealRoll.total,
        timeToHealElapsed: 0,
        treatmentSkill: treatmentSkill,
      }
    };
  }
}
