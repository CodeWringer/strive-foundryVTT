import { ExtenderUtil } from "../../../../common/extender-util.mjs";
import InputToggleViewModel from "../../../component/input-toggle/input-toggle-viewmodel.mjs";
import LazyLoadViewModel from "../../../component/lazy-load/lazy-load-viewmodel.mjs";
import GmNotesViewModel from "../../../component/section-gm-notes/section-gm-notes-viewmodel.mjs";
import DynamicInputDefinition from "../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import ActorAbilitiesViewModel from "../part/abilities/actor-abilities-viewmodel.mjs";
import ActorBiographyViewModel from "../part/biography/actor-biography-viewmodel.mjs";
import ActorAssetsViewModel from "../part/assets/actor-assets-viewmodel.mjs";
import ActorHealthViewModel from "../part/health/actor-health-viewmodel.mjs";
import ActorPersonalityViewModel from "../part/personality/actor-personality-viewmodel.mjs";
import SyntheticRollStrategy from "./synthetic-roll-strategy.mjs";
import CharacterActorSheetViewModel from "../character/character-actor-sheet-viewmodel.mjs";
import { ITEM_TYPES } from "../../../../business/document/item/item-types.mjs";
import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";
import { ATTRIBUTES } from "../../../../business/ruleset/attribute/attributes.mjs";
import TransientBaseCharacterActor from "../../../../business/document/actor/transient-base-character-actor.mjs";
import { StringUtil } from "../../../../business/util/string-utility.mjs";

