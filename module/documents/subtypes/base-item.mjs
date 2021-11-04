import PreparedChatData from '../../dto/prepared-chat-data.mjs';

export default class BaseItem {
  /**
   * The owning Item object. 
   * @type {Item}
   */
  parent = undefined;

  /**
   * @param parent {Item} The owning Item. 
   */
  constructor(parent) {
    if (!parent || parent === undefined) {
      throw "Argument 'owner' must not be null or undefined!"
    }
    this.parent = parent;
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
  prepareData() { }

  /**
   * Prepare derived data for the item. 
   * 
   * This is where extensive calculations can occur, to ensure properties aren't 
   * undefined and have meaningful values. 
   * 
   * Derived data is *not* persisted!
   * @virtual
   */
  prepareDerivedData() { }

  /**
   * Base implementation of returning data for a chat message, based on this item. 
   * @returns {PreparedChatData}
   * @virtual
   */
  getChatData() {
    const actor = this.parent.parent;
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

  /**
   * Updates a property on the parent item, identified via the given path. 
   * @param propertyPath {String} Path leading to the property to update, on the parent item. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "data.attributes[0].value"
   * @param newValue {any} The value to assign to the property. 
   * @returns {Promise<Document>} The updated Document instance
   * @async
   * @protected
   */
  async updateProperty(propertyPath, newValue) {
    const parts = propertyPath.split(/\.|\[/);
    const lastPart = parts[parts.length - 1];

    if (parts.length == 1) {
      // example:
      // obj = { a: { b: [{c: 42}] } }
      // path: "a"
      await this.parent.update({ [propertyPath]: newValue });
    } else {
      // example:
      // obj = { a: { b: [{c: 42}] } }
      // path: "a.b[0].c"
      let prop = undefined;
      const dataDelta = this.parent.data[parts.shift()];

      for (let part of parts) {
        part = part.replace("]", "");

        if (part == lastPart) {
          prop ? prop[part] = newValue : dataDelta[part] = newValue;
        } else {
          prop = prop ? prop[part] : dataDelta[part];
        }
      }
      await this.parent.update({ data: dataDelta });
    }
  }
}