import LazyLoadViewModel from "../../component/lazy-load/lazy-load-viewmodel.mjs"
import GmNotesViewModel from "../../component/section-gm-notes/section-gm-notes-viewmodel.mjs"
import ViewModel from "../../view-model/view-model.mjs"
import ActorAssetsViewModel from "./part/assets/actor-assets-viewmodel.mjs"
import ActorAttributesViewModel from "./part/abilities/actor-attributes-viewmodel.mjs"
import ActorSkillsViewModel from "./part/abilities/actor-skills-viewmodel.mjs"
import ActorPersonalityViewModel from "./part/personality/actor-personality-viewmodel.mjs"
import ActorBiographyViewModel from "./part/actor-biography-viewmodel.mjs"
import ActorHealthViewModel from "./part/health/actor-health-viewmodel.mjs"
import ActorPersonalsViewModel from "./part/actor-personals-viewmodel.mjs"
import BaseSheetViewModel from "../../view-model/base-sheet-viewmodel.mjs"
import InputImageViewModel from "../../component/input-image/input-image-viewmodel.mjs"
import InputRichTextViewModel from "../../component/input-rich-text/input-rich-text-viewmodel.mjs"
import InputTextFieldViewModel from "../../component/input-textfield/input-textfield-viewmodel.mjs"
import ButtonSendToChatViewModel from "../../component/button-send-to-chat/button-send-to-chat-viewmodel.mjs"
import ButtonViewModel from "../../component/button/button-viewmodel.mjs"
import DynamicInputDialog from "../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs"
import DynamicInputDefinition from "../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs"
import { DYNAMIC_INPUT_TYPES } from "../../dialog/dynamic-input-dialog/dynamic-input-types.mjs"
import { ACTOR_TYPES } from "../../../business/document/actor/actor-types.mjs"
import TransientBaseActor from "../../../business/document/actor/transient-base-actor.mjs"
import { ExtenderUtil } from "../../../common/extender-util.mjs"
import RulesetExplainer from "../../../business/ruleset/ruleset-explainer.mjs"
import ReadOnlyValueViewModel from "../../component/read-only-value/read-only-value.mjs"
import Tooltip from "../../component/tooltip/tooltip.mjs"

