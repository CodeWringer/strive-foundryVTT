import { ACTOR_TYPES } from "../../../../business/document/actor/actor-types.mjs";
import TransientBaseCharacterActor from "../../../../business/document/actor/transient-base-character-actor.mjs";
import { DOCUMENT_COLLECTION_SOURCES } from "../../../../business/document/document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "../../../../business/document/document-fetcher/document-fetcher.mjs";
import { ITEM_TYPES } from "../../../../business/document/item/item-types.mjs";
import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";
import { ExtenderUtil } from "../../../../common/extender-util.mjs";
import InputImageViewModel from "../../../component/input-image/input-image-viewmodel.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import Tooltip from "../../../component/tooltip/tooltip.mjs";
import { DragDropHandler } from "../../../utility/drag-drop-handler.mjs";
import BaseSheetViewModel from "../../../view-model/base-sheet-viewmodel.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import ItemDropData from "../../item/base/item-drop-data.mjs";
import ActorActionPointsViewModel from "../part/action-points/actor-action-points-viewmodel.mjs";
import ActorPersonalsViewModel from "../part/personals/actor-personals-viewmodel.mjs";

/**
 * @abstract Inheritors **must** override:
 * * `TEMPLATE`
 * * `_renderLazyTab`
 * * `promptConfigure`
 */
export default class CharacterActorSheetViewModel extends BaseSheetViewModel {
  /**
   * Returns the template path of the "personals" partial. 
   * 
   * @type {String}
   * @readonly
   */
  get templatePersonals() { return ActorPersonalsViewModel.TEMPLATE; }

