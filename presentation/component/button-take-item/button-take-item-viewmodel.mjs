import ButtonViewModel from "../button/button-viewmodel.mjs";
import ChoiceOption from "../input-choice/choice-option.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import SingleChoiceDialog from "../../dialog/single-choice-dialog/single-choice-dialog.mjs";
import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import { isString } from "../../../business/util/validation-utility.mjs";

/**
 * @property {String} chatMessage
 * @property {String} itemSheet
 * @property {String} listItem
 * 
 * @constant
 */
export const TAKE_ITEM_CONTEXT_TYPES = {
  chatMessage: "chat-message",
  itemSheet: "item-sheet",
  listItem: "list-item"
}

/**
 * A button that allows (re-)assigning a specific asset to a specific actor. 
 * 
 * @extends ButtonViewModel
 * 
 * @property {TAKE_ITEM_CONTEXT_TYPES} contextType Represents the context of where this button view model is embedded. 
 * Depending on this value, the behavior of the button changes. 
 * * In the context "chat-message", the item in question will be moved to the current player's actor, or an actor chosen by a GM. 
 * * In the context "list-item", TODO #196
 * * In the context "item-sheet", a copy of the item in question will be added to the current player's actor, or an actor chosen by a GM. 
 * 
 * @method onClick Asynchronous callback that is invoked when the button is clicked. 
 * Receives the button's original click-handler as its sole argument. In most cases, it should be called 
 * and awaited before one's own click handling logic. But in case the original logic is unwanted, the method can be ignored.
 * * Returns nothing. 
 */
export default class ButtonTakeItemViewModel extends ButtonViewModel {
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonTakeItem', `{{#> "${ButtonTakeItemViewModel.TEMPLATE}"}}{{> @partial-block }}{{/"${ButtonTakeItemViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
   * @param {String | undefined} args.localizedTooltip Localized tooltip. 
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when the button is clicked. 
   * Receives the button's original click-handler as its sole argument. In most cases, it should be called 
   * and awaited before one's own click handling logic. But in case the original logic is unwanted, the method can be ignored.
   * * Returns nothing. 
   * 
   * @param {TransientAsset} args.target The target object to affect. 
   * @param {TAKE_ITEM_CONTEXT_TYPES} contextType Represents the context of where this button view model is embedded. 
   * Depending on this value, the behavior of the button changes. 
   * 
   * In the context "chat-message", the item in question will be moved to the current player's actor, or an actor chosen by a GM. 
   * In the context "list-item", TODO #196
   * In the context "item-sheet", a copy of the item in question will be added to the current player's actor, or an actor chosen by a GM. 
   */
  constructor(args = {}) {
    super({
      ...args,
      iconHtml: '<i class="ambersteel-icon ico-take-item"></i>',
    });
    validateOrThrow(args, ["target", "contextType"]);

    this.target = args.target;
    this.contextType = args.contextType;
    this.localizedTooltip = args.localizedTooltip ?? game.i18n.localize("ambersteel.character.asset.takeToPerson");
  }

  /**
   * @override
   * @see {ButtonViewModel._onClick}
   * 
   * @throws {Error} NullPointerException - Thrown, if the actor to pick up the item could not be found. 
   * @throws {Error} NullPointerException - Thrown, if the item could not be found/wasn't defined. 
   * 
   * @async
   */
  async _onClick() {
    if (this.isEditable !== true) return;

    let assetDocument = this.target;
    if (isString(this.target) === true) { // Item id provided. 
      assetDocument = await new DocumentFetcher().find({
        id: this.target,
        documentType: "Item",
        contentType: "item"
      });
    }

    if (assetDocument === undefined) {
      throw new Error("NullPointerException: item could not be determined");
    }

    // If this is not undefined, we can be sure the item is embedded on an actor. 
    const parentDocument = assetDocument.owningDocument;
    // If containingPack is not null, we can be sure the item is embedded in a compendium. 
    const containingPack = assetDocument.pack;
    // If neither parent nor containingPack is defined, then we can be sure the item is a world item. 

    // Determine target actor. 
    const targetActor = await this._getTargetActor();
    // If no target actor could be determined, abort any further action. 
    if (targetActor === undefined) return;
    
    if (parentDocument !== undefined) { // The item is embedded on an actor. 
      if (this.contextType === TAKE_ITEM_CONTEXT_TYPES.chatMessage) {

        if (parentDocument.id === targetActor.id) {
          // If the player that owns the item tries to pick the item up, do nothing. 
          // After all, they already have the item and therefore nothing needs to change. 
          return;
        }

        // Add copy to target actor. 
        this._cloneWithNewParentOnPerson(assetDocument, targetActor);

        // Remove from source actor. 
        assetDocument.delete();
      } else if (this.contextType === TAKE_ITEM_CONTEXT_TYPES.listItem) {
        // TODO #196: Move to free slot?
      }
    } else if (containingPack !== undefined && containingPack !== null) { // The item is embedded in a compendium. 
      // Add copy to target actor. 
      this._cloneWithNewParentOnPerson(assetDocument, targetActor);
    } else { // The item is part of the world. 
      // Add copy to target actor. 
      this._cloneWithNewParentOnPerson(assetDocument, targetActor);

      // Remove from world. 
      assetDocument.delete();
    }
  }

  /**
   * Queries the user to select an actor. 
   * 
   * @returns {Promise<Actor | undefined>}
   * 
   * @private
   */
  async _promptSelectActor() {
    const choices = [];
    for (const actor of game.actors.values()) {
      choices.push(new ChoiceOption({
        value: actor.id,
        localizedValue: actor.name,
        icon: actor.img,
      }));
    }

    const dialog = await new SingleChoiceDialog({
      localizedTitle: game.i18n.localize("ambersteel.general.actor.query"),
      localizedLabel: game.i18n.localize("ambersteel.general.actor.label"),
      choices: choices,
    }).renderAndAwait(true);

    if (dialog.confirmed !== true) {
      return undefined;
    } else {
      return await game.actors.get(dialog.selected.value);
    }
  }

  /**
   * Clones the given item, sets its parent to the given actor and returns the clone. 
   * 
   * @param {TransientAsset} templateItem 
   * @param {Actor} parent
   * 
   * @returns {Item} The cloned item document. This is **not** a transient type instance!
   * 
   * @async
   */
  async _cloneWithNewParentOnPerson(templateItem, parent) {
    const itemData = {
      name: templateItem.name,
      type: templateItem.type,
      img: templateItem.img,
      system: {
        ...templateItem.document.system,
        isOnPerson: true,
      }
    };
    return await Item.create(itemData, { parent: parent });
  }

  /**
   * @returns {Actor | undefined}
   * @throws {Error} NullPointerException - thrown, if the current user is not a GM and has no set character. 
   * @private
   * @async
   */
  async _getTargetActor() {
    if (game.user.isGM) {
      return await this._promptSelectActor();
    } else {
      const targetActor = game.user.character;
      if (targetActor === undefined) {
        throw new Error("NullPointerException: target actor could not be determined");
      }
      return targetActor;
    }
  }
}
