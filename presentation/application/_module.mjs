import FoundryWrapper from "../../foundry-interop/foundry-wrapper.mjs";
import { component } from "./component/_module.mjs";
import Tooltip from "./component/tooltip/tooltip.mjs";
import BaseItemSheetViewModel from "./item/base/sheet/base-item-sheet-viewmodel.mjs";
import BaseItemSheet from "./item/base/sheet/base-item-sheet.mjs";
import LanguageItemSheet from "./item/language/language-item-sheet.mjs";
import { TEMPLATES } from "./templates.mjs";
import BaseSheetViewModel from "./view-model/base-sheet-viewmodel.mjs";
import InputViewModel from "./view-model/input-view-model.mjs";
import ViewModelCollection from "./view-model/view-model-collection.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "./view-model/view-model.mjs";
import { dialog } from "./dialog/_module.mjs";
import LanguageContentViewModel from "./item/language/language-content-viewmodel.mjs";
import LanguageItemSheetViewModel from "./item/language/language-item-sheet-viewmodel.mjs";
import InjuryItemSheet from "./item/injury/injury-item-sheet.mjs";
import InjuryItemSheetViewModel from "./item/injury/injury-item-sheet-viewmodel.mjs";
import InjuryContentViewModel from "./item/injury/injury-content-viewmodel.mjs";
import { ITEM_TYPES } from "../../business/model/domain/const/item-types.mjs";
import IllnessContentViewModel from "./item/illness/illness-content-viewmodel.mjs";
import IllnessItemSheetViewModel from "./item/illness/illness-item-sheet-viewmodel.mjs";
import IllnessItemSheet from "./item/illness/illness-item-sheet.mjs";
import MutationContentViewModel from "./item/mutation/mutation-content-viewmodel.mjs";
import MutationItemSheetViewModel from "./item/mutation/mutation-item-sheet-viewmodel.mjs";
import MutationItemSheet from "./item/mutation/mutation-item-sheet.mjs";
import HealthConditionContentViewModel from "./item/health-condition/health-condition-content-viewmodel.mjs";
import HealthConditionItemSheetViewModel from "./item/health-condition/health-condition-item-sheet-viewmodel.mjs";
import HealthConditionItemSheet from "./item/health-condition/health-condition-item-sheet.mjs";
import HealthConditionHeaderViewModel from "./item/health-condition/health-condition-header-viewmodel.mjs";
import InjuryHeaderViewModel from "./item/injury/injury-header-viewmodel.mjs";
import IllnessHeaderViewModel from "./item/illness/illness-header-viewmodel.mjs";
import MutationHeaderViewModel from "./item/mutation/mutation-header-viewmodel.mjs";
import LanguageHeaderViewModel from "./item/language/language-header-viewmodel.mjs";
import BaseItemContentViewModel from "./item/base/base-item-content-viewmodel.mjs";
import BaseItemHeaderViewModel from "./item/base/base-item-header-viewmodel.mjs";
import AssetHeaderViewModel from "./item/asset/asset-header-viewmodel.mjs";
import AssetContentViewModel from "./item/asset/asset-content-viewmodel.mjs";
import AssetItemSheetViewModel from "./item/asset/asset-item-sheet-viewmodel.mjs";
import AssetItemSheet from "./item/asset/asset-item-sheet.mjs";
import ProjectContentViewModel from "./item/project/project-content-viewmodel.mjs";
import ProjectHeaderViewModel from "./item/project/project-header-viewmodel.mjs";
import ProjectItemSheetViewModel from "./item/project/project-item-sheet-viewmodel.mjs";
import ProjectItemSheet from "./item/project/project-item-sheet.mjs";
import RecipeItemSheetViewModel from "./item/recipe/recipe-item-sheet-viewmodel.mjs";
import RecipeHeaderViewModel from "./item/recipe/recipe-header-viewmodel.mjs";
import RecipeContentViewModel from "./item/recipe/recipe-content-viewmodel.mjs";
import RecipeItemSheet from "./item/recipe/recipe-item-sheet.mjs";
import SkillItemSheetViewModel from "./item/skill/skill-item-sheet-viewmodel.mjs";
import SkillHeaderViewModel from "./item/skill/skill-header-viewmodel.mjs";
import SkillContentViewModel from "./item/skill/skill-content-viewmodel.mjs";
import SkillItemSheet from "./item/skill/skill-item-sheet.mjs";
import TraitItemSheetViewModel from "./item/trait/trait-item-sheet-viewmodel.mjs";
import TraitHeaderViewModel from "./item/trait/trait-header-viewmodel.mjs";
import TraitContentViewModel from "./item/trait/trait-content-viewmodel.mjs";
import TraitItemSheet from "./item/trait/trait-item-sheet.mjs";

/**
 * Wraps the `presentation.application` module, which contains all dedicated windows, 
 * dialogs and sheets. 
 */
