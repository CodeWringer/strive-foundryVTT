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
   * Returns the localized title of this sheet type. 
   * @type {String}
   * @readonly
   */
  get title() { return game.i18n.localize("ambersteel.general.actor.plain.label"); }

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
