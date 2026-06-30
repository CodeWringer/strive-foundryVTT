import CharacterActorData from "./actor/character-actor-data.mjs";
import PlainActorData from "./actor/plain-actor-data.mjs";
import AssetItemData from "./item/asset-item-data.mjs";
import BaseItemData from "./item/base-item-data.mjs";
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
 * Wraps the data-model module. 
 * 
 * IMPORTANT the `init` function MUST be called during the system's setup!
 */
export const dataModel = {
  actor: {
    PlainActorData: PlainActorData,
    CharacterActorData: CharacterActorData,
  },
  item: {
    BaseItemData: BaseItemData,
    AssetItemData: AssetItemData,
    LanguageItemData: LanguageItemData,
    SkillItemData: SkillItemData,
    FateCardItemData: FateCardItemData,
    IllnessItemData: IllnessItemData,
    MutationItemData: MutationItemData,
    HealthConditionItemData: HealthConditionItemData,
    TraitItemData: TraitItemData,
    ProjectItemData: ProjectItemData,
    RecipeItemData: RecipeItemData,
  },
  /**
   * Wraps the initialization logic of the data model classes. 
   * 
   * `register` **MUST** be executed during initialization of the system!
   * 
   * @abstract
   * @constant
   */
  init: () => {
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
  },
};