/**
 * @extends BaseSheetViewModel
 * 
 * @property {ViewModel} personalsViewModel
 * @property {LazyLoadViewModel} attributesViewModel
 * @property {LazyLoadViewModel} skillsViewModel
 * @property {LazyLoadViewModel} personalityViewModel
 * @property {LazyLoadViewModel} healthViewModel
 * @property {LazyLoadViewModel} assetsViewModel
 * @property {LazyLoadViewModel} biographyViewModel
 * @property {LazyLoadViewModel} gmNotesViewModel
*/
export default class ActorSheetViewModel extends BaseSheetViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_SHEET; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * Returns true, if the actor is a player character. 
   * 
   * @type {Boolean}
   */
  get isPC() { return this.document.type === ACTOR_TYPES.PC; }
  
  /**
   * Returns true, if the actor is a non-player character. 
   * 
   * @type {Boolean}
   */
  get isNPC() { return this.document.type === ACTOR_TYPES.NPC; }

  /**
   * Returns true, if the actor is a plain actor. 
   * 
   * @type {Boolean}
   */
  get isPlain() { return this.document.type === ACTOR_TYPES.PLAIN; }

  /**
   * Returns true, if the navigation is to be shown. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get showNavigation() { return this.isPlain === false || this.isGM === true }

  /**
   * Returns the template path of the "personals" partial. 
   * 
   * @type {String}
   * @readonly
   */
  get templatePersonals() { return game.strive.const.TEMPLATES.ACTOR_PERSONALS; }
  
  /**
   * Returns the CSS class for use in the context menu. 
   * 
   * @type {String}
   * @readonly
   */
  get contextMenuClass() { return this.isNPC ? "" : "hidden"; };

  /**
   * Returns `true`, if the personality tab is to be shown. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get showPersonality() { return (this.isPC || (this.document.personalityVisible ?? false)); }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * @param {TransientBaseActor} args.document The represented transient document instance. 
   * @param {ActorSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super(args);

    this.contextTemplate = args.contextTemplate ?? "actor-character-sheet";

    const thiz = this;

    this.vmTfName = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTfName",
      value: thiz.document.name,
      onChange: (_, newValue) => {
        thiz.document.name = newValue;
      },
      placeholder: game.i18n.localize("system.general.name.label"),
    });
    this.vmImg = new InputImageViewModel({
      parent: thiz,
      id: "vmImg",
      value: thiz.document.img,
      onChange: (_, newValue) => {
        thiz.document.img = newValue;
      },
    });
    if (this.isNPC || this.isPC) {
      this.vmBaseInitiative = new ReadOnlyValueViewModel({
        id: "vmBaseInitiative",
        parent: this,
        value: this.document.baseInitiative,
        localizedToolTip: new RulesetExplainer().getExplanationForBaseInitiative(this.document),
      });
      
      this.vmBtnConfigure = new ButtonViewModel({
        id: "vmBtnConfigure",
        parent: this,
        iconHtml: '<i class="fas fa-cog"></i>',
        localizedToolTip: game.i18n.localize("system.character.edit"),
        onClick: async () => {
          const inputMaxActionPoints = "inputMaxActionPoints";
          const inputRefillActionPoints = "inputRefillActionPoints";
          const inputAllowRefillActionPoints = "inputAllowRefillActionPoints";
          const inputInitiatives = "inputInitiatives";
          const inputEnablePersonality = "inputEnablePersonality";
          const inputEnableProgression = "inputEnableProgression";
          const inputEnableGritPoints = "inputEnableGritPoints";

          const inputDefinitions = [
            new DynamicInputDefinition({
              type: DYNAMIC_INPUT_TYPES.NUMBER_SPINNER,
              name: inputMaxActionPoints,
              localizedLabel: game.i18n.localize("system.actionPoint.max"),
              specificArgs: {
                min: 0,
              },
              defaultValue: this.document.actionPoints.maximum,
            }),
            new DynamicInputDefinition({
              type: DYNAMIC_INPUT_TYPES.NUMBER_SPINNER,
              name: inputRefillActionPoints,
              localizedLabel: game.i18n.localize("system.actionPoint.refill"),
              specificArgs: {
                min: 0,
              },
              defaultValue: this.document.actionPoints.refill.amount,
            }),
            new DynamicInputDefinition({
              type: DYNAMIC_INPUT_TYPES.TOGGLE,
              name: inputAllowRefillActionPoints,
              localizedLabel: game.i18n.localize("system.actionPoint.allowRefill"),
              defaultValue: this.document.actionPoints.refill.enable,
            }),
            new DynamicInputDefinition({
              type: DYNAMIC_INPUT_TYPES.NUMBER_SPINNER,
              name: inputInitiatives,
              localizedLabel: game.i18n.localize("system.character.attribute.initiative.numberPerRound"),
              specificArgs: {
                min: 1,
              },
              defaultValue: this.document.initiative.perTurn,
            }),
          ];

          if (this.isNPC) {
            inputDefinitions.push(
              new DynamicInputDefinition({
                type: DYNAMIC_INPUT_TYPES.TOGGLE,
                name: inputEnablePersonality,
                localizedLabel: game.i18n.localize("system.character.sheet.tab.personality"),
                defaultValue: this.document.personalityVisible,
              })
            );
            inputDefinitions.push(
              new DynamicInputDefinition({
                type: DYNAMIC_INPUT_TYPES.TOGGLE,
                name: inputEnableProgression,
                localizedLabel: game.i18n.localize("system.character.advancement.label"),
                defaultValue: this.document.progressionVisible,
              })
            );
            inputDefinitions.push(
              new DynamicInputDefinition({
                type: DYNAMIC_INPUT_TYPES.TOGGLE,
                name: inputEnableGritPoints,
                localizedLabel: game.i18n.localize("system.character.gritPoint.toggleLabel"),
                defaultValue: this.document.gritPoints.enable,
              })
            );
          }
          const dialog = await new DynamicInputDialog({
            localizedTitle: game.i18n.localize("system.character.edit"),
            inputDefinitions: inputDefinitions,
          }).renderAndAwait(true);
  
          if (dialog.confirmed !== true) return;
  
          this.document.actionPoints.maximum = parseInt(dialog[inputMaxActionPoints]);
          this.document.actionPoints.refill.amount = parseInt(dialog[inputRefillActionPoints]);
          this.document.actionPoints.refill.enable = dialog[inputAllowRefillActionPoints] == true;

          this.document.initiative.perTurn = Math.max(1, parseInt(dialog[inputInitiatives]));

          if (this.isNPC) {
            this.document.personalityVisible = dialog[inputEnablePersonality] == true;
            this.document.progressionVisible = dialog[inputEnableProgression] == true;
            this.document.gritPoints.enable = dialog[inputEnableGritPoints] == true;
          }
        },
      });
    }
    this.vmBtnSendToChat = new ButtonSendToChatViewModel({
      parent: this,
      id: "vmBtnSendToChat",
      target: thiz.document,
      isEditable: thiz.isEditable || thiz.isGM,
    });

    if (this.isPlain !== true) {
      this.personalsViewModel = new ActorPersonalsViewModel({ 
        ...args, 
        id: "personals", 
        parent: thiz 
      });
      this.attributesViewModel = new LazyLoadViewModel({
        id: "lazyAttributes",
        parent: thiz,
        template: game.strive.const.TEMPLATES.ACTOR_ATTRIBUTES,
        viewModelFactoryFunction: (args) => { return new ActorAttributesViewModel(args); },
        viewModelArgs: {
          ...args, 
          id: "attributes", 
        },
      });
      this.skillsViewModel = new LazyLoadViewModel({
        id: "lazySkills",
        parent: thiz,
        template: game.strive.const.TEMPLATES.ACTOR_SKILLS,
        viewModelFactoryFunction: (args) => { return new ActorSkillsViewModel(args); },
        viewModelArgs: {
          ...args, 
          id: "skills", 
        },
      });
      if (this.showPersonality === true) {
        this.personalityViewModel = new LazyLoadViewModel({
          id: "lazyPersonality",
          parent: thiz,
          template: game.strive.const.TEMPLATES.ACTOR_PERSONALITY,
          viewModelFactoryFunction: (args) => { return new ActorPersonalityViewModel(args); },
          viewModelArgs: {
            ...args, 
            id: "drivers-fate", 
          },
        });
      }
      this.healthViewModel = new LazyLoadViewModel({
        id: "lazyHealth",
        parent: thiz,
        template: game.strive.const.TEMPLATES.ACTOR_HEALTH,
        viewModelFactoryFunction: (args) => { return new ActorHealthViewModel(args); },
        viewModelArgs: {
          ...args, 
          id: "health", 
        },
      });
      this.assetsViewModel = new LazyLoadViewModel({
        id: "lazyAssets",
        parent: thiz,
        template: game.strive.const.TEMPLATES.ACTOR_ASSETS,
        viewModelFactoryFunction: (args) => { return new ActorAssetsViewModel(args); },
        viewModelArgs: {
          ...args, 
          id: "assets", 
        },
      });
      this.biographyViewModel = new LazyLoadViewModel({
        id: "lazyBiography",
        parent: thiz,
        template: game.strive.const.TEMPLATES.ACTOR_BIOGRAPHY,
        viewModelFactoryFunction: (args) => { return new ActorBiographyViewModel(args); },
        viewModelArgs: {
          ...args, 
          id: "biography", 
        },
      });
    } else {
      this.vmRtDescription = new InputRichTextViewModel({
        id: "vmRtDescription",
        parent: thiz,
        value: thiz.document.description,
        onChange: (_, newValue) => {
          thiz.document.description = newValue;
        },
      });
    }
    
    if (this.isGM === true) {
      this.gmNotesViewModel = new LazyLoadViewModel({
        id: "lazyGmNotes",
        parent: thiz,
        template: game.strive.const.TEMPLATES.COMPONENT_GM_NOTES,
        viewModelFactoryFunction: (args) => { return new GmNotesViewModel(args); },
        viewModelArgs: {
          ...args, 
          id: "gmNotes", 
          document: thiz.document, 
        },
      });
    }
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    const thiz = this;
    const tabs = html.find("nav.sheet-tabs > a");
    tabs.on("click", function(e) {
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

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmBtnSendToChat, {
      ...updates.get(this.vmBtnSendToChat),
      isEditable: this.isEditable || this.isGM,
    });

    return updates;
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
      await this.attributesViewModel.render();
      await this.skillsViewModel.render();
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
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(ActorSheetViewModel));
  }

}
