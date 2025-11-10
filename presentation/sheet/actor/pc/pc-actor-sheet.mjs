import { DOCUMENT_COLLECTION_SOURCES } from "../../../../business/document/document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "../../../../business/document/document-fetcher/document-fetcher.mjs";
import { ITEM_TYPES } from "../../../../business/document/item/item-types.mjs";
import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";
import ActorSheetSubType from "../actor-sheet-subtype.mjs";
import PcActorSheetViewModel from "./pc-actor-sheet-viewmodel.mjs";

export default class PcActorSheet extends ActorSheetSubType {
  /** @override */
  get template() { return PcActorSheetViewModel.TEMPLATE; }
  
  /** @override */
  get localizedType() { return game.i18n.localize("system.general.actor.pc.abbreviation"); }
  
  /** @override */
  createViewModel(context, document, sheet) {
    return new PcActorSheetViewModel({
      id: document.id,
      document: document,
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      sheet: sheet,
    });
  }

  /** @override */
  async onDropItem(event, data, document) {
    const templateId = data.uuid.substring(data.uuid.lastIndexOf(".") + 1);

    const docFetcher = new DocumentFetcher();
    const templateItem = await docFetcher.find({
      id: templateId,
      documentType: data.type,
      includeLocked: true,
      source: DOCUMENT_COLLECTION_SOURCES.all,
    });

    if (templateItem === undefined) {
      return false;
    }

    const creationData = {
      name: templateItem.name,
      type: templateItem.type,
      img: templateItem.img,
      system: {
        ...templateItem.system,
        isCustom: false,
      }
    };

    if (templateItem.type === ITEM_TYPES.SKILL) {
      const existingItem = document.items.find(it => it.id === templateId || it.name === templateItem.name);
      if (ValidationUtil.isDefined(existingItem)) {
        creationData.system.level = existingItem.system.level;
        creationData.system.levelModifier = existingItem.system.levelModifier;
        creationData.system.advancementProgress = existingItem.system.advancementProgress;

        // Synchronize Expertises. 
        for (const propName in existingItem.system.abilities) {
          if (!Object.hasOwn(existingItem.system.abilities, propName)) continue;
          
          if (!ValidationUtil.isDefined(templateItem.system.abilities[propName])) {
            creationData.system.abilities[`-=${[propName]}`] = null;
          }
        }

        await existingItem.update(creationData);
        return existingItem;
      }
    }

    return await Item.create(creationData, { parent: document });
  }

  /** @override */
  getHeaderButtons(sheet) {
    const buttons = super.getHeaderButtons(sheet);

    if (game.user.isGM || sheet.actor.isOwner) {
      buttons.push({
        label: game.i18n.localize("system.character.edit"),
        class: "edit-meta",
        icon: "fas fa-cog",
        onclick: async () => {
          await sheet.viewModel.promptConfigure();
        },
      });
    }
    
    return buttons;
  }

}
