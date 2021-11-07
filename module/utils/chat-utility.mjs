import { showDialog } from "./dialog-utility.mjs";
import { getElementValue } from "./sheet-utility.mjs";

/**
 * Creates a new ChatMessage to display the given contents
 * @param chatData 
 */
export function sendToChat(chatData = { 
    speaker: undefined,
    renderedContent: "",
    flavor: undefined,
    actor: {},
    sound: "../sounds/notify.wav",
    visibilityMode: CONFIG.ambersteel.visibilityModes.public
    }) {
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
 * @returns {CONFIG.ambersteel.visibilityModes}
 */
export function queryVisibilityMode() {
    const dialogTemplate = "systems/ambersteel/templates/dialog/visibility-dialog.hbs";
    const dialogData = {
        visibilityMode: CONFIG.ambersteel.visibilityModes.public
    };

    return new Promise(async (resolve, reject) => {
        const result = await showDialog({ dialogTemplate: dialogTemplate, localizableTitle: "ambersteel.dialog.titleVisibility" }, dialogData);
        resolve({
            visibilityMode: getElementValue(result.html.find(".visibilityMode")[0]),
            confirmed: result.confirmed
        });
    });
}