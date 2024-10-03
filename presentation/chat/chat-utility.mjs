import { ITEM_TYPES } from "../../business/document/item/item-types.mjs";
import { PropertyUtil } from "../../business/util/property-utility.mjs";
import { ValidationUtil } from "../../business/util/validation-utility.mjs";
import { SOUNDS_CONSTANTS } from "../audio/sounds.mjs";
import { VISIBILITY_MODES } from "./visibility-modes.mjs";

/**
 * @constant
 */
export const ChatUtil = {
  /**
   * Creates a new ChatMessage, displaying the given contents. 
   * 
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
  sendToChat: async function(chatData = {}) {
    ValidationUtil.validateOrThrow(chatData, ["renderedContent"])
    
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
  sendPropertyToChat: async function(args = {}) {
    ValidationUtil.validateOrThrow(args, ["obj", "propertyPath", "parent"]);
  
    const visibilityMode = args.visibilityMode ?? VISIBILITY_MODES.public;
  
    const prop = PropertyUtil.getNestedPropertyValue(args.obj, args.propertyPath);
    if (prop.type !== undefined) {
      if (prop.type === ITEM_TYPES.EXPERTISE) {
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
}
