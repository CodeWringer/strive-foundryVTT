import { ExtenderUtil } from "../../../../common/extender-util.mjs";
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
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
import DynamicInputDialog from "../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import ActorProjectsViewModel from "../part/projects/actor-projects-viewmodel.mjs";
import CharacterActorSheetViewModel from "../character/character-actor-sheet-viewmodel.mjs";

export default class PcActorSheetViewModel extends CharacterActorSheetViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_PC_SHEET; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {TransientBaseActor} args.document The represented transient document instance. 
   * @param {GameSystemActorSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super(args);

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
  async promptConfigure() {
    const inputMaxActionPoints = "inputMaxActionPoints";
    const inputRefillActionPoints = "inputRefillActionPoints";
    const inputAllowRefillActionPoints = "inputAllowRefillActionPoints";
    const inputInitiatives = "inputInitiatives";

    const inputDefinitions = [
      new DynamicInputDefinition({
        name: inputMaxActionPoints,
        localizedLabel: game.i18n.localize("system.actionPoint.max"),
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModelFactory: (id, parent, overrides) => new InputNumberSpinnerViewModel({
          id: id,
          parent: parent,
          min: 0,
          value: this.document.actionPoints.maximum,
          ...overrides,
        }),
      }),
      new DynamicInputDefinition({
        name: inputRefillActionPoints,
        localizedLabel: game.i18n.localize("system.actionPoint.refill"),
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModelFactory: (id, parent, overrides) => new InputNumberSpinnerViewModel({
          id: id,
          parent: parent,
          min: 0,
          value: this.document.actionPoints.refill.amount,
          ...overrides,
        }),
      }),
      new DynamicInputDefinition({
        name: inputAllowRefillActionPoints,
        localizedLabel: game.i18n.localize("system.actionPoint.allowRefill"),
        template: InputToggleViewModel.TEMPLATE,
        viewModelFactory: (id, parent, overrides) => new InputToggleViewModel({
          id: id,
          parent: parent,
          value: this.document.actionPoints.refill.enable,
          ...overrides,
        }),
      }),
      new DynamicInputDefinition({
        name: inputInitiatives,
        localizedLabel: game.i18n.localize("system.character.attribute.initiative.numberPerRound"),
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModelFactory: (id, parent, overrides) => new InputNumberSpinnerViewModel({
          id: id,
          parent: parent,
          min: 1,
          value: this.document.initiative.perTurn,
          ...overrides,
        }),
      }),
    ];

    const dialog = await new DynamicInputDialog({
      localizedTitle: game.i18n.localize("system.character.edit"),
      inputDefinitions: inputDefinitions,
    }).renderAndAwait(true);

    if (dialog.confirmed !== true) return;

    this.document.actionPoints.maximum = parseInt(dialog[inputMaxActionPoints]);
    this.document.actionPoints.refill.amount = parseInt(dialog[inputRefillActionPoints]);
    this.document.actionPoints.refill.enable = dialog[inputAllowRefillActionPoints] == true;

    this.document.initiative.perTurn = Math.max(1, parseInt(dialog[inputInitiatives]));
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(PcActorSheetViewModel));
  }

}
