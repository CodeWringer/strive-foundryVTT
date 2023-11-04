import { ColumnLayout, RowLayout } from "../../layout/layout.mjs";
import SkillBasePresenter from "./skill-base-presenter.mjs";

/**
 * Presents a `TransientSkill` document in the form of a 
 * chat message. 
 * 
 * @property {TransientSkill} document The represented 
 * document instance. 
 * 
 * @extends SkillBasePresenter
 */
export default class SkillChatMessagePresenter extends SkillBasePresenter {
  /** @override */
  getLayout() {
    return new ColumnLayout({
      content: [
        new RowLayout({
          cssClass: "header",
          content: [
            this.document.img,
            this.document.name,
          ],
        }),
        this.document.description,
        this.document.relatedAttribute,
        this.document.category,
        this.document.prerequisites,
        this.document.abilities,
        this.document.tags,
      ],
    });
  }
}
