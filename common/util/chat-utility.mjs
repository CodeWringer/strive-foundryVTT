import { ITEM_TYPES } from "../../business/model/const/item-types.mjs"
import { SOUNDS_CONSTANTS } from "../../presentation/audio/sounds.mjs"
import { activateRollChatMessageListeners } from "../../presentation/dice/roll-chat-message.mjs"
import { VISIBILITY_MODES, VisibilityMode } from "../../business/model/const/visibility-modes.mjs"
import { common } from "../_module.mjs"

/**
 * Provides global utility functions for creating and handling chat messages. 
 * 
 * @constant
 */
export const ChatUtil = {
  /**
   * @type {String}
   * @readonly
   * @constant
   */
  SELECTOR_CHAT_MESSAGE: "custom-system-chat-message",

  /**
   * Creates a new ChatMessage, displaying the given contents. 
   * 
   * @param {Object} chatData
   * @param {String} chatData.renderedContent The rendered HTML of the chat message. 
   * @param {Actor | undefined} chatData.speaker Optional. The actor to associate with the message. 
   * @param {String | undefined} chatData.flavor Optional. The flavor text / subtitle of the message. 
   * @param {Actor | undefined} chatData.actor Optional. The actor to associate with the message. 
   * @param {String | undefined} chatData.sound Optional. The sound to play when the message is sent. 
   * * Default `SOUNDS_CONSTANTS.NOTIFY`. 
   * @param {VisibilityMode | undefined} chatData.visibilityMode Optional. Sets the visibility of the chat message. 
   * * Default `VISIBILITY_MODES.public`. 
   * 
   * @returns {Promise<any>}
   */
  sendToChat: async function (chatData = {}) {
    common.util.validation.validateOrThrow(chatData, ["renderedContent"])

    const sound = chatData.sound ?? SOUNDS_CONSTANTS.NOTIFY;
    const visibilityMode = chatData.visibilityMode ?? VISIBILITY_MODES.public;
    const speaker = chatData.speaker ?? ChatMessage.getSpeaker({ actor: chatData.actor });

    if (visibilityMode === VISIBILITY_MODES.self) {
      const self = game.user;
      return ChatMessage.create({
        whisper: [self],
        speaker: speaker,
        flavor: chatData.flavor,
        content: chatData.renderedContent,
        sound: sound
      });
    } else if (visibilityMode === VISIBILITY_MODES.gm) {
      const gms = ChatMessage.getWhisperRecipients("GM");
      for (const gm of gms) {
        return ChatMessage.create({
          whisper: [gm],
          speaker: speaker,
          flavor: chatData.flavor,
          content: chatData.renderedContent,
          sound: sound
        });
      }
    } else { // Public message. 
      return ChatMessage.create({
        speaker: speaker,
        flavor: chatData.flavor,
        content: chatData.renderedContent,
        sound: sound
      });
    }
  },

  /**
   * Sends a property of this item to chat, based on the given property path. 
   * 
   * @param {Object} args.obj The object whose nested property is to be sent to chat. 
   * @param {String} args.propertyPath The property path. 
   * @param {Actor|Item} args.parent the Item or Actor that owns the property. 
   * @param {Actor} args.actor Optional. The actor that owns the parent item. 
   * @param {VisibilityMode | undefined} args.visibilityMode Optional. Sets the visibility of the chat message. 
   * * Default `VISIBILITY_MODES.public`. 
   * 
   * @async
   */
  sendPropertyToChat: async function (args = {}) {
    common.util.validation.validateOrThrow(args, ["obj", "propertyPath", "parent"]);

    const visibilityMode = args.visibilityMode ?? VISIBILITY_MODES.public;

    const prop = common.util.property.getNestedPropertyValue(args.obj, args.propertyPath);
    if (prop.type !== undefined) {
      if (prop.type === business.model.const.ITEM_TYPES.EXPERTISE) {
        await prop.sendToChat({
          visibilityMode: visibilityMode,
        });
      } else {
        throw `Unrecognized dto type '${prop.type}'!`
      }
    } else {
      await this.sendToChat({
        visibilityMode: visibilityMode,
        renderedContent: `<span>${prop}</span>`,
      });
    }
  },

  /**
   * 
   * @param {Object} args 
   * @param {Object} args.message 
   * @param {HTMLElement} args.html 
   * @param {Object} args.data 
   */
  handleRenderedChatMessage: async function (args = {}) {
    const jquery = $(args.html);
    const element = jquery.find(`.${ChatUtil.SELECTOR_CHAT_MESSAGE}`)[0];

    // The chat message may just be a normal chat message, without any associated document. 
    // In such a case it is safe to skip any further operations, here. 
    if (element === undefined || element === null) return;

    activateRollChatMessageListeners(element);

    // Get data set of element. This assumes the element in question to have the following data defined:
    // 'data-view-model-id' and ('data-document-id' OR 'data-view-model-class')
    const elementId = element.id;
    const dataset = element.dataset;
    const vmId = dataset.viewModelId;
    const documentId = dataset.documentId;
    const viewModelClass = dataset.viewModelClass;

    let viewModel = game.strive.viewModels.get(vmId);

    if (common.util.validation.isDefined(documentId)) {
      const document = await new DocumentFetcher().find({
        id: documentId,
        searchEmbedded: true,
        includeLocked: true,
      });

      if (document === undefined) {
        game.strive.logger.logWarn(`renderChatMessage: Failed to get document represented by chat message`);
        return;
      }

      if (viewModel === undefined) {
        // Create new instance of a view model to associate with the chat message. 
        if (dataset.expertiseId !== undefined) {
          // Create an expertise chat view model. 
          const expertiseId = dataset.expertiseId;
          const skillDocument = document.getTransientObject();
          const expertise = skillDocument.expertises.find(it => it.id === expertiseId);
          viewModel = expertise.getChatViewModel({ id: vmId });
        } else {
          viewModel = document.getTransientObject().getChatViewModel({ id: vmId });
        }
      }
    } else if (common.util.validation.isDefined(viewModelClass)) {
      if (viewModel === undefined) {
        // Create new instance of a view model to associate with the chat message. 
        viewModel = new game.strive.classDef.viewModel.chat[viewModelClass]({
          id: elementId,
        });
      }
    } else {
      // No work to do.
      return;
    }

    if (viewModel === undefined) {
      game.strive.logger.logWarn(`renderChatMessage: Failed to create view model for chat message`);
      return;
    }
    
    await viewModel.activateListeners(args.html);
  },

  /**
   * 
   * @param {Object} args 
   * @param {HTMLElement} args.content 
   */
  handleDeletionOfChatMessage: function (args = {}) {
    const deletedContent = args.content;
    const rgxViewModelId = /data-view-model-id="([^"]*)"/;
    const match = deletedContent.match(rgxViewModelId);

    if (match !== undefined && match !== null && match.length === 2) {
      const vmId = match[1];

      // Dispose the view model, if it supports it. 
      const vm = game.strive.viewModels.get(vmId);

      if (vm === undefined) return;

      if (vm.dispose !== undefined) {
        try {
          vm.dispose();
        } catch (error) {
          // It may already be disposed, in which case it might throw an error. 
          // Of course, if it is already disposed, the error isn't actually a problem. 
          game.strive.logger.logVerbose(error);
        }
      }

      // Remove the view model from the global collection. 
      game.strive.viewModels.remove(vmId);
    }
  },
}
