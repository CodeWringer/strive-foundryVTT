import { TEMPLATES } from "../../../presentation/template/templatePreloader.mjs";
import MigratorInitiator from "../migrator-initiator.mjs";
import { WorldSystemVersion } from "../world-system-version.mjs";

export default class MigratorDialog extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['form'],
      popOut: true,
      template: TEMPLATES.DIALOG_MIGRATOR,
      id: 'migrator-dialog',
      title: game.i18n.localize("ambersteel.migration.title"),
      width: 500,
      height: 300,
    });
  }

  constructor() {
    super();
    this.migrator = new MigratorInitiator();

    const worldSystemVersion = new WorldSystemVersion();
    this.worldVersionString = worldSystemVersion.version.toString();
    this.worldVersionMigratedString = this.migrator.finalMigrationVersion.toString();
  }

  activateListeners(html) {
    super.activateListeners(html);

    const thiz = this;

    html.find("#field-migrationFrom").text(this.worldVersionString);
    html.find("#field-migrationTo").text(this.worldVersionMigratedString);
    
    html.find("#confirm").click(() => {
      thiz._beginMigration(html);
    });
    html.find("#cancel").click(() => {
      thiz.close();
    });
    html.find("#ok").click(() => {
      thiz.close();
    });
  }
  
  async _beginMigration(html) {
    const thiz = this;
    game.ambersteel.logger.logDebug("Commencing migration");

    html.find("#section-initial").toggleClass("hidden");
    html.find("#section-progress").toggleClass("hidden");

    try {
      await this.migrator.migrateAsPossible();
      thiz._showCompletion(html);
    } catch(e) {
      thiz._showError(html, e);
    }
  }
  
  _showError(html, e) {
    console.error(e);

    html.find("#section-progress").toggleClass("hidden");
    html.find("#section-error").toggleClass("hidden");
    html.find("#field-error").text(e.toString());
  }

  _showCompletion(html) {
    html.find("#section-progress").toggleClass("hidden");
    html.find("#section-completion").toggleClass("hidden");
  }
}

window.MigratorDialog = MigratorDialog;