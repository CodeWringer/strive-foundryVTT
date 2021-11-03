import BaseItem from "./base-item.mjs";

export default class FateCardItem extends BaseItem {
    /** @override */
    get img() { return "icons/svg/wing.svg"; }

    async getChatData() {
        const messageBase = super.getChatData();
        const messageTemplate = "systems/ambersteel/templates/item/parts/fate-card.hbs";
        const renderedContent = await renderTemplate(messageTemplate, {
            data: {
                _id: this.owner.id,
                name: this.owner.name,
                data: {
                    description: this.owner.data.data.description,
                }
            },
            img: this.owner.img,
            isEditable: false
        });

        return {
            ...messageBase,
            flavor: game.i18n.localize("ambersteel.fateSystem.fateCard"),
            renderedContent: renderedContent
        }
    }
}