  /**
   * @type {String}
   * @readonly
   */
  get templateActionPoints() { return ActorActionPointsViewModel.TEMPLATE; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {TransientBaseCharacterActor} args.document The represented transient document instance. 
   * @param {GameSystemActorSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super(args);

    // Aggressively clear out any lingering ToolTips. 
    Tooltip.removeAllToolTipElements();

    this.vmName = new InputTextFieldViewModel({
      parent: this,
      id: "vmName",
      value: this.document.name,
      onChange: (_, newValue) => {
        this.document.name = newValue;
      },
      placeholder: game.i18n.localize("system.general.name.label"),
    });
    this.vmImg = new InputImageViewModel({
      parent: this,
      id: "vmImg",
      value: this.document.img,
      onChange: (_, newValue) => {
        this.document.img = newValue;
      },
    });
    this.vmActionPoints = new ActorActionPointsViewModel({
      id: "vmActionPoints",
      parent: this,
      localizedToolTip: game.i18n.localize("system.actionPoint.plural"),
      document: this.document,
    });
    this.personalsViewModel = new ActorPersonalsViewModel({
      ...args,
      id: "personals",
      parent: this,
    });
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    const thiz = this;
    const tabs = html.find("nav.sheet-tabs > a");
    tabs.on("click", function (e) {
      const tab = $(e.currentTarget).data("tab");
      thiz._renderLazyTab(tab);
    });

    await this._renderActiveTab(html);

    if (this.isEditable === true) {
      this._dragHandler = new DragDropHandler({
        enableReceiving: true,
        onReceive: this.onReceiveDroppedItem.bind(this),
      });
      this._dragHandler.activateListeners(html);
    }
  }

  /** @override */
  dispose() {
    super.dispose();

    // An extremely aggressive band-aid solution. But, this ensures lingering tool tip elements 
    // with (at least partially) dynamic IDs are always cleared properly. 
    Tooltip.removeAllToolTipElements();
  }

  /**
   * 
   * @param {ItemDropData} data 
   * @param {Object} overrides Creation/Update data overrides. 
   * E. g. `{ system: { level: 1 } }`
   * 
   * @async
   * @virtual
   */
  async onReceiveDroppedItem(data, overrides) {
    // No data - no reaction. This case can occur when an Item is dropped onto the actor sheet 
    // from any non-actor source, such as a compendium pack or the world collection. 
    if (!ValidationUtil.isDefined(data)) return;

    // Don't react to owned items dropped onto self. 
    if (data.owningDocument.id === this.id) return;

    // Expertises aren't really Item document instances and thus cannot be handled the same way. 
    if (data.contentType === ITEM_TYPES.EXPERTISE) return;

    const docFetcher = new DocumentFetcher();

    // Fetch source Item document instance. 
    let templateItem;
    if (ValidationUtil.isDefined(data.owningDocument.id)) {
      const owningDocument = await docFetcher.find({
        id: data.owningDocument.id,
        contentType: data.owningDocument.contentType,
        includeLocked: true,
        source: DOCUMENT_COLLECTION_SOURCES.all,
      });

      if (!ValidationUtil.isDefined(owningDocument)) {
        game.strive.logger.logWarn(`Failed to find owningDocument with type '${data.owningDocument.contentType}' and ID '${data.owningDocument.id}'`);
        return;
      }

      templateItem = owningDocument.items.find(it => it.id === data.id);
    } else {
      templateItem = await docFetcher.find({
        id: data.id,
        contentType: data.contentType,
        includeLocked: true,
        source: DOCUMENT_COLLECTION_SOURCES.all,
      });
    }

    if (!ValidationUtil.isDefined(templateItem)) {
      game.strive.logger.logWarn(`Failed to find document with type '${data.contentType}' ID '${data.id}'`);
      return;
    }

    templateItem = templateItem.getTransientObject();

    const existingItem = this.document.items.find(it => it.id === templateItem.id || it.name === templateItem.name);
    const shouldUpdate = ValidationUtil.isDefined(existingItem) 
      && (templateItem.type === ITEM_TYPES.SKILL 
        || templateItem.type === ITEM_TYPES.TRAIT);

    if (shouldUpdate) { // Update existing Item document on actor. 
      if (existingItem.id === templateItem.id) {
        // If, by some odd chance, the template and the existing item are the same instance, abort the update. 
        return;
      }

      let updateData = {
        img: templateItem.document.img,
        ...overrides,
        system: {
          ...templateItem.document.system,
          ...(overrides ?? {}).system,
        },
      };
      
      if (templateItem.type === ITEM_TYPES.SKILL) {
        // For Skills, preserve some the existing instance's data. 
        updateData.system.level = existingItem.document.system.level;
        updateData.system.levelModifier = existingItem.document.system.levelModifier;
        updateData.system.advancementProgress = existingItem.document.system.advancementProgress;

        // Synchronize Expertises. 
        for (const propName in existingItem.document.system.abilities) {
          if (!Object.hasOwn(existingItem.document.system.abilities, propName)) continue;

          const templateExpertise = templateItem.expertises.find(it => it.id === propName);
          if (!ValidationUtil.isDefined(templateExpertise)) {
            updateData.system.abilities[`-=${[propName]}`] = null;
          }
        }
      }

      await existingItem.update(updateData);
    } else { // Create new Item document on actor. 
      const creationData = {
        name: templateItem.document.name,
        type: templateItem.document.type,
        img: templateItem.document.img,
        ...overrides,
        system: {
          ...templateItem.document.system,
          ...(overrides ?? {}).system,
        },
      };

      await Item.create(creationData, { parent: this.document.document });
    }

    // Remove from source, if that is another, editable actor. 
    if (ValidationUtil.isDefined(templateItem.owningDocument)
      && templateItem.owningDocument.isOwner
      && (templateItem.owningDocument.type === ACTOR_TYPES.NPC
        || templateItem.owningDocument.type === ACTOR_TYPES.PC)) {
      await templateItem.delete();
    }
  }

  /**
   * Renders the contents of the active tab. 
   * 
   * @param {JQuery} html 
   * 
   * @private
   * @async
   */
  async _renderActiveTab(html) {
    const activeTab = html.find("nav.sheet-tabs > a.active");
    const tab = activeTab.data("tab");
    await this._renderLazyTab(tab);
    this.restoreScrollPosition();
  }

  /**
   * Renders the contents of the tab with the given "tab" dataset attribute. 
   * 
   * @param {String} tab The value of the "tab" dataset attribute 
   * of the tab to render. E. g. `"skills"`. 
   * 
   * @abstract
   * @async
   * @protected
   */
  async _renderLazyTab(tab) {
    throw new Error("Not implemented");
  }

  /**
   * Opens the dialog to configure the meta data of the character. 
   * 
   * @abstract
   * @async
   */
  async promptConfigure() {
    throw new Error("Not implemented");
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(CharacterActorSheetViewModel));
  }

}