export default class NpcActorSheetViewModel extends CharacterActorSheetViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_NPC_SHEET; }

  /**
   * Returns `true`, if the personality tab is to be shown. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get showPersonality() { return (this.document.personalityVisible ?? false); }

  /**
   * Returns `true`, if the biography tab is to be shown. 
   * 
   * This is only the case for NPCs for whom the personality tab has not been enabled. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get showBiography() { return !this.document.personalityVisible; }

  get showCrippledWarning() {
    const toughnessLevel = this.document.attributes.find(it => it.name === ATTRIBUTES.toughness.name).modifiedLevel;
    const injuryCount = this.document.health.injuries.length;

    return injuryCount > (toughnessLevel + 1);
  }

  get localizedCrippledWarning() {
    const injuryCount = this.document.health.injuries.length;
    const toughnessLevel = this.document.attributes.find(it => it.name === ATTRIBUTES.toughness.name).modifiedLevel;
    const obPenalty = injuryCount - (toughnessLevel + 1);
    return StringUtil.format2(game.i18n.localize("system.character.health.crippledWarning"), {
      injuryCount: injuryCount,
      obstacle: obPenalty,
      toughness: toughnessLevel,
    });
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {TransientBaseCharacterActor} args.document The represented transient document instance. 
   * @param {GameSystemActorSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super(args);

    if (this.showCrippledWarning) {
      const injuryCount = this.document.health.injuries.length;
      const toughnessLevel = this.document.attributes.find(it => it.name === ATTRIBUTES.toughness.name).modifiedLevel;
      const obPenalty = injuryCount - (toughnessLevel + 1);
      this.vmCrippledWarning = new ViewModel({
        id: "crippled-warning",
        parent: this,
        localizedToolTip: StringUtil.format2(game.i18n.localize("system.character.health.crippledWarningExplanation"), {
          injuryCount: injuryCount,
          obstacle: obPenalty,
          toughness: toughnessLevel,
        }),
      });
    }

    this.abilitiesViewModel = new LazyLoadViewModel({
      id: "lazyAbilities",
      parent: this,
      template: ActorAbilitiesViewModel.TEMPLATE,
      viewModelFactoryFunction: (args) => { return new ActorAbilitiesViewModel(args); },
      viewModelArgs: {
        ...args,
        id: "abilities",
      },
    });
    if (this.showPersonality === true) {
      this.personalityViewModel = new LazyLoadViewModel({
        id: "lazyPersonality",
        parent: this,
        template: ActorPersonalityViewModel.TEMPLATE,
        viewModelFactoryFunction: (args) => { return new ActorPersonalityViewModel(args); },
        viewModelArgs: {
          ...args,
          id: "drivers-fate",
        },
      });
    }
    this.healthViewModel = new LazyLoadViewModel({
      id: "lazyHealth",
      parent: this,
      template: ActorHealthViewModel.TEMPLATE,
      viewModelFactoryFunction: (args) => { return new ActorHealthViewModel(args); },
      viewModelArgs: {
        ...args,
        id: "health",
      },
    });
    this.assetsViewModel = new LazyLoadViewModel({
      id: "lazyAssets",
      parent: this,
      template: ActorAssetsViewModel.TEMPLATE,
      viewModelFactoryFunction: (args) => { return new ActorAssetsViewModel(args); },
      viewModelArgs: {
        ...args,
        id: "assets",
      },
    });
    if (this.showBiography) {
      this.biographyViewModel = new LazyLoadViewModel({
        id: "lazyBiography",
        parent: this,
        template: ActorBiographyViewModel.TEMPLATE,
        viewModelFactoryFunction: (args) => { return new ActorBiographyViewModel(args); },
        viewModelArgs: {
          ...args,
          id: "biography",
        },
      });
    }

    if (this.isGM === true) {
      this.gmNotesViewModel = new LazyLoadViewModel({
        id: "lazyGmNotes",
        parent: this,
        template: GmNotesViewModel.TEMPLATE,
        viewModelFactoryFunction: (args) => { return new GmNotesViewModel(args); },
        viewModelArgs: {
          ...args,
          id: "gmNotes",
          document: this.document,
        },
      });
    }
  }

  /** @override */
  async _renderLazyTab(tab) {
    if (tab === "abilities") {
      await this.abilitiesViewModel.render();
    } else if (tab === "drivers-fate") {
      await this.personalityViewModel.render();
    } else if (tab === "health") {
      await this.healthViewModel.render();
    } else if (tab === "assets") {
      await this.assetsViewModel.render();
    } else if (tab === "biography") {
      await this.biographyViewModel.render();
    } else if (tab === "gm-notes") {
      await this.gmNotesViewModel.render();
    }
  }

  /** @override */
  _getConfigurationInputs() {
    const inherited = super._getConfigurationInputs();
    return inherited.concat([
      new DynamicInputDefinition({
        name: "inputEnablePersonality",
        localizedLabel: game.i18n.localize("system.character.sheet.tab.personality"),
        template: InputToggleViewModel.TEMPLATE,
        viewModelFactory: (id, parent, overrides) => new InputToggleViewModel({
          id: id,
          parent: parent,
          value: this.document.personalityVisible,
          ...overrides,
        }),
      }),
      new DynamicInputDefinition({
        name: "inputEnableProgression",
        localizedLabel: game.i18n.localize("system.character.advancement.label"),
        template: InputToggleViewModel.TEMPLATE,
        viewModelFactory: (id, parent, overrides) => new InputToggleViewModel({
          id: id,
          parent: parent,
          value: this.document.advancement.advancementEnabled,
          ...overrides,
        }),
      }),
      new DynamicInputDefinition({
        name: "inputEnableGritPoints",
        localizedLabel: game.i18n.localize("system.character.gritPoint.toggleLabel"),
        template: InputToggleViewModel.TEMPLATE,
        viewModelFactory: (id, parent, overrides) => new InputToggleViewModel({
          id: id,
          parent: parent,
          value: this.document.gritPoints.enable,
          ...overrides,
        }),
      }),
    ]);
  }

  /** @override */
  async promptConfigure() {
    const dialog = await super.promptConfigure();

    if (!ValidationUtil.isDefined(dialog)) return;

    this.document.personalityVisible = dialog["inputEnablePersonality"] == true;
    this.document.advancement.advancementEnabled = dialog["inputEnableProgression"] == true;
    this.document.gritPoints.enable = dialog["inputEnableGritPoints"] == true;
  }

  /**
   * Opens the dialog to roll a synthetic Skill for the character. 
   * 
   * @async
   * @protected
   */
  async promptRollSynthetic() {
    new SyntheticRollStrategy({
      target: this.document,
    }).prompt();
  }

  /** @override */
  async onReceiveDroppedItem(data, overrides) {
    // No data - no reaction. This case can occur when an Item is dropped onto the actor sheet 
    // from any non-actor source, such as a compendium pack or the world collection. 
    if (!ValidationUtil.isDefined(data)) return;

    if (data.contentType === ITEM_TYPES.SKILL) {
      // For NPCs, ensure skills are always at least at level one. 
      overrides = {
        system: {
          level: 1,
        },
      };
    }
    await super.onReceiveDroppedItem(data, overrides);
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(NpcActorSheetViewModel));
  }

}
