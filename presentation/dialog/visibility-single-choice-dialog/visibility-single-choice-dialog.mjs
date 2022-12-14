import { getVisibilityModes } from '../../chat/chat-utility.mjs';
import ChoiceOption from '../../util/choice-option.mjs';
import SingleChoiceDialog from '../single-choice-dialog/single-choice-dialog.mjs';

/**
 * The localization key of the dialog title. 
 * 
 * @type {String}
 * @constant
 * @private
 */
const DIALOG_TITLE = "ambersteel.general.messageVisibility.query";

/**
 * The localization key of the choices label. 
 * 
 * @type {String}
 * @constant
 * @private
 */
const LABEL = "ambersteel.general.messageVisibility.label";

/**
 * Represents a dialog for the selection of **one** from several possible visibility modes. 
 * 
 * @extends SingleChoiceDialog
 * 
 * @property {Array<ChoiceOption>} choices A list of possible choices. 
 * * Read-only
 * @property {ChoiceOption} selected Gets or sets the currently selected choice. 
 * @property {String | undefined} localizedLabel A localized string to hint at the type of choice. 
 */
export default class VisibilitySingleChoiceDialog extends SingleChoiceDialog {
  /** @override */
  get id() { return "dialog-visibility-single-choice"; }

  /**
   * @type {Array<Object>}
   * @private
   */
  _visibilityModes = undefined;
  /**
   * Returns the visibility modes. 
   * 
   * @type {Array<Object>}
   * @readonly
   */
  get visibilityModes() {
    if (this._visibilityModes === undefined) {
      this._visibilityModes = getVisibilityModes(CONFIG);
    }
    return this._visibilityModes;
  }

  /**
   * Returns the current value of the "visibilityMode" input element. 
   * 
   * @readonly
   * @type {Object}
   */
  get visibilityMode() {
    return this.visibilityModes.find(it => it.name === this.selected.value);
  }

  /**
   * @param {Object} options 
   * @param {Boolean | undefined} options.easyDismissal If true, allows for easier dialog dismissal, 
   * by clicking anywhere on the backdrop element. Default `true`. 
   * @param {Function | undefined} options.closeCallback A function to invoke upon the closing 
   * of the dialog. Receives this dialog instance as its only argument. 
   * @param {String | undefined} options.localizedTitle Localized string for the dialog title. 
   * 
   * @param {Function | undefined} options.closeOnConfirm If set to true, the dialog will 
   * automatically close itself, if the user clicks the confirm button. Default `true`. 
   * 
   * @param {String | undefined} options.selected The initially selected choice. Defaults to the 
   * first option given. 
   * @param {String | undefined} options.localizedLabel A localized string to hint at the type of choice. 
   */
  constructor(options = {}) {
    super({...options,
      localizedTitle: options.localizedTitle ?? game.i18n.localize(DIALOG_TITLE),
      localizedLabel: options.localizedLabel ?? game.i18n.localize(LABEL),
      choices: ["_"], // Irrelevant and will be overridden, but is required by the contract. 
    });

    this.choices = this.visibilityModes.map(it => new ChoiceOption({
      value: it.name,
      localizedValue: game.i18n.localize(it.localizableName),
    }));
  }
}
