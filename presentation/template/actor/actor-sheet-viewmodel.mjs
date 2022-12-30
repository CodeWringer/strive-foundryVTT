import { validateOrThrow } from "../../../business/util/validation-utility.mjs"
import GmNotesViewModel from "../../component/section-gm-notes/section-gm-notes-viewmodel.mjs"
import ViewModel from "../../view-model/view-model.mjs"
import ViewModelFactory from "../../view-model/view-model-factory.mjs"
import { TEMPLATES } from "../templatePreloader.mjs"
import ActorAssetsViewModel from "./part/actor-assets-viewmodel.mjs"
import ActorAttributesViewModel from "./part/actor-attributes-viewmodel.mjs"
import ActorBeliefsFateViewModel from "./part/actor-beliefs-fate-viewmodel.mjs"
import ActorBiographyViewModel from "./part/actor-biography-viewmodel.mjs"
import ActorHealthViewModel from "./part/actor-health-viewmodel.mjs"
import ActorPersonalsViewModel from "./part/actor-personals-viewmodel.mjs"
import ActorSkillsViewModel from "./part/actor-skills-viewmodel.mjs"

export default class ActorSheetViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_SHEET; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * Is true, if the actor is a player character. 
   * @type {Boolean}
   */
  get isPC() { return this.document.type === "pc"; }
  
  /**
   * Is true, if the actor is a non-player character. 
   * @type {Boolean}
   */
  get isNPC() { return this.document.type === "npc"; }

  /**
   * Is true, if the actor is a plain actor. 
   * @type {Boolean}
   */
  get isPlain() { return this.document.type === "plain"; }

  personalsViewModel = undefined;
  get personalsId() { return "child-personals-viewmodel"; }
  
  attributesViewModel = undefined;
  get attributesId() { return "child-attributes-viewmodel"; }
  
  skillsViewModel = undefined;
  get skillsId() { return "child-skill-viewmodel"; }
  
  beliefsFateViewModel = undefined;
  get beliefsFateId() { return "child-beliefs-fate-viewmodel"; }
  
  healthViewModel = undefined;
  get healthId() { return "child-health-viewmodel"; }
  
  assetsViewModel = undefined;
  get assetsId() { return "child-assets-viewmodel"; }
  
  biographyViewModel = undefined;
  get biographyId() { return "child-biography-viewmodel"; }
  
  gmNotesViewModel = undefined;
  get gmNotesId() { return "child-gm-notes-viewmodel"; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * 
   * @param {TransientBaseactor} args.document
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;
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

    if (this.isPlain !== true) {
      this.personalsViewModel = new ActorPersonalsViewModel({ ...args, id: thiz.personalsId, parent: thiz });
      this.attributesViewModel = new ActorAttributesViewModel({ ...args, id: thiz.personalsId, parent: thiz });
      this.skillsViewModel = new ActorSkillsViewModel({ ...args, id: thiz.skillsId, parent: thiz });
      if (args.document.type === 'pc') {
        this.beliefsFateViewModel = new ActorBeliefsFateViewModel({ ...args, id: thiz.beliefsFateId, parent: thiz });
      }
      this.healthViewModel = new ActorHealthViewModel({ ...args, id: thiz.healthId, parent: thiz });
      this.assetsViewModel = new ActorAssetsViewModel({ ...args, id: thiz.assetsId, parent: thiz });
      this.biographyViewModel = new ActorBiographyViewModel({ ...args, id: thiz.biographyId, parent: thiz });
    }

    if (this.isGM === true) {
      this.gmNotesViewModel = new GmNotesViewModel({ ...args, id: thiz.biographyId, document: thiz.document, parent: thiz });
    }
    
    this.vmBtnSendToChat = factory.createVmBtnSendToChat({
      parent: this,
      id: "vmBtnSendToChat",
      target: thiz.document,
      isEditable: thiz.isEditable || thiz.isGM,
    });
  }
}
