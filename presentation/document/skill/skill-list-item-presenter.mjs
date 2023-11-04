import { ColumnLayout, RowLayout } from "../../layout/layout.mjs";
import SkillBasePresenter from "./skill-base-presenter.mjs";

/**
 * Presents a `TransientSkill` document in the form of a 
 * embedded list item. 
 * 
 * @property {TransientSkill} document The represented 
 * document instance. 
 * 
 * @extends SkillBasePresenter
 */
export default class SkillListItemPresenter extends SkillBasePresenter {
  /** @override */
  getLayout() {
    return new ColumnLayout({
      content: [
        new RowLayout({
          cssClass: "header",
          content: [
            this.buttonSendToChat,
            this.document.img,
            this.document.name,
            this.buttonConfigure,
            this.buttonDelete,
          ],
        }),
        new RowLayout({
          content: [
            this.document.level,
            this.document.levelModifier,
            this.modifiedLevel,
            this.advancementRequirements,
            this.document.progressSuccesses,
            this.document.progressFailures,
          ],
        }),
        this.document.description,
        new RowLayout({
          content: [
            this.document.relatedAttribute,
            this.document.category,
          ],
        }),
        this.document.prerequisites,
        this.document.tags,
        this.document.abilities,
      ],
    });
  }
}
