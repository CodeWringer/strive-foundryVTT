import SheetViewModel from "../../module/components/sheet-viewmodel.mjs";
import ViewModel from "../../module/components/viewmodel.mjs";
import { TEMPLATES } from "../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../module/utils/validation-utility.mjs";
import GmNotesViewModel from "../gm-notes-viewmodel.mjs";
import ActorAssetsViewModel from "./parts/actor-assets-viewmodel.mjs";
import ActorAttributesViewModel from "./parts/actor-attributes-viewmodel.mjs";
import ActorBeliefsFateViewModel from "./parts/actor-beliefs-fate-viewmodel.mjs";
import ActorBiographyViewModel from "./parts/actor-biography-viewmodel.mjs";
import ActorHealthViewModel from "./parts/actor-health-viewmodel.mjs";
import ActorPersonalsViewModel from "./parts/actor-personals-viewmodel.mjs";
import ActorSkillsViewModel from "./parts/actor-skills-viewmodel.mjs";

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
   * @param {Actor} args.actor
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["actor"]);

    this.actor = args.actor;
    this.contextTemplate = args.contextTemplate ?? "actor-character-sheet";

    const thiz = this;

    this.vmTfName = this.createVmTextField({
      id: "vmTfName",
      propertyOwner: thiz.actor,
      propertyPath: "name",
      placeholder: "ambersteel.labels.name",
    });
    this.vmImg = this.createVmImg({
      id: "vmImg",
      propertyOwner: thiz.actor,
      propertyPath: "img",
    });
    this.personalsViewModel = new ActorPersonalsViewModel({ ...args, id: thiz.personalsId, parent: thiz });
    this.attributesViewModel = new ActorAttributesViewModel({ ...args, id: thiz.personalsId, parent: thiz });
    this.skillsViewModel = new ActorSkillsViewModel({ ...args, id: thiz.skillsId, parent: thiz });
    this.beliefsFateViewModel = new ActorBeliefsFateViewModel({ ...args, id: thiz.beliefsFateId, parent: thiz });
    this.healthViewModel = new ActorHealthViewModel({ ...args, id: thiz.healthId, parent: thiz });
    this.assetsViewModel = new ActorAssetsViewModel({ ...args, id: thiz.assetsId, parent: thiz });
    this.biographyViewModel = new ActorBiographyViewModel({ ...args, id: thiz.biographyId, parent: thiz });
    this.gmNotesViewModel = new GmNotesViewModel({ ...args, id: thiz.biographyId, document: thiz.actor, parent: thiz });
  }
}
