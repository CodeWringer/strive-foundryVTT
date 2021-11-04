import BaseItem from "./base-item.mjs";

export default class SkillItem extends BaseItem {
  /** @override */
  get img() { return "icons/svg/book.svg"; }

  /**
   * Chat message template path. 
   * @type {String}
   */
  get chatMessageTemplate() { return "systems/ambersteel/templates/item/parts/skill.hbs"; }

  /** @override */
  prepareData() {
    this.owner.data.img = this.img;
  }

  /** @override */
  async getChatData() {
    const messageBase = super.getChatData();
    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      data: {
        _id: this.owner.id,
        name: this.owner.name,
        data: {
          description: this.owner.data.data.description,
        }
      },
      img: this.owner.img,
      isEditable: false,
      isSendable: false
    });

    return {
      ...messageBase,
      flavor: game.i18n.localize("ambersteel.labels.skill"),
      renderedContent: renderedContent
    }
  }
}
