import SkillAbility from "../dto/skill-ability.mjs";
import { showDialog } from "./dialog-utility.mjs";
import { getNestedPropertyValue } from "./property-utility.mjs";
import { getElementValue } from "./sheet-utility.mjs";
import { validateOrThrow } from "./validation-utility.mjs";

/**
 * Creates a new ChatMessage, displaying the given contents. 
 * @param {Actor} chatData.speaker Optional. The actor to associate with the message. 
 * @param {String} chatData.renderedContent The rendered HTML of the chat message. 
 * @param {String} chatData.flavor Optional. The flavor text / subtitle of the message. 
 * @param {Actor} chatData.actor Optional. The actor to associate with the message. 
 * @param {String} chatData.sound Optional. The sound to play when the message is sent. 
 * @param {CONFIG.ambersteel.visibilityModes} chatData.visibilityMode Optional. Sets the visibility of the chat message. Default public. 
 */
export function sendToChat(chatData = {}) {
  chatData = {
    speaker: undefined,
    renderedContent: undefined,
    flavor: undefined,
    actor: undefined,
    sound: "../sounds/notify.wav",
    visibilityMode: CONFIG.ambersteel.visibilityModes.public,
    ...chatData
  };
  validateOrThrow(chatData, ["renderedContent"])

  const speaker = chatData.speaker ?? ChatMessage.getSpeaker({ actor: chatData.actor });

  if (chatData.visibilityMode === CONFIG.ambersteel.visibilityModes.self) {
    const self = game.user;

    ChatMessage.create({
      whisper: [self],
      speaker: speaker,
      flavor: chatData.flavor,
      content: chatData.renderedContent,
      sound: chatData.sound
    });
  } else if (chatData.visibilityMode === CONFIG.ambersteel.visibilityModes.gm) {
    const gms = ChatMessage.getWhisperRecipients("GM");
    for (const gm of gms) {
      ChatMessage.create({
        whisper: [gm],
        speaker: speaker,
        flavor: chatData.flavor,
        content: chatData.renderedContent,
        sound: chatData.sound
      });
    }
  } else { // Public message. 
    ChatMessage.create({
      speaker: speaker,
      flavor: chatData.flavor,
      content: chatData.renderedContent,
      sound: chatData.sound
    });
  }
}

/**
 * @returns {Object} result
 * @returns {CONFIG.ambersteel.visibilityModes} result.visibilityMode
 * @returns {Boolean} result.confirmed
 * @async
 */
export async function queryVisibilityMode() {
  const dialogTemplate = "systems/ambersteel/templates/dialog/visibility-dialog.hbs";
  const dialogData = {
    visibilityMode: CONFIG.ambersteel.visibilityModes.public
  };

  return new Promise(async (resolve, reject) => {
    if (keyboard.isDown("Shift")) {
      resolve({
        visibilityMode: CONFIG.ambersteel.visibilityModes.public,
        confirmed: true
      });
    } else {
      const result = await showDialog({ dialogTemplate: dialogTemplate, localizableTitle: "ambersteel.dialog.titleVisibility" }, dialogData);
      resolve({
        visibilityMode: getElementValue(result.html.find(".visibilityMode")[0]),
        confirmed: result.confirmed
      });
    }
  });
}

/**
 * Sends a property of this item to chat, based on the given property path. 
 * @param {Object} args.obj The object whose nested property is to be sent to chat. 
 * @param {String} args.propertyPath The property path. 
 * @param {Actor|Item} args.parent the Item or Actor that owns the property. 
 * @param {Actor} args.actor Optional. The actor that owns the parent item. 
 * @param {CONFIG.ambersteel.visibilityModes} args.visibilityMode Optional. Sets the visibility of the chat message. 
 * @async
 */
export async function sendPropertyToChat(args = {}) {
  args = {
    obj: undefined,
    propertyPath: undefined,
    parent: undefined,
    actor: undefined,
    visibilityMode: CONFIG.ambersteel.visibilityModes.public,
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