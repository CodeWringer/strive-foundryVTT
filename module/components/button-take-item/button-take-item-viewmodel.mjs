import { TEMPLATES } from "../../templatePreloader.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import * as DialogUtil from "../../utils/dialog-utility.mjs";
import * as ContentUtil from "../../utils/content-utility.mjs";
import { updateProperty } from "../../utils/document-update-utility.mjs";
import ChoiceOption from "../../dto/choice-option.mjs";
import { validateOrThrow } from "../../utils/validation-utility.mjs";
import { ItemGrid } from "../item-grid/item-grid.mjs";

export const contextTypes = {
  chatMessage: "chat-message",
  itemSheet: "item-sheet",
  listItem: "list-item"
}

/**
 * --- Inherited from ViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Inherited from ButtonViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {Item | String} target An item instance or the id of an item. 
 * 
 * --- Own properties
 * 
 * @property {contextTypes} contextType Represents the context of where this button view model is embedded. 
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
   * @param {contextTypes} contextType Represents the context of where this button view model is embedded. 
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
    this.localizableTitle = args.localizableTitle ?? "ambersteel.labels.takeToPerson";
  }

  /**
   * @override
   * @see {ButtonViewModel.onClick}
   * @async
   * @throws {Error} NullPointerException - Thrown, if the actor to pick up the item could not be found. 
   * @throws {Error} NullPointerException - Thrown, if the item could not be found/wasn't defined. 
   */
  async onClick(html, isOwner, isEditable) {
    if (isEditable !== true) return;

    let item = this.target;
    if (typeof(this.target) === "String") { // Item id provided. 
      item = ContentUtil.findItem({ id: this.target });
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
      if (this.contextType === contextTypes.chatMessage) {
        // Determine target actor. 
        const targetActor = this._getTargetActor();

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
      } else if (this.contextType === contextTypes.listItem) {
        // Determine target actor. 
        const targetActor = parent;

        // Try to move item to item grid. 
        const itemGrid = ItemGrid.from(targetActor).itemGrid;
        const addResult = itemGrid.add(item);
        if (addResult === true) {
          updateProperty(item, "data.data.isOnPerson", true);
        } else {
          DialogUtil.showPlainDialog({
            localizableTitle: game.i18n.localize("ambersteel.character.asset.carryingCapacity.dialog.titleInventoryFull"),
            localizedContent: game.i18n.localize("ambersteel.character.asset.carryingCapacity.dialog.contentInventoryFull")
          });
        }
      }
    } else if (containingPack !== undefined && containingPack !== null) { // The item is embedded in a compendium. 
      // Determine target actor. 
      const targetActor = this._getTargetActor();
      
      // Add copy to target actor. 
      this._cloneWithNewParentOnPerson(item, targetActor);
    } else { // The item is part of the world. 
      // Determine target actor. 
      const targetActor = this._getTargetActor();

      // Add copy to target actor. 
      this._cloneWithNewParentOnPerson(item, targetActor);

      // Remove from world. 
      item.delete();
    }
  }

  /**
   * @private
   * @returns {Actor | undefined}
   */
  async _promptSelectActor() {
    const options = [];
    for (const actor of game.actors.values()) {
      options.push(new ChoiceOption({
        value: actor.id,
        localizedValue: actor.name,
        icon: actor.img,
      }));
    }

    const dialogResult = await DialogUtil.showSelectionDialog({
      localizableLabel: "ambersteel.labels.actor",
      options: options
    });

    if (dialogResult.confirmed !== true) return undefined;

    return game.actors.get(dialogResult.selected);
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
        ...templateItem.data,
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

Handlebars.registerHelper('createButtonTakeItemViewModel', function(id, target, callback, callbackData, contextType) {
  return new ButtonTakeItemViewModel({
    id: id,
    target: target,
    callback: callback,
    callbackData: callbackData,
    contextType: contextType,
  });
});
Handlebars.registerPartial('buttonTakeItem', `{{#> "${ButtonTakeItemViewModel.TEMPLATE}"}}{{> @partial-block }}{{/"${ButtonTakeItemViewModel.TEMPLATE}"}}`);
