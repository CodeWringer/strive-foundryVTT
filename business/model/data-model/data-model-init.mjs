import CharacterActorData from "./actor/character-actor-data.mjs";
import PlainActorData from "./actor/plain-actor-data.mjs";
import AssetItemData from "./item/asset-item-data.mjs";
import FateCardItemData from "./item/fate-card-item-data.mjs";
import HealthConditionItemData from "./item/health-condition-item-data.mjs";
import IllnessItemData from "./item/illness-item-data.mjs";
import LanguageItemData from "./item/language-item-data.mjs";
import MutationItemData from "./item/mutation-item-data.mjs";
import ProjectItemData from "./item/project-item-data.mjs";
import RecipeItemData from "./item/recipe-item-data.mjs";
import SkillItemData from "./item/skill-item-data.mjs";
import TraitItemData from "./item/trait-item-data.mjs";

/**
 * Wraps the initialization logic of the data model classes. 
 * 
 * `register` **MUST** be executed during initialization of the system!
 * 
 * @abstract
 */
export default class DataModelInit {
  /**
   * Ensures the global config contains the data model declarations. 
   * 
   * @static
   */
  static register() {
    CONFIG.Actor.dataModels = {
      plain: PlainActorData,
      character: CharacterActorData,
    };
    CONFIG.Item.dataModels = {
      asset: AssetItemData,
      language: LanguageItemData,
      skill: SkillItemData,
      fateCard: FateCardItemData,
      illness: IllnessItemData,
      mutation: MutationItemData,
      healthCondition: HealthConditionItemData,
      trait: TraitItemData,
      project: ProjectItemData,
      recipe: RecipeItemData,
    };
  }
}
