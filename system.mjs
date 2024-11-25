// Root Globals
import { SYSTEM_ID } from "./system-id.mjs";
import { WorldSystemVersion } from "./business/migration/world-system-version.mjs";
// Handlebars
import { TEMPLATES, preloadHandlebarsTemplates } from "./presentation/templatePreloader.mjs";
import { initHandlebarsHelpers, initHandlebarsPartials } from "./presentation/handlebars-globals/handlebars-globals.mjs";
import { initHandlebarsComponents } from "./presentation/handlebars-globals/handlebars-components.mjs";
// Constants
import { Attribute, ATTRIBUTES } from "./business/ruleset/attribute/attributes.mjs";
import { DAMAGE_TYPES } from "./business/ruleset/damage-types.mjs";
import { ATTACK_TYPES } from "./business/ruleset/skill/attack-types.mjs";
import { SHIELD_TYPES } from "./business/ruleset/asset/shield-types.mjs";
import { ARMOR_TYPES } from "./business/ruleset/asset/armor-types.mjs";
import { WEAPON_TYPES } from "./business/ruleset/asset/weapon-types.mjs";
import { INJURY_STATES } from "./business/ruleset/health/injury-states.mjs";
import { ILLNESS_STATES } from "./business/ruleset/health/illness-states.mjs";
import { HEALTH_STATES } from "./business/ruleset/health/health-states.mjs";
import { CHARACTER_TEST_TYPES } from "./business/ruleset/test/character-test-types.mjs";
import { ASSET_TAGS, SKILL_TAGS } from "./business/tags/system-tags.mjs";
import { ACTOR_TYPES } from "./business/document/actor/actor-types.mjs";
import { ITEM_TYPES } from "./business/document/item/item-types.mjs";
// Ruleset
import Ruleset from "./business/ruleset/ruleset.mjs";
// Chat constants
import { VISIBILITY_MODES } from "./presentation/chat/visibility-modes.mjs";
// Utility
import ChoiceOption from "./presentation/component/input-choice/choice-option.mjs";
import DocumentFetcher from "./business/document/document-fetcher/document-fetcher.mjs";
import TokenExtensions from "./presentation/token/token-extensions.mjs";
import { ValidationUtil } from "./business/util/validation-utility.mjs";
import { ArrayUtil } from "./business/util/array-utility.mjs";
import { preloadPixiTextures } from "./presentation/pixi/pixi-preloader.mjs";
import CustomCombatTracker from "./presentation/combat/custom-combat-tracker.mjs";
import { KEYBOARD } from "./presentation/keyboard/keyboard.mjs";
import VersionCode from "./business/migration/version-code.mjs";
import DamageDesignerDialog from "./presentation/dialog/damage-designer-dialog/damage-designer-dialog.mjs";
import DicePoolDesignerDialog from "./presentation/dialog/dice-pool-designer-dialog/dice-pool-designer-dialog.mjs";
import { activateRollChatMessageListeners } from "./presentation/dice/roll-chat-message.mjs";
import { Sum, SumComponent } from "./business/ruleset/summed-data.mjs";
import Tag from "./business/tags/tag.mjs";
// Migration
import MigratorInitiator from "./business/migration/migrator-initiator.mjs";
import MigratorDialog from "./presentation/dialog/migrator-dialog/migrator-dialog.mjs";
import LoadDebugSettingUseCase from "./business/use-case/load-debug-setting-use-case.mjs";
// Dialogs
import PlainDialog from "./presentation/dialog/plain-dialog/plain-dialog.mjs";
import "./presentation/dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
// Document classes
import { GameSystemActor } from "./business/document/actor/actor.mjs";
import { GameSystemItem } from "./business/document/item/item.mjs";
import GameSystemCombat from "./presentation/combat/game-system-combat.mjs";
import GameSystemCombatant from "./presentation/combat/game-system-combatant.mjs";
import TransientBaseCharacterActor from "./business/document/actor/transient-base-character-actor.mjs";
import TransientBaseActor from "./business/document/actor/transient-base-actor.mjs";
import TransientNpc from "./business/document/actor/transient-npc.mjs";
import TransientPc from "./business/document/actor/transient-pc.mjs";
import TransientPlainActor from "./business/document/actor/transient-plain-actor.mjs";
import TransientSkill from "./business/document/item/skill/transient-skill.mjs";
import TransientAsset from "./business/document/item/transient-asset.mjs";
import TransientBaseItem from "./business/document/item/transient-base-item.mjs";
import TransientFateCard from "./business/document/item/transient-fate-card.mjs";
import TransientIllness from "./business/document/item/transient-illness.mjs";
import TransientInjury from "./business/document/item/transient-injury.mjs";
import TransientMutation from "./business/document/item/transient-mutation.mjs";
import TransientScar from "./business/document/item/transient-scar.mjs";
// Sheet classes
import { GameSystemActorSheet } from "./presentation/sheet/actor/actor-sheet.mjs";
import { GameSystemItemSheet } from "./presentation/sheet/item/item-sheet.mjs";
// Import logging classes
import { BaseLoggingStrategy, LogLevels } from "./business/logging/base-logging-strategy.mjs";
import { ConsoleLoggingStrategy } from "./business/logging/console-logging-strategy.mjs";
// Import settings classes
import GameSystemUserSettings from "./business/setting/game-system-user-settings.mjs";
import GameSystemWorldSettings from "./business/setting/game-system-world-settings.mjs";
// Import view models
import './presentation/view-model/view-model.mjs';
import ViewModelCollection from './presentation/view-model/view-model-collection.mjs';
// View models
import ViewModel from "./presentation/view-model/view-model.mjs";
// View models - Components
import InputNumberSpinnerViewModel from "./presentation/component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import ButtonAddViewModel from "./presentation/component/button-add/button-add-viewmodel.mjs";
import ButtonCheckBoxViewModel from "./presentation/component/button-checkbox/button-checkbox-viewmodel.mjs";
import ButtonContextMenuViewModel from "./presentation/component/button-context-menu/button-context-menu-viewmodel.mjs";
import ButtonDeleteViewModel from "./presentation/component/button-delete/button-delete-viewmodel.mjs";
import ButtonOpenSheetViewModel from "./presentation/component/button-open-sheet/button-open-sheet-viewmodel.mjs";
import VisibilityToggleListItemViewModel from "./presentation/component/visibility-toggle-list/visibility-toggle-list-item-viewmodel.mjs";
import VisibilityToggleListViewModel from "./presentation/component/visibility-toggle-list/visibility-toggle-list-viewmodel.mjs";
import SortableListViewModel from "./presentation/component/sortable-list/sortable-list-viewmodel.mjs";
import SortControlsViewModel from "./presentation/component/sort-controls/sort-controls-viewmodel.mjs";
import SimpleListItemViewModel from "./presentation/component/simple-list/simple-list-item-viewmodel.mjs";
import SimpleListViewModel from "./presentation/component/simple-list/simple-list-viewmodel.mjs";
import GmNotesViewModel from "./presentation/component/section-gm-notes/section-gm-notes-viewmodel.mjs";
import LazyRichTextViewModel from "./presentation/component/lazy-rich-text/lazy-rich-text-viewmodel.mjs";
import LazyLoadViewModel from "./presentation/component/lazy-load/lazy-load-viewmodel.mjs";
import InputToggleViewModel from "./presentation/component/input-toggle/input-toggle-viewmodel.mjs";
import InputTextareaViewModel from "./presentation/component/input-textarea/input-textarea-viewmodel.mjs";
import InputTextFieldViewModel from "./presentation/component/input-textfield/input-textfield-viewmodel.mjs";
import InputTagPillViewModel from "./presentation/component/input-tags/input-tag-pill-viewmodel.mjs";
import InputTagsViewModel from "./presentation/component/input-tags/input-tags-viewmodel.mjs";
import InputSliderViewModel from "./presentation/component/input-slider/input-slider-viewmodel.mjs";
import InputSearchTextViewModel from "./presentation/component/input-search/input-search-viewmodel.mjs";
import InputRichTextViewModel from "./presentation/component/input-rich-text/input-rich-text-viewmodel.mjs";
import InputImageViewModel from "./presentation/component/input-image/input-image-viewmodel.mjs";
import InputChoiceViewModel from "./presentation/component/input-choice/input-choice-viewmodel.mjs";
import DiceRollListViewModel from "./presentation/component/dice-roll-list/dice-roll-list-viewmodel.mjs";
import DamageDefinitionListItemViewModel from "./presentation/component/damage-definition-list/damage-definition-list-item-viewmodel.mjs";
import DamageDefinitionListViewModel from "./presentation/component/damage-definition-list/damage-definition-list-viewmodel.mjs";
import ButtonToggleVisibilityViewModel from "./presentation/component/button-toggle-visibility/button-toggle-visibility-viewmodel.mjs";
import ButtonToggleIconViewModel from "./presentation/component/button-toggle-icon/button-toggle-icon-viewmodel.mjs";
import ButtonTakeItemViewModel from "./presentation/component/button-take-item/button-take-item-viewmodel.mjs";
import ButtonSendToChatViewModel from "./presentation/component/button-send-to-chat/button-send-to-chat-viewmodel.mjs";
import ButtonRollViewModel from "./presentation/component/button-roll/button-roll-viewmodel.mjs";
// View models - Actor
import './presentation/sheet/actor/part/abilities/actor-attribute-table-viewmodel.mjs';
import ActorAttributesViewModel from "./presentation/sheet/actor/part/abilities/actor-attributes-viewmodel.mjs";
import './presentation/sheet/actor/part/personality/actor-drivers-viewmodel.mjs';
import './presentation/sheet/actor/part/actor-biography-viewmodel.mjs';
import ActorHealthViewModel from './presentation/sheet/actor/part/health/actor-health-viewmodel.mjs';
import ActorSkillsViewModel from "./presentation/sheet/actor/part/abilities/actor-skills-viewmodel.mjs";
import ActorAssetsViewModel from "./presentation/sheet/actor/part/assets/actor-assets-viewmodel.mjs";
import ActorPersonalityViewModel from "./presentation/sheet/actor/part/personality/actor-personality-viewmodel.mjs";
import ActorFateViewModel from "./presentation/sheet/actor/part/personality/actor-fate-viewmodel.mjs";
import ActorPersonalsViewModel from "./presentation/sheet/actor/part/actor-personals-viewmodel.mjs";
import ActorSheetViewModel from "./presentation/sheet/actor/actor-sheet-viewmodel.mjs";
// View models - Item
import AssetListItemViewModel from "./presentation/sheet/item/asset/asset-list-item-viewmodel.mjs";
import AssetItemSheetViewModel from "./presentation/sheet/item/asset/asset-item-sheet-viewmodel.mjs";
import BaseItemSheetViewModel from "./presentation/sheet/item/base/base-item-sheet-viewmodel.mjs";
import BaseListItemViewModel from "./presentation/sheet/item/base/base-list-item-viewmodel.mjs";
import ExpertiseListItemViewModel from "./presentation/sheet/item/expertise/expertise-list-item-viewmodel.mjs";
import FateCardViewModel from "./presentation/sheet/item/fate-card/fate-card-viewmodel.mjs";
import FateCardItemSheetViewModel from "./presentation/sheet/item/fate-card/fate-card-item-sheet-viewmodel.mjs";
import IllnessItemSheetViewModel from "./presentation/sheet/item/illness/illness-item-sheet-viewmodel.mjs";
import IllnessListItemViewModel from "./presentation/sheet/item/illness/illness-list-item-viewmodel.mjs";
import InjuryItemSheetViewModel from "./presentation/sheet/item/injury/injury-item-sheet-viewmodel.mjs";
import InjuryListItemViewModel from "./presentation/sheet/item/injury/injury-list-item-viewmodel.mjs";
import MutationItemSheetViewModel from "./presentation/sheet/item/mutation/mutation-item-sheet-viewmodel.mjs";
import MutationListItemViewModel from "./presentation/sheet/item/mutation/mutation-list-item-viewmodel.mjs";
import ScarItemSheetViewModel from "./presentation/sheet/item/scar/scar-item-sheet-viewmodel.mjs";
import ScarListItemViewModel from "./presentation/sheet/item/scar/scar-list-item-viewmodel.mjs";
import SkillItemSheetViewModel from "./presentation/sheet/item/skill/skill-item-sheet-viewmodel.mjs";
import SkillListItemViewModel from "./presentation/sheet/item/skill/skill-list-item-viewmodel.mjs";
import ReadOnlyValueViewModel from "./presentation/component/read-only-value/read-only-value.mjs";
import { StringUtil } from "./business/util/string-utility.mjs";
import { ConstantsUtil } from "./business/util/constants-utility.mjs";
import { PropertyUtil } from "./business/util/property-utility.mjs";
import { UuidUtil } from "./business/util/uuid-utility.mjs";

