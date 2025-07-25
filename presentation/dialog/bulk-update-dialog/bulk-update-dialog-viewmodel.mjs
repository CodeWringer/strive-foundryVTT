import BulkDevDocumentUpdater from "../../../business/document/document-updater/bulk-dev-document-updater.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../component/button/button-viewmodel.mjs";
import InputTextFieldViewModel from "../../component/input-textfield/input-textfield-viewmodel.mjs";
import ViewModel from "../../view-model/view-model.mjs";

/**
 * Encapsulates the main migration dialog. 
 * 
 * @extends ViewModel 
 */
export default class BulkUpdateDialogViewModel extends ViewModel {
  /**
   * 
   * @param {Object} args 
   * @param {Dialog} args.ui 
   */
  constructor(args = {}) {
    super({
      ...args,
      isEditable: true,
    });
    ValidationUtil.validateOrThrow(args, ["ui"]);

    this.ui = args.ui;
    this.updater = new BulkDevDocumentUpdater();

    this.vmPackName = new InputTextFieldViewModel({
      id: "vmPackName",
      parent: this,
      value: "world.fantasy-bestiary",
    });
    this.vmProgressSection = new ViewModel({
      id: "vmProgressSection",
      parent: this,
      visible: false,
    });
    this.vmResultsSection = new ViewModel({
      id: "vmResultsSection",
      parent: this,
      visible: false,
    });
    this.vmBegin = new ButtonViewModel({
      id: "vmBegin",
      parent: this,
      localizedLabel: "Begin Update",
      showFancyFont: false,
      onClick: async () => {
        const packName = this.vmPackName.value;
        this.vmProgressSection.visible = true;
        await this.updater.updateAllSkillsOfActorsOfPack({
          packName: packName,
          onBeginDocument: (actor, currentProgress, maxProgress) => {
            this.element.find("#progress").text(currentProgress);
            this.element.find("#maxProgress").text(maxProgress);
            this.element.find("#current-document").text(actor.name);
          },
          onCompleteDocument: (actor, currentProgress, maxProgress) => {
            this.element.find("#progress").text(currentProgress);
            this.element.find("#maxProgress").text(maxProgress);
            this.element.find("#current-document").text(actor.name);
          },
          onComplete: (failureSkills, updatedActors) => {
            this.vmProgressSection.visible = false;
            this.element.find(`#${this.id}-updated-result-count`).text(updatedActors.length);
            
            const listElement = this.element.find(`#${this.id}-results-list`);
            failureSkills.forEach(failureSkill => {
              listElement.append(`<li><span>Skill: ${failureSkill.name}, id: ${failureSkill.id}</span></li>`);
            });
            this.vmResultsSection.visible = true;
          },
        });
      },
    });
  }
}
