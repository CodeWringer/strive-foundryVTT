import { ItemGrid } from "../item-grid/item-grid.mjs";
import { TEMPLATES } from "../../template/templatePreloader.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import { updateProperty } from "../../../business/document/document-update-utility.mjs";
import ChoiceOption from "../../util/choice-option.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import PlainDialog from "../../dialog/plain-dialog/plain-dialog.mjs";
import SingleChoiceDialog from "../../dialog/single-choice-dialog/single-choice-dialog.mjs";
import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";

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
 * 
 * In the context "chat-message", the item in question will be moved to the current player's actor, or an actor chosen by a GM. 
 * In the context "list-item", the item in question will be moved to its owning actor's item grid, if possible. 
 * In the context "item-sheet", a copy of the item in question will be added to the current player's actor, or an actor chosen by a GM. 
 */
export default class ButtonTakeItemViewModel extends ButtonViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON_TAKE_ITEM; }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {Object} args.target The target object to affect. 
   * @param {Function | String | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any | undefined} args.callbackData Optional. Defines any data to pass to the completion callback. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
   * @param {String | undefined} args.localizableTitle Optional. The localizable title (tooltip). 
   * 
   * @param {TAKE_ITEM_CONTEXT_TYPES} contextType Represents the context of where this button view model is embedded. 
   * Depending on this value, the behavior of the button changes. 
   * 
   * In the context "chat-message", the item in question will be moved to the current player's actor, or an actor chosen by a GM. 
   * In the context "list-item", the item in question will be moved to its owning actor's item grid, if possible. 
   * In the context "item-sheet", a copy of the item in question will be added to the current player's actor, or an actor chosen by a GM. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["target", "contextType"]);

    this.contextType = args.contextType;
    this.localizableTitle = args.localizableTitle ?? "ambersteel.character.asset.takeToPerson";
  }

  /**
   * @override
   * @see {ButtonViewModel.onClick}
   * 
   * @throws {Error} NullPointerException - Thrown, if the actor to pick up the item could not be found. 
   * @throws {Error} NullPointerException - Thrown, if the item could not be found/wasn't defined. 
   * 
   * @async
   */
  async onClick(html, isOwner, isEditable) {
    if (isEditable !== true) return;

    let item = this.target;
    if (typeof(this.target) === "String") { // Item id provided. 
      item = await new DocumentFetcher().find({
        id: this.target,
        documentType: "Item",
        contentType: "item"
      });
    }

    if (item === undefined) {
      throw new Error("NullPointerException: item could not be determined");
    }

    // If parent is not null, we can be sure the item is embedded on an actor. 
    const parent = item.parent;
    // If containingPack is not null, we can be sure the item is embedded in a compendium. 
    const containingPack = item.pack;
    // If neither parent nor containingPack is defined, then we can be sure the item is a world item. 

    if (parent !== undefined && parent !== null) { // The item is embedded on an actor. 
      if (this.contextType === TAKE_ITEM_CONTEXT_TYPES.chatMessage) {
        // Determine target actor. 
        const targetActor = await this._getTargetActor();

        // Determine source actor. 
        const sourceActor = parent;

        if (sourceActor.id === targetActor.id) {
          // If the player that owns the item tries to pick the item up, do nothing. 
          // After all, they already have the item and therefore nothing needs to change. 
          return;
        }

        // Add copy to target actor. 
        this._cloneWithNewParentOnPerson(item, targetActor);

        // Remove from source actor. 
        item.delete();
      } else if (this.contextType === TAKE_ITEM_CONTEXT_TYPES.listItem) {
        // Determine target actor. 
        const targetActor = parent;

        // Try to move item to item grid. 
        const itemGrid = ItemGrid.from(targetActor).itemGrid;
        const addResult = itemGrid.add(item);
        if (addResult === true) {
          updateProperty(item, "data.data.isOnPerson", true);
        } else {
          new PlainDialog({
            localizedTitle: game.i18n.localize("ambersteel.character.asset.carryingCapacity.dialog.titleInventoryFull"),
            localizedContent: game.i18n.localize("ambersteel.character.asset.carryingCapacity.dialog.contentInventoryFull")
          }).render(true);
        }
      }
    } else if (containingPack !== undefined && containingPack !== null) { // The item is embedded in a compendium. 
      // Determine target actor. 
      const targetActor = await this._getTargetActor();
      
      // Add copy to target actor. 
      this._cloneWithNewParentOnPerson(item, targetActor);
    } else { // The item is part of the world. 
      // Determine target actor. 
      const targetActor = await this._getTargetActor();

      // Add copy to target actor. 
      this._cloneWithNewParentOnPerson(item, targetActor);

      // Remove from world. 
      item.delete();
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

    return new Promise((resolve) => {
      new SingleChoiceDialog({
        localizedTitle: game.i18n.localize("ambersteel.general.actor.query"),
        localizedLabel: game.i18n.localize("ambersteel.general.actor.label"),
        choices: choices,
        closeCallback: async (dialog) => {
          if (dialog.confirmed !== true) {
            resolve(undefined);
            return;
          }
  
          const actor = await game.actors.get(dialog.selected.value);
          resolve(actor);
        },
      }).render(true);
    });
  }

  /**
   * Clones the given item, sets its parent to the given actor and returns the clone. 
   * @param {Item} templateItem 
   * @param {Actor} parent
   * @async
   */
  async _cloneWithNewParentOnPerson(templateItem, parent) {
    const itemData = {
      name: templateItem.name,
      type: templateItem.type,
      data: {
        img: templateItem.data.img,
        data: {
          ...templateItem.data.data,
          isOnPerson: true,
        }
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

Handlebars.registerPartial('buttonTakeItem', `{{#> "${ButtonTakeItemViewModel.TEMPLATE}"}}{{> @partial-block }}{{/"${ButtonTakeItemViewModel.TEMPLATE}"}}`);
