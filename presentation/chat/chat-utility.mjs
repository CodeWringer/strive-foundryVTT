import SkillAbility from "../../business/ruleset/skill/skill-ability.mjs";
import { getNestedPropertyValue } from "../../business/util/property-utility.mjs";
import { validateOrThrow } from "../../business/util/validation-utility.mjs";
import { SOUNDS_CONSTANTS } from "../audio/sounds.mjs";
import { VISIBILITY_MODES } from "./visibility-modes.mjs";

/**
 * Creates a new ChatMessage, displaying the given contents. 
 * @param {String} chatData.renderedContent The rendered HTML of the chat message. 
 * @param {Actor} chatData.speaker Optional. The actor to associate with the message. 
 * @param {String} chatData.flavor Optional. The flavor text / subtitle of the message. 
 * @param {Actor} chatData.actor Optional. The actor to associate with the message. 
 * @param {String} chatData.sound Optional. The sound to play when the message is sent. Default generic notify sound. 
 * @param {VisibilityMode} chatData.visibilityMode Optional. Sets the visibility of the chat message. Default public. 
 * @returns {Promise<any>}
 */
export async function sendToChat(chatData = {}) {
  chatData = {
    speaker: undefined,
    renderedContent: undefined,
    flavor: undefined,
    actor: undefined,
    sound: SOUNDS_CONSTANTS.NOTIFY,
    visibilityMode: VISIBILITY_MODES.public,
    ...chatData
  };
  validateOrThrow(chatData, ["renderedContent"])

  const speaker = chatData.speaker ?? ChatMessage.getSpeaker({ actor: chatData.actor });

  if (chatData.visibilityMode === VISIBILITY_MODES.self) {
    const self = game.user;
    return ChatMessage.create({
      whisper: [self],
      speaker: speaker,
      flavor: chatData.flavor,
      content: chatData.renderedContent,
      sound: chatData.sound
    });
  } else if (chatData.visibilityMode === VISIBILITY_MODES.gm) {
    const gms = ChatMessage.getWhisperRecipients("GM");
    for (const gm of gms) {
      return ChatMessage.create({
        whisper: [gm],
        speaker: speaker,
        flavor: chatData.flavor,
        content: chatData.renderedContent,
        sound: chatData.sound
      });
    }
  } else { // Public message. 
    return ChatMessage.create({
      speaker: speaker,
      flavor: chatData.flavor,
      content: chatData.renderedContent,
      sound: chatData.sound
    });
  }
}

/**
 * Sends a property of this item to chat, based on the given property path. 
 * @param {Object} args.obj The object whose nested property is to be sent to chat. 
 * @param {String} args.propertyPath The property path. 
 * @param {Actor|Item} args.parent the Item or Actor that owns the property. 
 * @param {Actor} args.actor Optional. The actor that owns the parent item. 
 * @param {VisibilityMode} args.visibilityMode Optional. Sets the visibility of the chat message. 
 * @async
 */
export async function sendPropertyToChat(args = {}) {
  args = {
    obj: undefined,
    propertyPath: undefined,
    parent: undefined,
    actor: undefined,
    visibilityMode: VISIBILITY_MODES.public,
    ...args
  };
  validateOrThrow(args, ["obj", "propertyPath", "parent"]);

  const prop = getNestedPropertyValue(args.obj, args.propertyPath);
  if (prop.type) {
    var args = { 
      parentItem: args.parent,
      actor: args.actor,
      visibilityMode: args.visibilityMode
    };
    if (prop.type === "SkillAbility") {
      await SkillAbility.sendToChat({
        skillAbility: prop, 
        ...args
      });
    } else {
      throw `Unrecognized dto type '${prop.type}'!`
    }
  } else {
    await sendToChat({
      visibilityMode: args.visibilityMode,
      ...{ renderedContent: `<span>${prop}</span>` }
    });
  }
}

/**
 * Returns an array of available visibility modes. 
 * 
 * @returns {Array<VisibilityMode>}
 */
export function getVisibilityModes() {
  const visibilityModes = [];
  for (const visibilityModeName in VISIBILITY_MODES) {
    const visibilityMode = VISIBILITY_MODES[visibilityModeName];
    visibilityModes.push(visibilityMode);
  }
  return visibilityModes;
}