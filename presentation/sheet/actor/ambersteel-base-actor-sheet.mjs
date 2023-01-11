import { TEMPLATES } from "../../templatePreloader.mjs";
import { ACTOR_SHEET_SUBTYPE } from "./actor-sheet-subtype.mjs";
import ActorSheetViewModel from "./actor-sheet-viewmodel.mjs";

/**
 * Represents the base contract for a "specific" actor sheet "sub-type". 
 * 
 * Such a "sub-type" is really on an "enhancer", which adds properties and/or methods to a given `ActorSheet` instance. 
 * 
 * This particular type also doubles as the definition for the actor of type `"plain"`. 
 */
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
   * Returns a view model for the given document. 
   * 
   * @param {Object} context 
   * @param {TransientDocument} document 
   * 
   * @returns {ActorSheetViewModel}
   */
  getViewModel(context, document) {
    let viewModel = game.ambersteel.viewModels.get(document.id);
    if (viewModel === undefined) {
      viewModel = new ActorSheetViewModel({
        id: document.id,
        document: document.getTransientObject(),
        isEditable: context.isEditable,
        isSendable: context.isSendable,
        isOwner: context.isOwner,
      });
      game.ambersteel.viewModels.set(document.id, viewModel);
    } else {
      viewModel.update({
        isEditable: context.isEditable,
        isSendable: context.isSendable,
        isOwner: context.isOwner,
      });
    }
    return viewModel;
  }
  
  /**
   * Register any DOM-reliant event listeners and manipulations here. 
   * 
   * @param {JQuery} html The DOM of the sheet. 
   * @param {Boolean | undefined} isOwner If true, the current user is regarded as 
   * the represented document's owner. 
   * @param {Boolean | undefined} isEditable If true, the sheet will be editable. 
   * 
   * @virtual
   */
  activateListeners(html, isOwner, isEditable) { /** Do nothing */}
}

ACTOR_SHEET_SUBTYPE.set("plain", new AmbersteelBaseActorSheet());
