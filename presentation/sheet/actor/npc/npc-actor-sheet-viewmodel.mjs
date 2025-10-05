import { ExtenderUtil } from "../../../../common/extender-util.mjs";
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs";
import InputImageViewModel from "../../../component/input-image/input-image-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import InputToggleViewModel from "../../../component/input-toggle/input-toggle-viewmodel.mjs";
import LazyLoadViewModel from "../../../component/lazy-load/lazy-load-viewmodel.mjs";
import GmNotesViewModel from "../../../component/section-gm-notes/section-gm-notes-viewmodel.mjs";
import Tooltip from "../../../component/tooltip/tooltip.mjs";
import DynamicInputDefinition from "../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import BaseSheetViewModel from "../../../view-model/base-sheet-viewmodel.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import ActorAbilitiesViewModel from "../part/abilities/actor-abilities-viewmodel.mjs";
import ActorActionPointsViewModel from "../part/action-points/actor-action-points-viewmodel.mjs";
import ActorBiographyViewModel from "../part/biography/actor-biography-viewmodel.mjs";
import ActorPersonalsViewModel from "../part/personals/actor-personals-viewmodel.mjs";
import ActorAssetsViewModel from "../part/assets/actor-assets-viewmodel.mjs";
import ActorHealthViewModel from "../part/health/actor-health-viewmodel.mjs";
import ActorPersonalityViewModel from "../part/personality/actor-personality-viewmodel.mjs";
import DynamicInputDialog from "../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";

export default class NpcActorSheetViewModel extends BaseSheetViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_NPC_SHEET; }

  /**
   * Returns the template path of the "personals" partial. 
   * 
   * @type {String}
   * @readonly
   */
  get templatePersonals() { return ActorPersonalsViewModel.TEMPLATE; }

  /**
   * @type {String}
   * @readonly
   */
  get templateActionPoints() { return ActorActionPointsViewModel.TEMPLATE; }

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

    // Aggressively clear out any lingering ToolTips. 
    Tooltip.removeAllToolTipElements();

    this.vmName = new InputTextFieldViewModel({
      parent: this,
      id: "vmName",
      value: this.document.name,
      onChange: (_, newValue) => {
        this.document.name = newValue;
      },
      placeholder: game.i18n.localize("system.general.name.label"),
    });
    this.vmImg = new InputImageViewModel({
      parent: this,
      id: "vmImg",
      value: this.document.img,
      onChange: (_, newValue) => {
        this.document.img = newValue;
      },
    });
    this.vmActionPoints = new ActorActionPointsViewModel({
      id: "vmActionPoints",
      parent: this,
      localizedToolTip: game.i18n.localize("system.actionPoint.plural"),
      document: this.document,
    });

    this.vmBtnConfigure = new ButtonViewModel({
      id: "vmBtnConfigure",
      parent: this,
      content: '<i class="fas fa-cog"></i>',
      localizedToolTip: game.i18n.localize("system.character.edit"),
      onClick: async () => {
        await this.promptConfigure();
      },
    });

    this.personalsViewModel = new ActorPersonalsViewModel({
      ...args,
      id: "personals",
      parent: this,
    });
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
  async activateListeners(html) {
    await super.activateListeners(html);

    const thiz = this;
    const tabs = html.find("nav.sheet-tabs > a");
    tabs.on("click", function (e) {
      const tab = $(e.currentTarget).data("tab");
      thiz._renderLazyTab(tab);
    });

    await this._renderActiveTab(html);
  }

  /** @override */
  dispose() {
    super.dispose();

    // An extremely aggressive band-aid solution. But, this ensures lingering tool tip elements 
    // with (at least partially) dynamic IDs are always cleared properly. 
    Tooltip.removeAllToolTipElements();
  }

  /**
   * Renders the contents of the active tab. 
   * 
   * @param {JQuery} html 
   * 
   * @private
   * @async
   */
  async _renderActiveTab(html) {
    const activeTab = html.find("nav.sheet-tabs > a.active");
    const tab = activeTab.data("tab");
    await this._renderLazyTab(tab);
    this.restoreScrollPosition();
  }

  /**
   * Renders the contents of the tab with the given "tab" dataset attribute. 
   * 
   * @param {String} tab The value of the "tab" dataset attribute 
   * of the tab to render. E. g. `"skills"`. 
   * 
   * @private
   * @async
   */
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

  /**
   * Opens the dialog to configure the meta data of the character. 
   * 
   * @async
   */
  async promptConfigure() {
    const inputMaxActionPoints = "inputMaxActionPoints";
    const inputRefillActionPoints = "inputRefillActionPoints";
    const inputAllowRefillActionPoints = "inputAllowRefillActionPoints";
    const inputInitiatives = "inputInitiatives";
    const inputEnablePersonality = "inputEnablePersonality";
    const inputEnableProgression = "inputEnableProgression";
    const inputEnableGritPoints = "inputEnableGritPoints";

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

    inputDefinitions.push(
      new DynamicInputDefinition({
        name: inputEnablePersonality,
        localizedLabel: game.i18n.localize("system.character.sheet.tab.personality"),
        template: InputToggleViewModel.TEMPLATE,
        viewModelFactory: (id, parent, overrides) => new InputToggleViewModel({
          id: id,
          parent: parent,
          value: this.document.personalityVisible,
          ...overrides,
        }),
      })
    );
    inputDefinitions.push(
      new DynamicInputDefinition({
        name: inputEnableProgression,
        localizedLabel: game.i18n.localize("system.character.advancement.label"),
        template: InputToggleViewModel.TEMPLATE,
        viewModelFactory: (id, parent, overrides) => new InputToggleViewModel({
          id: id,
          parent: parent,
          value: this.document.advancement.advancementEnabled,
          ...overrides,
        }),
      })
    );
    inputDefinitions.push(
      new DynamicInputDefinition({
        name: inputEnableGritPoints,
        localizedLabel: game.i18n.localize("system.character.gritPoint.toggleLabel"),
        template: InputToggleViewModel.TEMPLATE,
        viewModelFactory: (id, parent, overrides) => new InputToggleViewModel({
          id: id,
          parent: parent,
          value: this.document.gritPoints.enable,
          ...overrides,
        }),
      })
    );
    const dialog = await new DynamicInputDialog({
      localizedTitle: game.i18n.localize("system.character.edit"),
      inputDefinitions: inputDefinitions,
    }).renderAndAwait(true);

    if (dialog.confirmed !== true) return;

    this.document.actionPoints.maximum = parseInt(dialog[inputMaxActionPoints]);
    this.document.actionPoints.refill.amount = parseInt(dialog[inputRefillActionPoints]);
    this.document.actionPoints.refill.enable = dialog[inputAllowRefillActionPoints] == true;

    this.document.initiative.perTurn = Math.max(1, parseInt(dialog[inputInitiatives]));

    this.document.personalityVisible = dialog[inputEnablePersonality] == true;
    this.document.advancement.advancementEnabled = dialog[inputEnableProgression] == true;
    this.document.gritPoints.enable = dialog[inputEnableGritPoints] == true;
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(NpcActorSheetViewModel));
  }

}
