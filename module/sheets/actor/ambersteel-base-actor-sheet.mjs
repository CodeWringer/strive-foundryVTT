import ActorSheetViewModel from "../../../templates/actor/actor-sheet-viewmodel.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import { ACTOR_SHEET_SUBTYPE } from "./actor-sheet-subtype.mjs";

export default class AmbersteelBaseActorSheet {
  /**
   * Returns the template path. 
   * @type {String} Path to the template. 
   * @readonly
   * @virtual
   */
  get template() { return TEMPLATES.ACTOR_SHEET;  }

  /**
   * Returns the actor object of the parent sheet. 
   * @returns {Actor} The actor object of the parent sheet. 
   */
  getActor() {
    return this.parent.actor;
  }

  /**
   * Returns the item object with the given id of the parent sheet. 
   * @param {String} itemId The id of the item to fetch. 
   * @returns {Item} The item object of the parent sheet. 
   */
  getItem(itemId) {
    return this.getActor().items.get(itemId);
  }

  /**
   * Returns the current context object. 
   * @returns {Actor|Item} The current context object. 
   */
  getContextEntity() {
    return this.getActor();
  }

  /**
   * Extends the given context object with derived data. 
   * 
   * This is where any data should be added, which is only required to 
   * display the data via the parent sheet. 
   * @param context {Object} A context data object. Some noteworthy properties are 
   * 'actor', 'CONFIG', 'isSendable' and 'isEditable'. 
   * @virtual
   */
  prepareDerivedData(context) {
    // Use a safe clone of the actor data for further operations. 
    // It is "safe", because behind the scenes, a getter returns a clone. 
    const actorData = context.actor.data.data;

    // General derived data. 
    // TODO: Remove?
    context.data.person = actorData.person;
    context.data.beliefSystem = actorData.beliefSystem;
    context.data.fateSystem = actorData.fateSystem;
    context.data.biography = actorData.biography;
    context.data.learningSkills = actorData.learningSkills;
    context.data.skills = actorData.skills;
    context.data.attributeGroups = context.data.data.attributeGroups;
  }

  /**
   * Returns a new actor sheet view model for the given actor sheet. 
   * @param {Object} context Data fetched via getData. 
   * @param {Actor} actor The actor associated with the sheet. 
   * @returns {ActorSheetViewModel}
   */
  getViewModel(context, actor) {
    return new ActorSheetViewModel({
      id: actor.id,
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      isGM: context.isGM,
      actor: actor,
    });
  }
}

ACTOR_SHEET_SUBTYPE.set("plain", new AmbersteelBaseActorSheet());
