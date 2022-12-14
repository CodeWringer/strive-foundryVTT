import MigratorInitiator from "../../../business/migration/migrator-initiator.mjs";
import { WorldSystemVersion } from "../../../business/migration/world-system-version.mjs";
import { TEMPLATES } from "../../template/templatePreloader.mjs";
import ModalDialog from "../modal-dialog/modal-dialog.mjs";

/**
 * Encapsulates the main migration dialog. 
 * 
 * @extends ModalDialog 
 */
export default class MigratorDialog extends ModalDialog {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 500,
      height: 300,
    });
  }

  /** @override */
  get template() { return TEMPLATES.DIALOG_MIGRATOR; }

  /** @override */
  get title() { return game.i18n.localize("ambersteel.migration.title"); }

  /** @override */
  get id() { return "migrator-dialog"; }

  constructor(options = {}) {
    super({
      ...options,
      easyDismissal: false,
    });

    this.migrator = new MigratorInitiator();

    this.worldVersionString = WorldSystemVersion.version.toString();
    this.worldVersionMigratedString = this.migrator.finalMigrationVersion.toString();
  }

  /** 
   * @override 
   * @see https://foundryvtt.com/api/classes/client.Application.html#activateListeners
   */
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
