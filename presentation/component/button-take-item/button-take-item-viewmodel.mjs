import ButtonViewModel from "../button/button-viewmodel.mjs";
import ChoiceOption from "../input-choice/choice-option.mjs";
import { isDefined, validateOrThrow } from "../../../business/util/validation-utility.mjs";
import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import { isString } from "../../../business/util/validation-utility.mjs";
import TransientAsset from "../../../business/document/item/transient-asset.mjs";
import { ITEM_TYPES } from "../../../business/document/item/item-types.mjs";
import DynamicInputDialog from "../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import DynamicInputDefinition from "../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../dialog/dynamic-input-dialog/dynamic-input-types.mjs";

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
 * * In the context "chat-message", the asset in question will be moved to the current player's actor, or an actor chosen by a GM. 
 * * In the context "list-item", the asset in question will be moved to the current player's actor, or an actor chosen by a GM. 
 * * In the context "item-sheet", a copy of the asset in question will be added to the current player's actor, or an actor chosen by a GM. 
 * 
 * @method onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
 * * `event: Event`
 * * `data: undefined`
 */
export default class ButtonTakeItemViewModel extends ButtonViewModel {
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonTakeItem', `{{> "${ButtonTakeItemViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, will be interactible. 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.localizedLabel A localized text to 
   * display as a button label. 
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
   * * `event: Event`
   * * `data: undefined`
   * 
   * @param {TransientAsset} args.target The target object to affect. 
   * @param {TAKE_ITEM_CONTEXT_TYPES} args.contextType Represents the context of where this button view model is embedded. 
   * Depending on this value, the behavior of the button changes. 
   * 
   * In the context "chat-message", the asset in question will be moved to the current player's actor, or an actor chosen by a GM. 
   * In the context "list-item", the asset in question will be moved to the current player's actor, or an actor chosen by a GM. 
   * In the context "item-sheet", a copy of the asset in question will be added to the current player's actor, or an actor chosen by a GM. 
   */
  constructor(args = {}) {
    super({
      ...args,
      iconHtml: '<i class="ico dark interactible ico-take-item"></i>',
    });
    validateOrThrow(args, ["target", "contextType"]);

    this.target = args.target;
    this.contextType = args.contextType;
    this.localizedToolTip = args.localizedToolTip ?? game.i18n.localize("system.character.asset.take");
  }

  /**
   * @param {Event} event
   * 
   * @throws {Error} NullPointerException - Thrown, if the actor to pick up the item could not be found. 
   * @throws {Error} NullPointerException - Thrown, if the item could not be found/wasn't defined. 
   * 
   * @async
   * @protected
   * @override
   */
  async _onClick(event) {
    if (this.isEditable !== true) return;

    const assetDocument = await this._getAsset();

    if (assetDocument === undefined) {
      throw new Error("NullPointerException: item could not be determined");
    }

    const selections = await this._promptSelections();

    const targetActor = selections.actor;
    if (targetActor === undefined) return;
    
    if (isDefined(assetDocument.owningDocument)) { // The asset is embedded on an actor. 

      if (assetDocument.owningDocument.id === targetActor.id) {
        // If the player that owns the asset tries to pick the asset up, do nothing. 
        // After all, they already have the asset and therefore nothing needs to change. 
        return;
      }

      // Add copy to target actor. 
      this._cloneWithNewParentOnPerson(assetDocument, targetActor);

      if (selections.deleteFromSource === true) {
        // Remove from source actor. 
        assetDocument.delete();
      }
    } else if (isDefined(assetDocument.pack)) { // The asset is embedded in a compendium. 
      // Add copy to target actor. 
      this._cloneWithNewParentOnPerson(assetDocument, targetActor);
    } else { // The asset is part of the world. 
      // Add copy to target actor. 
      this._cloneWithNewParentOnPerson(assetDocument, targetActor);

      if (selections.deleteFromSource === true) {
        // Remove from world. 
        assetDocument.delete();
      }
    }
  }

  /**
   * Queries the user to select an actor and whether to remove the asset from the world, 
   * if it is a world asset. 
   * 
   * @returns {Promise<Object>} Has the following fields: 
   * * `actor: Actor | undefined`
   * * `deleteFromSource: Boolean`
   * 
   * @private
   */
  async _promptSelections() {
    const inputDefinitions = [];
    
    const nameInputActor = "nameInputActor";
    if (game.user.isGM) {
      const choices = [];
      for (const actor of game.actors.values()) {
        choices.push(
          new ChoiceOption({
            value: actor.id,
            localizedValue: actor.name,
            icon: actor.img,
          })
        );
      }

      inputDefinitions.push(
        new DynamicInputDefinition({
          type: DYNAMIC_INPUT_TYPES.DROP_DOWN,
          name: nameInputActor,
          localizedLabel: game.i18n.localize("system.general.actor.label"),
          required: true,
          specificArgs: {
            options: choices,
          }
        }),
      );
    }

    const nameInputDeleteFromSource = "nameInputDeleteFromSource";
    const assetDocument = await this._getAsset();
    let assetIsRemovable = false;
    if (isDefined(assetDocument.owningDocument)) { // Embedded -> removable from actor. 
      inputDefinitions.push(
        new DynamicInputDefinition({
          type: DYNAMIC_INPUT_TYPES.TOGGLE,
          name: nameInputDeleteFromSource,
          localizedLabel: game.i18n.localize("system.character.asset.delete.fromOwner"),
          required: true,
          defaultValue: false,
        }),
      );
      assetIsRemovable = true;
    } else if (!isDefined(assetDocument.pack)) { // Not embedded and not in a pack -> removable from world. 
      inputDefinitions.push(
        new DynamicInputDefinition({
          type: DYNAMIC_INPUT_TYPES.TOGGLE,
          name: nameInputDeleteFromSource,
          localizedLabel: game.i18n.localize("system.character.asset.delete.fromWorld"),
          required: true,
          defaultValue: false,
        }),
      );
      assetIsRemovable = true;
    }

    const dialog = await new DynamicInputDialog({
      localizedTitle: game.i18n.localize("system.general.actor.query"),
      inputDefinitions: inputDefinitions,
    }).renderAndAwait(true);

    if (dialog.confirmed !== true) {
      return {
        actor: undefined,
        deleteFromSource: false,
      };
    } else {
      return {
        actor: game.user.isGM ? await game.actors.get(dialog[nameInputActor].value) : game.user.character,
        deleteFromSource: assetIsRemovable ? dialog[nameInputDeleteFromSource] : false,
      };
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
   * Returns the asset item. 
   * 
   * @returns {Item}
   * 
   * @async
   * @private
   */
  async _getAsset() {
    if (isDefined(this._assetDocument)) {
      return this._assetDocument;
    } else if (isString(this.target) === true) { // Item id provided. 
      this._assetDocument = await new DocumentFetcher().find({
        id: this.target,
        documentType: "Item",
        contentType: ITEM_TYPES.ASSET
      });
      return this._assetDocument;
    } else {
      return this.target;
    }
  }
}
