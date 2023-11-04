import { ColumnLayout, RowLayout } from "../../layout/layout.mjs";
import SkillBasePresenter from "./skill-base-presenter.mjs";

/**
 * Presents a `TransientSkill` document in the form of a 
 * dedicated sheet. 
 * 
 * @property {TransientSkill} document The represented 
 * document instance. 
 * 
 * @extends SkillBasePresenter
 */
export default class SkillSheetPresenter extends SkillBasePresenter {
  /** @override */
  getLayout() {
    return new ColumnLayout({
      content: [
        new RowLayout({
          cssClass: "header",
          content: [
            this.document.img,
            this.document.name,
            this.buttonConfigure,
            this.buttonSendToChat,
          ],
        }),
        this.document.description,
        new RowLayout({
          content: [
            this.document.relatedAttribute,
            this.document.category,
          ],
        }),
        this.document.tags,
        this.document.prerequisites,
        this.document.abilities,
      ],
    });
  }
}
