import MigratorInitiator from "../../../business/migration/migrator-initiator.mjs";
import { WorldSystemVersion } from "../../../business/migration/world-system-version.mjs";
import { StringUtil } from "../../../business/util/string-utility.mjs";
import ButtonViewModel from "../../component/button/button-viewmodel.mjs";
import ViewModel from "../../view-model/view-model.mjs";

/**
 * View model for the migration dialog. 
 * 
 * @extends ViewModel 
 */
export default class MigratorDialogViewModel extends ViewModel {
  /**
   * @param {Object} args 
   * @param {Dialog} args.ui 
   */
  constructor(args = {}) {
    super({
      ...args,
      isEditable: true,
    });

    this.ui = args.ui;
    this.migrator = new MigratorInitiator();

    this.migrationFrom = WorldSystemVersion.get().toString();
    this.migrationTo = this.migrator.finalMigrationVersion.toString();

    const localizedProgressNumbers = game.i18n.localize("system.migration.progressNumbers");
    this.vmBegin = new ButtonViewModel({
      id: "vmBegin",
      parent: this,
      content: `<span>${game.i18n.localize("system.general.confirm")}</span>`,
      onClick: async() => {
        this.vmInitialSection.visible = false;
        this.vmProgressSection.visible = true;
        this.vmLogSection.visible = true;
        this.vmInitialButtonSection.visible = false;
        const log = [];
        try {
          await this.migrator.migrateAsPossible(args = {
            onBegin: (totalProgress, localizedTitle) => {
              this.vmWorkTitle.element.text(localizedTitle);
              this.vmProgressNumbers.element.text(StringUtil.format2(localizedProgressNumbers, {
                current: 0,
                total: totalProgress,
              }));
            },
            onBeginIncrement: (totalProgress, progress, localizedTitle) => {
              this.vmWorkIncrement.element.text(localizedTitle);
              this.vmProgressNumbers.element.text(StringUtil.format2(localizedProgressNumbers, {
                current: progress,
                total: totalProgress,
              }));
              const logEntry = `<li>${localizedTitle}</li>`;
              log.push(logEntry);
              this.vmLog.element.prepend(logEntry);
            },
            onCompleteIncrement: (totalProgress, progress, localizedTitle) => {
              this.vmWorkIncrement.element.text(localizedTitle);
              this.vmProgressNumbers.element.text(StringUtil.format2(localizedProgressNumbers, {
                current: progress,
                total: totalProgress,
              }));
              const logEntry = `<li>${localizedTitle}</li>`;
              log.push(logEntry);
              this.vmLog.element.prepend(logEntry);
            },
          });
          this.vmProgressSection.visible = false;
          this.vmSuccessSection.visible = true;
          this.vmCompletedButtonSection.visible = true;
        } catch (error) {
          this.vmProgressSection.visible = false;
          console.error(error);
          this.vmErrorDetails.element.text(error.toString());
          this.vmErrorSection.visible = true;
          this.vmCompletedButtonSection.visible = true;
        }
      },
    });
    this.vmCancel = new ButtonViewModel({
      id: "vmCancel",
      parent: this,
      content: `<span>${game.i18n.localize("system.general.cancel")}</span>`,
      onClick: async() => {
        this.ui.close();
      },
    });
    this.vmClose = new ButtonViewModel({
      id: "vmClose",
      parent: this,
      content: `<span>${game.i18n.localize("system.general.ok")}</span>`,
      onClick: async() => {
        this.ui.close();
      },
    });
    this.vmInitialSection = new ViewModel({
      id: "vmInitialSection",
      parent: this,
      visible: true,
    });
    this.vmProgressSection = new ViewModel({
      id: "vmProgressSection",
      parent: this,
      visible: false,
    });
    this.vmErrorSection = new ViewModel({
      id: "vmErrorSection",
      parent: this,
      visible: false,
    });
    this.vmSuccessSection = new ViewModel({
      id: "vmSuccessSection",
      parent: this,
      visible: false,
    });
    this.vmLogSection = new ViewModel({
      id: "vmLogSection",
      parent: this,
      visible: false,
    });
    this.vmInitialButtonSection = new ViewModel({
      id: "vmInitialButtonSection",
      parent: this,
      visible: true,
    });
    this.vmCompletedButtonSection = new ViewModel({
      id: "vmCompletedButtonSection",
      parent: this,
      visible: false,
    });
    
    this.vmLog = new ViewModel({
      id: "vmLog",
      parent: this,
    });
    this.vmWorkTitle = new ViewModel({
      id: "vmWorkTitle",
      parent: this,
    });
    this.vmWorkIncrement = new ViewModel({
      id: "vmWorkIncrement",
      parent: this,
    });
    this.vmProgressNumbers = new ViewModel({
      id: "vmProgressNumbers",
      parent: this,
    });
    this.vmErrorDetails = new ViewModel({
      id: "vmErrorDetails",
      parent: this,
    });
  }
}
