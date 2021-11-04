export default class BaseItemSheet {
  /**
   * The owning ItemSheet object. 
   * @type {ItemSheet}
   */
  parent = undefined;

  /**
   * @param parent {ItemSheet} The owning ItemSheet. 
   */
  constructor(parent) {
    if (!parent || parent === undefined) {
      throw "Argument 'owner' must not be null or undefined!"
    }
    this.parent = parent;
  }

  /**
   * Returns the template path. 
   * @returns {String} Path to the template. 
   * @virtual
   */
  get template() { 
    return "systems/ambersteel/templates/item/item-item-sheet.hbs"; 
  }

  /**
   * Returns the item object of the parent sheet. 
   * @returns {Item} The item object of the parent sheet. 
   */
  getItem() {
    return this.parent.item;
  }

  /**
   * Extends the given context object with derived data. 
   * 
   * This is where any data should be added, which is only required to 
   * display the data via the parent sheet. 
   * @param context {Object} A context data object. Some noteworthy properties are 
   * 'item', 'CONFIG', 'isSendable' and 'isEditable'. 
   * @virtual
   */
  prepareDerivedData(context) { }

  /**
   * Registers events on elements of the given DOM. 
   * @param html {Object} DOM of the sheet for which to register listeners. 
   * @param isOwner {Boolean} If true, registers events that require owner permission. 
   * @param isEditable {Boolean} If true, registers events that require editing permission. 
   * @virtual
   */
  activateListeners(html, isOwner, isEditable) {
    // Show item sheet.
    html.find(".ambersteel-item-show").click(this._onItemShow.bind(owner));

    if (!isOwner) return;
    if (!isEditable) return;

    // Add Item
    html.find('.ambersteel-item-create').click(this._onItemCreate.bind(owner));

    // Edit item. 
    html.find(".ambersteel-item-edit").change(this._onItemEdit.bind(owner));

    // Delete item. 
    html.find(".ambersteel-item-delete").click(this._onItemDelete.bind(owner));

    // Delete item. 
    html.find(".ambersteel-item-to-chat").click(this._onItemSendToChat.bind(owner));
  }

  /**
   * 
   * @param event 
   * @private
   * @async
   */
  async _onItemEdit(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const itemId = element.dataset.itemId;
    const item = this.getItem();
    const propertyPath = element.dataset.field;
    let newValue = element.value;

    if (element.tagName.toLowerCase() == "select") {
      const optionValue = element.options[element.selectedIndex].value;
      newValue = optionValue;
    }

    const parts = propertyPath.split(/\.|\[/);
    const lastPart = parts[parts.length - 1];

    if (parts.length == 1) {
      await item.update({ [propertyPath]: newValue });
    } else {
      // example:
      // obj = { a: { b: [{c: 42}] } }
      // path: a.b[0].c
      let prop = undefined;
      const dataDelta = item.data[parts.shift()];
      for (let part of parts) {
        part = part.replace("]", "");

        if (part == lastPart) {
          prop ? prop[part] = newValue : dataDelta[part] = newValue;
        } else {
          prop = prop ? prop[part] : dataDelta[part];
        }
      }
      await item.update({ data: dataDelta });
    }

    this.render();
  }

  /**
   * 
   * @param event 
   * @private
   * @async
   */
  async _onItemDelete(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const itemId = element.dataset.itemId;
    const item = this.getItem();

    await item.delete();
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   * @async
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = duplicate(header.dataset);

    // Modal dialog to enter obstacle and bonus dice. 
    const skillAddData = await SkillUtil.querySkillAddData();

    if (!skillAddData.confirmed) return;

    let imgPath = "icons/svg/item-bag.svg";
    if (type === "skill") {
      imgPath = "icons/svg/book.svg";
    } else if (type === "fate-card") {
      imgPath = "icons/svg/wing.svg";
    }

    const itemData = {
      name: `New ${type.capitalize()}`,
      type: type,
      data: data,
      img: imgPath
    };

    // Remove the type from the dataset since it's already in the 'itemData.type' property.
    delete itemData.data["type"];

    return await Item.create(itemData, { parent: this.actor ?? this.parent });
  }

  /**
   * @param event 
   * @private
   * @async
   */
  async _onItemShow(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const itemId = element.dataset.itemId;
    const item = BaseItemSheet.getItem(this, itemId);

    item.sheet.render(true);
  }

  /**
   * @param event 
   * @private
   */
  _onItemSendToChat(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const itemId = element.dataset.itemId;
    const item = BaseItemSheet.getItem(this, itemId);

    return item.sendToChat();
  }
}