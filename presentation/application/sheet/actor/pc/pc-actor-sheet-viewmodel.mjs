import { ATTRIBUTES } from "../../../../business/model/const/attributes.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ExtenderUtil } from "../../../../common/util/extender-util.mjs";
import LazyLoadViewModel from "../../../component/lazy-load/lazy-load-viewmodel.mjs";
import GmNotesViewModel from "../../../component/section-gm-notes/section-gm-notes-viewmodel.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import ActorAbilitiesViewModel from "../part/abilities/actor-abilities-viewmodel.mjs";
import ActorBiographyViewModel from "../part/biography/actor-biography-viewmodel.mjs";
import ActorAssetsViewModel from "../part/assets/actor-assets-viewmodel.mjs";
import ActorHealthViewModel from "../part/health/actor-health-viewmodel.mjs";
import ActorPersonalityViewModel from "../part/personality/actor-personality-viewmodel.mjs";
import ActorProjectsViewModel from "../part/projects/actor-projects-viewmodel.mjs";
import CharacterActorSheetViewModel from "../character/character-actor-sheet-viewmodel.mjs";
import TransientBaseCharacterActor from "../../../../business/model/document/actor/transient-base-character-actor.mjs";

export default class PcActorSheetViewModel extends CharacterActorSheetViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_PC_SHEET; }

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
    this.projectsViewModel = new LazyLoadViewModel({
      id: "lazyProjects",
      parent: this,
      template: ActorProjectsViewModel.TEMPLATE,
      viewModelFactoryFunction: (args) => { return new ActorProjectsViewModel(args); },
      viewModelArgs: {
        ...args,
        id: "projects",
      },
    });

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
    } else if (tab === "projects") {
      await this.projectsViewModel.render();
    }
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(PcActorSheetViewModel));
  }

}
