import TransientSkill from "../../../business/document/item/transient-skill.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import Component from "../../layout/component.mjs";
import HtmlComponent from "../../layout/html-component.mjs";
import DocumentPresenter from "../document-presenter.mjs";

/**
 * Presents a `TransientSkill` document in the form of a 
 * embedded list item. 
 * 
 * @property {TransientSkill} document The represented 
 * document instance. 
 * 
 * @extends DocumentPresenter
 */
export default class SkillBasePresenter extends DocumentPresenter {
  buttonConfigure = new Component({
    template: "", // TODO
    viewModelFunc: (parent, isEditable, isGM) => {
      // TODO
    },
  });

  modifiedLevel = new HtmlComponent({
    html: `<span class="pad-md font-bold">=</span><div class="custom-system-read-only pad-sm fill">${this.document.modifiedLevel}</div>`,
  });

  advancementRequirements = new HtmlComponent({
    html: `<div class="custom-system-read-only pad-sm fill">${this.document.advancementRequirements.successes} / ${this.document.advancementRequirements.failures}</div>`,
  });

  /**
   * @param {Object} args 
   * @param {TransientSkill} args.document 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;
  }
}
