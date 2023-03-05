import LazyLoadViewModel from "../../component/lazy-load/lazy-load-viewmodel.mjs"
import GmNotesViewModel from "../../component/section-gm-notes/section-gm-notes-viewmodel.mjs"
import { TEMPLATES } from "../../templatePreloader.mjs"
import ViewModelFactory from "../../view-model/view-model-factory.mjs"
import ViewModel from "../../view-model/view-model.mjs"
import ActorAssetsViewModel from "./part/assets/actor-assets-viewmodel.mjs"
import ActorAttributesViewModel from "./part/abilities/actor-attributes-viewmodel.mjs"
import ActorSkillsViewModel from "./part/abilities/actor-skills-viewmodel.mjs"
import ActorPersonalityViewModel from "./part/personality/actor-personality-viewmodel.mjs"
import ActorBiographyViewModel from "./part/actor-biography-viewmodel.mjs"
import ActorHealthViewModel from "./part/health/actor-health-viewmodel.mjs"
import ActorPersonalsViewModel from "./part/actor-personals-viewmodel.mjs"
import BaseSheetViewModel from "../../view-model/base-sheet-viewmodel.mjs"

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
  static get TEMPLATE() { return TEMPLATES.ACTOR_SHEET; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * Returns true, if the actor is a player character. 
   * 
   * @type {Boolean}
   */
  get isPC() { return this.document.type === "pc"; }
  
  /**
   * Returns true, if the actor is a non-player character. 
   * 
   * @type {Boolean}
   */
  get isNPC() { return this.document.type === "npc"; }

  /**
   * Returns true, if the actor is a plain actor. 
   * 
   * @type {Boolean}
   */
  get isPlain() { return this.document.type === "plain"; }

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
  get templatePersonals() { return TEMPLATES.ACTOR_PERSONALS; }

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
   * @param {TransientBaseactor} args.document The represented transient document instance. 
   * @param {ActorSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super(args);

    this.contextTemplate = args.contextTemplate ?? "actor-character-sheet";

    const thiz = this;
    const factory = new ViewModelFactory();

    this.vmTfName = factory.createVmTextField({
      parent: thiz,
      id: "vmTfName",
      propertyOwner: thiz.document,
      propertyPath: "name",
      placeholder: "ambersteel.general.name",
    });
    this.vmImg = factory.createVmImg({
      parent: thiz,
      id: "vmImg",
      propertyOwner: thiz.document,
      propertyPath: "img",
    });
    this.vmBtnSendToChat = factory.createVmBtnSendToChat({
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
        template: TEMPLATES.ACTOR_ATTRIBUTES,
        viewModelFactoryFunction: (args) => { return new ActorAttributesViewModel(args); },
        viewModelArgs: {
          ...args, 
          id: "attributes", 
        },
      });
      this.skillsViewModel = new LazyLoadViewModel({
        id: "lazySkills",
        parent: thiz,
        template: TEMPLATES.ACTOR_SKILLS,
        viewModelFactoryFunction: (args) => { return new ActorSkillsViewModel(args); },
        viewModelArgs: {
          ...args, 
          id: "skills", 
        },
      });
      if (args.document.type === 'pc') {
        this.personalityViewModel = new LazyLoadViewModel({
          id: "lazyPersonality",
          parent: thiz,
          template: TEMPLATES.ACTOR_PERSONALITY,
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
        template: TEMPLATES.ACTOR_HEALTH,
        viewModelFactoryFunction: (args) => { return new ActorHealthViewModel(args); },
        viewModelArgs: {
          ...args, 
          id: "health", 
        },
      });
      this.assetsViewModel = new LazyLoadViewModel({
        id: "lazyAssets",
        parent: thiz,
        template: TEMPLATES.ACTOR_ASSETS,
        viewModelFactoryFunction: (args) => { return new ActorAssetsViewModel(args); },
        viewModelArgs: {
          ...args, 
          id: "assets", 
        },
      });
      this.biographyViewModel = new LazyLoadViewModel({
        id: "lazyBiography",
        parent: thiz,
        template: TEMPLATES.ACTOR_BIOGRAPHY,
        viewModelFactoryFunction: (args) => { return new ActorBiographyViewModel(args); },
        viewModelArgs: {
          ...args, 
          id: "biography", 
        },
      });
    } else {
      this.vmRtDescription = factory.createVmRichText({
        id: "vmRtDescription",
        parent: thiz,
        propertyOwner: thiz.document,
        propertyPath: "description",
      });
    }
    
    if (this.isGM === true) {
      this.gmNotesViewModel = new LazyLoadViewModel({
        id: "lazyGmNotes",
        parent: thiz,
        template: TEMPLATES.COMPONENT_GM_NOTES,
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
  async activateListeners(html, isOwner, isEditable) {
    await super.activateListeners(html, isOwner, isEditable);

    const thiz = this;
    const tabs = html.find("nav.sheet-tabs > a");
    tabs.on("click", function(e) {
      const tab = $(e.currentTarget).data("tab");
      thiz._renderLazyTab(tab);
    });

    await this._renderActiveTab(html);
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
    this._restoreScrollPositions();
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
}