/* -------------------------------------------- */
/*  Initialization                              */
/* -------------------------------------------- */

Hooks.once('init', function() {
  // Register globals. 
  window.DocumentFetcher = DocumentFetcher;

  // Add system specific logic to global namespace. 
  game.strive = {
    /**
     * 
     * @type {BaseLoggingStrategy}
     */
    logger: new ConsoleLoggingStrategy(LogLevels.ERROR),
    /**
     * @type {Boolean}
     * @private
     */
    _debug: false,
    /**
     * @type {Boolean}
     */
    get debug() { return this._debug },
    /**
     * @param {Boolean} value
     */
    set debug(value) {
      this._debug = value;
      if (value === true) {
        this.logger = new ConsoleLoggingStrategy(LogLevels.VERBOSE);
      }
    },
    /**
     * If `true`, view model caching is enabled. 
     * 
     * If `false`, view models will be re-instantiated every time a sheet is rendered or 
     * an underlying document updated. 
     * 
     * @type {Boolean}
     */
    enableViewModelCaching: false,
    /**
     * The global collection of view models. 
     * 
     * Any newly instantiated view models will be added to this list. Then, during their activateListeners-call, 
     * they'll pull (remove) themselves from this list and add themselves to their corresponding owner. 
     * An owner could be an {ActorSheet} or {ItemSheet}. 
     * @type {ViewModelCollection}
     */
    viewModels: new ViewModelCollection(),
    /**
     * The global view states map. 
     * 
     * @type {Map<String, Object>}
     */
    viewStates: new Map(),
    /**
     * Contains const definitions for use in modules that wish to extend the strive system. 
     * 
     * @type {Object}
     */
    const: {
      ATTRIBUTES: ATTRIBUTES,
      ACTOR_TYPES: ACTOR_TYPES,
      ITEM_TYPES: ITEM_TYPES,
      TEMPLATES: TEMPLATES,
      ASSET_TAGS: ASSET_TAGS,
      SKILL_TAGS: SKILL_TAGS,
      DAMAGE_TYPES: DAMAGE_TYPES,
      ATTACK_TYPES: ATTACK_TYPES,
      SHIELD_TYPES: SHIELD_TYPES,
      ARMOR_TYPES: ARMOR_TYPES,
      WEAPON_TYPES: WEAPON_TYPES,
      INJURY_STATES: INJURY_STATES,
      ILLNESS_STATES: ILLNESS_STATES,
      HEALTH_STATES: HEALTH_STATES,
      CHARACTER_TEST_TYPES: CHARACTER_TEST_TYPES,
      VISIBILITY_MODES: VISIBILITY_MODES,
    },
    /**
     * Contains class definitions for use in modules that wish to extend the strive system. 
     * 
     * @type {Object}
     */
    classDef: {
      Attribute: Attribute,
      ChoiceOption: ChoiceOption,
      SumComponent: SumComponent,
      Sum: Sum,
      Ruleset: Ruleset,
      Tag: Tag,
      document: {
        TransientBaseActor: TransientBaseActor,
        TransientBaseCharacterActor: TransientBaseCharacterActor,
        TransientNpc: TransientNpc,
        TransientPc: TransientPc,
        TransientPlainActor: TransientPlainActor,
        TransientBaseItem: TransientBaseItem,
        TransientSkill: TransientSkill,
        TransientAsset: TransientAsset,
        TransientFateCard: TransientFateCard,
        TransientIllness: TransientIllness,
        TransientInjury: TransientInjury,
        TransientMutation: TransientMutation,
        TransientScar: TransientScar,
      },
      viewModel: {
        ViewModel: ViewModel,
        ButtonAddViewModel: ButtonAddViewModel,
        ButtonCheckBoxViewModel: ButtonCheckBoxViewModel,
        ButtonContextMenuViewModel: ButtonContextMenuViewModel,
        ButtonDeleteViewModel: ButtonDeleteViewModel,
        ButtonOpenSheetViewModel: ButtonOpenSheetViewModel,
        ButtonRollViewModel: ButtonRollViewModel,
        ButtonSendToChatViewModel: ButtonSendToChatViewModel,
        ButtonTakeItemViewModel: ButtonTakeItemViewModel,
        ButtonToggleIconViewModel: ButtonToggleIconViewModel,
        ButtonToggleVisibilityViewModel: ButtonToggleVisibilityViewModel,
        DamageDefinitionListViewModel: DamageDefinitionListViewModel,
        DamageDefinitionListItemViewModel: DamageDefinitionListItemViewModel,
        DiceRollListViewModel: DiceRollListViewModel,
        InputChoiceViewModel: InputChoiceViewModel,
        InputImageViewModel: InputImageViewModel,
        InputRichTextViewModel: InputRichTextViewModel,
        InputSearchTextViewModel: InputSearchTextViewModel,
        InputSliderViewModel: InputSliderViewModel,
        InputTagsViewModel: InputTagsViewModel,
        InputTagPillViewModel: InputTagPillViewModel,
        InputTextareaViewModel: InputTextareaViewModel,
        InputTextFieldViewModel: InputTextFieldViewModel,
        InputToggleViewModel: InputToggleViewModel,
        LazyLoadViewModel: LazyLoadViewModel,
        LazyRichTextViewModel: LazyRichTextViewModel,
        GmNotesViewModel: GmNotesViewModel,
        SimpleListViewModel: SimpleListViewModel,
        SimpleListItemViewModel: SimpleListItemViewModel,
        SortControlsViewModel: SortControlsViewModel,
        SortableListViewModel: SortableListViewModel,
        VisibilityToggleListViewModel: VisibilityToggleListViewModel,
        VisibilityToggleListItemViewModel: VisibilityToggleListItemViewModel,
        InputNumberSpinnerViewModel: InputNumberSpinnerViewModel,
        ReadOnlyValueViewModel: ReadOnlyValueViewModel,
        actor: {
          ActorAttributesViewModel: ActorAttributesViewModel,
          ActorSkillsViewModel: ActorSkillsViewModel,
          ActorAssetsViewModel: ActorAssetsViewModel,
          ActorHealthViewModel: ActorHealthViewModel,
          ActorPersonalityViewModel: ActorPersonalityViewModel,
          ActorFateViewModel: ActorFateViewModel,
          ActorPersonalsViewModel: ActorPersonalsViewModel,
          ActorSheetViewModel: ActorSheetViewModel,
        },
        item: {
          AssetListItemViewModel: AssetListItemViewModel,
          AssetItemSheetViewModel: AssetItemSheetViewModel,
          BaseItemSheetViewModel: BaseItemSheetViewModel,
          BaseListItemViewModel: BaseListItemViewModel,
          ExpertiseListItemViewModel: ExpertiseListItemViewModel,
          FateCardViewModel: FateCardViewModel,
          FateCardItemSheetViewModel: FateCardItemSheetViewModel,
          IllnessItemSheetViewModel: IllnessItemSheetViewModel,
          IllnessListItemViewModel: IllnessListItemViewModel,
          InjuryItemSheetViewModel: InjuryItemSheetViewModel,
          InjuryListItemViewModel: InjuryListItemViewModel,
          MutationItemSheetViewModel: MutationItemSheetViewModel,
          MutationListItemViewModel: MutationListItemViewModel,
          ScarItemSheetViewModel: ScarItemSheetViewModel,
          ScarListItemViewModel: ScarListItemViewModel,
          SkillItemSheetViewModel: SkillItemSheetViewModel,
          SkillListItemViewModel: SkillListItemViewModel,
        },
      },
    },
    util: {
      array: ArrayUtil,
      constants: ConstantsUtil,
      property: PropertyUtil,
      string: StringUtil,
      uuid: UuidUtil,
      validation: ValidationUtil,
    },
    /**
     * Registered extenders. 
     * 
     * @type {Map<any, Array<Object>>}
     */
    extenders: new Map(),
  };

  // Set initiative formula on global CONFIG variable provided by FoundryVTT.
  CONFIG.Combat.initiative = {
    formula: "1D20 + @baseInitiative",
    decimals: 0
  };

  // Override document classes. 
  CONFIG.Actor.documentClass = GameSystemActor;
  CONFIG.Item.documentClass = GameSystemItem;
  CONFIG.Combat.documentClass = GameSystemCombat;
  CONFIG.Combatant.documentClass = GameSystemCombatant;

  // Override combat tracker. 
  CONFIG.ui.combat = CustomCombatTracker;

  // Register sheet application classes. 
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet(SYSTEM_ID, GameSystemActorSheet, { makeDefault: true });
  
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet(SYSTEM_ID, GameSystemItemSheet, { makeDefault: true });

  // Preload PIXI textures. 
  preloadPixiTextures();
  
  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

Hooks.once('setup', function() {
  // Register custom fonts.
  CONFIG.fontDefinitions["BlackChancery"] = {
    editor: true,
    fonts: [
      { urls: ["systems/strive/presentation/font/BLKCHCRY.TTF"] },
    ]
  };

  // Initialize global Handlebars helpers and partials.
  initHandlebarsHelpers();
  initHandlebarsPartials();
  // Initialize component Handlebars partials. 
  initHandlebarsComponents();
});

Hooks.once("ready", function() {
  // Settings initialization.
  new GameSystemUserSettings().ensureAllSettings();
  new GameSystemWorldSettings().ensureAllSettings();

  // Debug mode setting. 
  game.strive.debug = new LoadDebugSettingUseCase().invoke();

  // Global event handling setup.
  KEYBOARD.init();

  // Migration check. 
  const migrator = new MigratorInitiator();
  
  if (migrator.isApplicable() === true) {
    if (game.user.isGM === true) {
      new MigratorDialog().render(true);
    } else {
      // Display warning to non-GM. 
      new PlainDialog({
        localizedTitle: game.i18n.localize("system.migration.titleMigrationRequired"),
        localizedContent: game.i18n.localize("system.migration.migrationRequiredUserWarning"),
      }).render(true);
    }
  } else {
    game.strive.logger.logVerbose("Version up to date - skipping migrations");
    // Ensure the current system version is saved. 
    WorldSystemVersion.set(migrator.finalMigrationVersion);
  }

  if (game.strive.debug) {
    window.runMigration = async function(fromVersion) {
      // Fake world system version. Without this, migrators might not run. 
      const fakeVersion = VersionCode.fromString(fromVersion);
      await WorldSystemVersion.set(fakeVersion);
      
      new MigratorDialog().render(true);
    };

    window.DicePoolDesignerDialog = DicePoolDesignerDialog;
    window.DamageDesignerDialog = DamageDesignerDialog;
  }
});

/* -------------------------------------------- */
/*  Other Hooks                                 */
/* -------------------------------------------- */

Hooks.on("renderChatMessage", async function(message, html, data) {
  const SELECTOR_CHAT_MESSAGE = "custom-system-chat-message";
  const element = html.find(`.${SELECTOR_CHAT_MESSAGE}`)[0];
  
  // The chat message may just be a normal chat message, without any associated document. 
  // In such a case it is safe to skip any further operations, here. 
  if (element === undefined || element === null) return;

  activateRollChatMessageListeners(element);

  // Get data set of element. This assumes the element in question to have the following data defined:
  // 'data-view-model-id' and 'data-document-id'
  const dataset = element.dataset;
  const vmId = dataset.viewModelId;
  const documentId = dataset.documentId;

  if (documentId === undefined) {
    return;
  }

  const document = await new DocumentFetcher().find({
    id: documentId,
    searchEmbedded: true,
    includeLocked: true,
  });

  if (document === undefined) {
    game.strive.logger.logWarn(`renderChatMessage: Failed to get document represented by chat message`);
    return;
  }
  
  let viewModel = game.strive.viewModels.get(vmId);
  if (viewModel === undefined) {
    // Create new instance of a view model to associate with the chat message. 
    if (dataset.expertiseId !== undefined) {
      // Create an expertise chat view model. 
      const expertiseId = dataset.expertiseId;
      const skillDocument = document.getTransientObject();
      const expertise = skillDocument.expertises.find(it => it.id === expertiseId);
      viewModel = expertise.getChatViewModel({ id: vmId });
    } else {
      viewModel = document.getTransientObject().getChatViewModel({ id: vmId });
    }

    if (viewModel === undefined) {
      game.strive.logger.logWarn(`renderChatMessage: Failed to create view model for chat message`);
      return;
    }
    // Ensure the view model is stored in the global collection. 
    if (game.strive.enableViewModelCaching === true) {
      game.strive.viewModels.set(vmId, viewModel);
    }
  }

  await viewModel.activateListeners(html);
});

Hooks.on("deleteChatMessage", function(args) {
  const deletedContent = args.content;
  const rgxViewModelId = /data-view-model-id="([^"]*)"/;
  const match = deletedContent.match(rgxViewModelId);

  if (match !== undefined && match !== null && match.length === 2) {
    const vmId = match[1];

    // Dispose the view model, if it supports it. 
    const vm = game.strive.viewModels.get(vmId);

    if (vm === undefined) return;

    if (vm.dispose !== undefined) {
      try {
        vm.dispose();
      } catch (error) {
        // It may already be disposed, in which case it might throw an error. 
        // Of course, if it is already disposed, the error isn't actually a problem. 
        game.strive.logger.logVerbose(error);
      }
    }

    // Remove the view model from the global collection. 
    game.strive.viewModels.remove(vmId);
  }
});

Hooks.on("hoverToken", function(token) {
  TokenExtensions.updateTokenHover(token);
});

Hooks.on("drawToken", function(token) {
  TokenExtensions.updateTokenCombatant(token);
});

Hooks.on("refreshToken", function(token) {
  TokenExtensions.updateTokenHover(token);
  TokenExtensions.updateTokenCombatant(token);
});

Hooks.on("updateToken", function(document, change, options, userId) {
  TokenExtensions.updateTokenHover(document.object);
  TokenExtensions.updateTokenCombatant(document.object);
});

Hooks.on("updateActor", function(document, change, options, userId) {
  ui.combat?.render();
});

Hooks.on("createCombatant", function(document, options, userId) {
  TokenExtensions.updateTokenCombatant(document.token.object);
});

Hooks.on("renderCombatTracker", function(document, options, userId) {
  TokenExtensions.updateTokenCombatants();
});
