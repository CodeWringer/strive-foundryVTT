import { StringUtil } from "../util/string-utility.mjs";
import { ATTRIBUTE_TIERS } from "./attribute/attribute-tier.mjs";
import CharacterAttribute from "./attribute/character-attribute.mjs";
import Ruleset from "./ruleset.mjs";

export default class RulesetExplainer {
  /**
   * 
   * @param {CharacterAttribute} attribute 
   * 
   * @returns {String}
   */
  getExplanationForAttributeAdvancement(attribute) {
    const tier = new Ruleset().getAttributeLevelTier(attribute.level);
    let factor;
    if (tier.name === ATTRIBUTE_TIERS.underdeveloped.name) {
      factor = 10;
    } else if (tier.name === ATTRIBUTE_TIERS.average.name) {
      factor = 7;
    } else if (tier.name === ATTRIBUTE_TIERS.exceptional.name) {
      factor = 8;
    }
    return StringUtil.format(
      game.i18n.localize("system.rules.attributeAdvancementRequirements"),
      game.i18n.localize(tier.localizableName),
      attribute.level,
      factor,
      attribute.advancementRequirements,
    );
  }
}