export const application = {
  component: component,
  dialog: dialog,
  viewModel: {
    ViewModel: ViewModel,
    ViewModelToolTipDefinition: ViewModelToolTipDefinition,
    ViewModelCollection: ViewModelCollection,
    InputViewModel: InputViewModel,
    base: {
      BaseItemHeaderViewModel: BaseItemHeaderViewModel,
      BaseItemContentViewModel: BaseItemContentViewModel,
      BaseItemSheetViewModel: BaseItemSheetViewModel,
      BaseSheetViewModel: BaseSheetViewModel,
    },
    asset: {
      AssetItemSheetViewModel: AssetItemSheetViewModel,
      AssetHeaderViewModel: AssetHeaderViewModel,
      AssetContentViewModel: AssetContentViewModel,
    },
    healthCondition: {
      HealthConditionContentViewModel: HealthConditionContentViewModel,
      HealthConditionHeaderViewModel: HealthConditionHeaderViewModel,
      HealthConditionItemSheetViewModel: HealthConditionItemSheetViewModel,
    },
    injury: {
      InjuryItemSheetViewModel: InjuryItemSheetViewModel,
      InjuryHeaderViewModel: InjuryHeaderViewModel,
      InjuryContentViewModel: InjuryContentViewModel,
    },
    illness: {
      IllnessContentViewModel: IllnessContentViewModel,
      IllnessHeaderViewModel: IllnessHeaderViewModel,
      IllnessItemSheetViewModel: IllnessItemSheetViewModel,
    },
    language: {
      LanguageItemSheetViewModel: LanguageItemSheetViewModel,
      LanguageHeaderViewModel: LanguageHeaderViewModel,
      LanguageContentViewModel: LanguageContentViewModel,
    },
    mutation: {
      MutationContentViewModel: MutationContentViewModel,
      MutationHeaderViewModel: MutationHeaderViewModel,
      MutationItemSheetViewModel: MutationItemSheetViewModel,
    },
    project: {
      ProjectItemSheetViewModel: ProjectItemSheetViewModel,
      ProjectHeaderViewModel: ProjectHeaderViewModel,
      ProjectContentViewModel: ProjectContentViewModel,
    },
    recipe: {
      RecipeItemSheetViewModel: RecipeItemSheetViewModel,
      RecipeHeaderViewModel: RecipeHeaderViewModel,
      RecipeContentViewModel: RecipeContentViewModel,
    },
    skill: {
      SkillItemSheetViewModel: SkillItemSheetViewModel,
      SkillHeaderViewModel: SkillHeaderViewModel,
      SkillContentViewModel: SkillContentViewModel,
    },
    trait: {
      TraitItemSheetViewModel: TraitItemSheetViewModel,
      TraitHeaderViewModel: TraitHeaderViewModel,
      TraitContentViewModel: TraitContentViewModel,
    },
  },
  sheet: {
    BaseItemSheet: BaseItemSheet,
    AssetItemSheet: AssetItemSheet,
    HealthConditionItemSheet: HealthConditionItemSheet,
    InjuryItemSheet: InjuryItemSheet,
    IllnessItemSheet: IllnessItemSheet,
    MutationItemSheet: MutationItemSheet,
    LanguageItemSheet: LanguageItemSheet,
    ProjectItemSheet: ProjectItemSheet,
    RecipeItemSheet: RecipeItemSheet,
    SkillItemSheet: SkillItemSheet,
    TraitItemSheet: TraitItemSheet,
  },
  Tooltip: Tooltip,
  TEMPLATES: TEMPLATES,
  /**
   * Ensures sheets are registered.
   */
  init: async () => {
    await TEMPLATES._preloadHandlebarsTemplates();
    component.init();
    dialog.init();
    // Register sheet application classes. 
    FoundryWrapper.registerSheet({
      registry: FoundryWrapper.collections.documents.items,
      type: ITEM_TYPES.asset,
      sheet: AssetItemSheet,
    });
    FoundryWrapper.registerSheet({
      registry: FoundryWrapper.collections.documents.items,
      type: ITEM_TYPES.health_condition,
      sheet: HealthConditionItemSheet,
    });
    FoundryWrapper.registerSheet({
      registry: FoundryWrapper.collections.documents.items,
      type: ITEM_TYPES.injury,
      sheet: InjuryItemSheet,
    });
    FoundryWrapper.registerSheet({
      registry: FoundryWrapper.collections.documents.items,
      type: ITEM_TYPES.illness,
      sheet: IllnessItemSheet,
    });
    FoundryWrapper.registerSheet({
      registry: FoundryWrapper.collections.documents.items,
      type: ITEM_TYPES.mutation,
      sheet: MutationItemSheet,
    });
    FoundryWrapper.registerSheet({
      registry: FoundryWrapper.collections.documents.items,
      type: ITEM_TYPES.language,
      sheet: LanguageItemSheet,
    });
    FoundryWrapper.registerSheet({
      registry: FoundryWrapper.collections.documents.items,
      type: ITEM_TYPES.project,
      sheet: ProjectItemSheet,
    });
    FoundryWrapper.registerSheet({
      registry: FoundryWrapper.collections.documents.items,
      type: ITEM_TYPES.recipe,
      sheet: RecipeItemSheet,
    });
    FoundryWrapper.registerSheet({
      registry: FoundryWrapper.collections.documents.items,
      type: ITEM_TYPES.skill,
      sheet: SkillItemSheet,
    });
    FoundryWrapper.registerSheet({
      registry: FoundryWrapper.collections.documents.items,
      type: ITEM_TYPES.trait,
      sheet: TraitItemSheet,
    });
  },
};
