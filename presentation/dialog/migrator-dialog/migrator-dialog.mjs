import MigratorInitiator from "../../../business/migration/migrator-initiator.mjs";
import { WorldSystemVersion } from "../../../business/migration/world-system-version.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ModalDialog from "../modal-dialog/modal-dialog.mjs";

/**
 * The localization key of the dialog title. 
 * 
 * @type {String}
 * @constant
 */
const DIALOG_TITLE = "system.migration.title";

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
      height: 330,
    });
  }

  /** @override */
  get template() { return TEMPLATES.DIALOG_MIGRATOR; }

  /** @override */
  get id() { return "migrator-dialog"; }

  /**
   * @param {Object} options 
   * @param {Boolean | undefined} options.easyDismissal If true, allows for easier dialog dismissal, 
   * by clicking anywhere on the backdrop element. Default `true`. 
   * @param {Function | undefined} options.closeCallback A function to invoke upon the closing 
   * of the dialog. Receives this dialog instance as its only argument. 
   * @param {String | undefined} options.localizedTitle Localized string for the dialog title. 
   */
  constructor(options = {}) {
    super({
      ...options,
      easyDismissal: false,
      localizedTitle: options.localizedTitle ?? game.i18n.localize(DIALOG_TITLE),
    });

    this.migrator = new MigratorInitiator();

    this.worldVersionString = WorldSystemVersion.get().toString();
    this.worldVersionMigratedString = this.migrator.finalMigrationVersion.toString();
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

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
  
  /**
   * Begins the migration process and shows its progress. 
   * 
   * @param {JQuery} html The dialog's DOM. 
   * 
   * @async
   * @private
   */
  async _beginMigration(html) {
    const thiz = this;
    game.strive.logger.logDebug("Commencing migration");

    html.find("#section-initial").toggleClass("hidden");
    html.find("#section-progress").toggleClass("hidden");

    try {
      await this.migrator.migrateAsPossible();
      thiz._showCompletion(html);
    } catch(e) {
      thiz._showError(html, e);
    }
  }
  
  /**
   * Shows elements that inform the user of the given error. 
   * 
   * @param {JQuery} html The dialog's DOM. 
   * @param {Error} e The error that occurred. 
   * 
   * @private
   */
  _showError(html, e) {
    console.error(e);

    html.find("#section-progress").toggleClass("hidden");
    html.find("#section-error").toggleClass("hidden");
    html.find("#field-error").text(e.toString());
  }

  /**
   * Shows elements that inform the user of the migration's success. 
   * 
   * @param {JQuery} html The dialog's DOM. 
   * 
   * @private
   */
  _showCompletion(html) {
    html.find("#section-progress").toggleClass("hidden");
    html.find("#section-completion").toggleClass("hidden");
  }
}
