import ViewModel from "../../module/components/viewmodel.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import GmNotesViewModel from "../gm-notes-viewmodel.mjs";
import SheetViewModel from "../sheet-viewmodel.mjs";
import ActorAssetsViewModel from "./parts/actor-assets-viewmodel.mjs";
import ActorBiographyViewModel from "./parts/actor-biography-viewmodel.mjs";
import ActorPersonalsViewModel from "./parts/actor-personals-viewmodel.mjs";

export default class ActorSheetViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_SHEET; }

  /**
   * @type {Actor}
   */
  actor = undefined;

  /**
   * Is true, if the actor is a player character. 
   * @type {Boolean}
   */
  get isPC() { return this.actor.type === "pc"; }

  personalsViewModel = undefined;
  get personalsId() { return "personals"; }
  
  attributesViewModel = undefined;
  get attributesId() { return "attributes"; }
  
  skillsViewModel = undefined;
  get skillsId() { return "skill"; }
  
  beliefsFateViewModel = undefined;
  get beliefsFateId() { return "beliefs-fate"; }
  
  healthViewModel = undefined;
  get healthId() { return "health"; }
  
  assetsViewModel = undefined;
  get assetsId() { return "assets"; }
  
  biographyViewModel = undefined;
  get biographyId() { return "biography"; }
  
  gmNotesViewModel = undefined;
  get gmNotesId() { return "gm-notes"; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean} isEditable If true, the sheet is editable. 
   * @param {Boolean} isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean} isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean} isGM If true, the current user is a GM. 
   * 
   * @param {Actor} actor
   */
  constructor(args = {}) {
    super(args);

    // Own properties.
    this.actor = args.actor;

    // Child view models. 
    const thiz = this;

    this.personalsViewModel = new ActorPersonalsViewModel({ ...args, id: thiz.personalsId, parent: thiz });
    this.children.push(this.personalsViewModel);
    
    this.skillsViewModel = new ActorSkillsViewModel({ ...args, id: thiz.skillsId, parent: thiz });
    this.children.push(this.skillsViewModel);
    
    this.healthViewModel = new ActorHealthViewModel({ ...args, id: thiz.healthId, parent: thiz });
    this.children.push(this.healthViewModel);
    
    this.assetsViewModel = new ActorAssetsViewModel({ ...args, id: thiz.assetsId, parent: thiz });
    this.children.push(this.assetsViewModel);
    
    this.biographyViewModel = new ActorBiographyViewModel({ ...args, id: thiz.biographyId, parent: thiz });
    this.children.push(this.biographyViewModel);
    
    this.gmNotesViewModel = new GmNotesViewModel({ ...args, id: thiz.biographyId, document: thiz.actor, parent: thiz });
    this.children.push(this.gmNotesViewModel);
  }

  /** @override */
  toViewState() {
    const viewState = super.toViewState();

    return viewState;
  }

  /** @override */
  applyViewState(viewState) {
    super.applyViewState(viewState);
  }
}
