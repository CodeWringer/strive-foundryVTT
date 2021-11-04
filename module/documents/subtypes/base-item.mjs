export default class BaseItem {
    /**
     * The owning Actor object or undefined, it this item is unowned. 
     * @type {Actor|undefined}
     */
    owner = undefined;

    /**
     * 
     * @param owner {Actor|undefined} The owning Actor object or undefined, it this item is unowned. 
     */
    constructor(owner) {
        this.owner = owner;
    }

    /**
     * Returns the icon image path for this type of item. 
     * @returns {String} The icon image path. 
     * @virtual
     */
    get img() { return "icons/svg/item-bag.svg"; }

    /**
     * Prepare base data for the item. 
     * 
     * This should be non-derivable data, meaning it should only prepare the data object to ensure 
     * certain properties exist and aren't undefined. 
     * This should also set primitive data, even if it is technically derived, shouldn't be any 
     * data set based on extensive calculations. Setting the 'img'-property's path, based on the object 
     * type should be the most complex a 'calculation' as it gets. 
     * 
     * Base data *is* persisted!
     * @virtual
     */
    prepareData() {}

    /**
     * Prepare derived data for the item. 
     * 
     * This is where extensive calculations can occur, to ensure properties aren't 
     * undefined and have meaningful values. 
     * 
     * Derived data is *not* persisted!
     * @virtual
     */
    prepareDerivedData() {}

    /**
     * Base implementation of returning data for a chat message, based on this item. 
     * @returns {PreparedChatData}
     * @virtual
     */
    getChatData() {
        const actor = this.owner.parent;
        return new PreparedChatData(actor, undefined, "", "../sounds/notify.wav");
    }

    /**
     * Base implementation of sending this item to the chat. 
     * @async
     * @virtual
     */
    async sendToChat() {
        const chatData = await this.getChatData();

        return ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: chatData.actor }),
            flavor: chatData.flavor,
            content: chatData.renderedContent,
            sound: chatData.sound
        });
    }
}

/**
 * Represents a data object for displaying custom chat messages. 
 */
export class PreparedChatData {
    /**
     * The actor who will act as the speaker (= sender) of the chat message. 
     * @type {Actor|undefined}
     */
    actor = undefined;

    /**
     * The flavor to display above the rendered chat message. 
     * Effectively represents an optional subtitle to display. 
     * @type {String|undefined}
     */
    flavor = undefined;

    /**
     * Path to a sound file to play, when the chat message is sent. 
     * @type {String|undefined}
     */
    sound = undefined;

    /**
     * The fully rendered HTML to display as the chat message. 
     * @type {String}
     */
    renderedContent = "";

    /**
     * 
     * @param renderedContent {String} The fully rendered HTML to display as the chat message. 
     * @param actor {Actor|undefined} The actor who will act as the speaker (= sender) of the chat message. 
     * @param flavor {String|undefined} The flavor to display above the rendered chat message. 
     * @param sound {String|undefined} Path to a sound file to play, when the chat message is sent. 
     */
    constructor(renderedContent, actor = undefined, flavor = undefined, sound = undefined) {
        this.renderedContent = renderedContent;
        this.actor = actor;
        this.flavor = flavor;
        this.sound = sound;
    }
}