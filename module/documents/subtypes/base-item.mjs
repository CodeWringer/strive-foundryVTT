export default class BaseItem {
    /**
     * The owning Actor object. 
     */
    owner = undefined;

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
     * 
     * @virtual
     */
    prepareData() {}

    /**
     * 
     * @param context 
     * @virtual
     */
    prepareDerivedItemData(context) {}

    /**
     * 
     * @virtual
     */
    prepareDerivedActorData(context) {}

    /**
     * 
     * @virtual
     */
    getChatData() {
        const actor = this.owner.parent;
        return { actor: actor, flavor: undefined, renderedContent: "", sound: "../sounds/notify.wav" };
    }

    /**
     * 
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