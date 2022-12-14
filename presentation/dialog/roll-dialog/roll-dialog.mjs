import GetShowFancyFontUseCase from '../../../business/use-case/get-show-fancy-font-use-case.mjs';
import { getVisibilityModes } from '../../chat/chat-utility.mjs';
import { getElementValue } from '../../sheet/sheet-utility.mjs';
import { TEMPLATES } from '../../template/templatePreloader.mjs';
import ConfirmableModalDialog from '../confirmable-modal-dialog/confirmable-modal-dialog.mjs';

/**
 * The localization key of the dialog title. 
 * 
 * @type {String}
 * @constant
 * @private
 */
const DIALOG_TITLE = "ambersteel.roll.query";

/**
 * The CSS selector of the "obstacle" input element. 
 * 
 * @type {String}
 * @readonly
 * @private
 */
const SELECTOR_OBSTACLE = ".obstacle";

/**
 * The CSS selector of the "bonusDice" input element. 
 * 
 * @type {String}
 * @readonly
 * @private
 */
const SELECTOR_BONUS_DICE = ".bonus-dice";

/**
 * The CSS selector of the "visibilityMode" input element. 
 * 
 * @type {String}
 * @readonly
 * @private
 */
const SELECTOR_VISIBILITY_MODE = ".visibilityMode";

/**
 * Represents a dialog for number selection for a dice pool roll. 
 * 
 * @extends ConfirmableModalDialog
 * 
 * @param {Number} obstacle The "obstacle" that was input. 
 * @param {Number} bonusDice The "bonusDice" that was input. 
 * @param {Object} visibilityMode The "visibilityMode" that was input. 
 */
export default class RollDialog extends ConfirmableModalDialog {
  /** @override */
  get template() { return TEMPLATES.DIALOG_ROLL; }

  /** @override */
  get id() { return "dialog-roll"; }

  /**
   * Returns the current value of the "obstacle" input element. 
   * 
   * @readonly
   * @type {Number}
   */
  get obstacle() { return parseInt(getElementValue(this._html.find(SELECTOR_OBSTACLE)[0])); }

  /**
   * Returns the current value of the "bonusDice" input element. 
   * 
   * @readonly
   * @type {Number}
   */
  get bonusDice() { return parseInt(getElementValue(this._html.find(SELECTOR_BONUS_DICE)[0])); }

  /**
   * Returns the current value of the "visibilityMode" input element. 
   * 
   * @readonly
   * @type {Object}
   */
  get visibilityMode() {
    const visibilityModeKey = parseInt(getElementValue(this._html.find(SELECTOR_VISIBILITY_MODE)[0]));
    return this._visibilityModes[visibilityModeKey];
  }

  /**
   * The visibility modes available for selection. 
   * 
   * @type {Array<Object>}
   * @private
   */
  _visibilityModes = [];
  
  /**
   * If true, will render using the "fancy font". If false, will render using the default font. 
   * 
   * @type {Boolean}
   * @private
   */
  _showFancyFont = [];

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
   */
  constructor(options = {}) {
    super({...options,
      localizedTitle: options.localizedTitle ?? game.i18n.localize(DIALOG_TITLE),
    });

    this._visibilityModes = getVisibilityModes(CONFIG);
    this._showFancyFont = new GetShowFancyFontUseCase().invoke();
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
  }

  /** @override */
  getData(options) {
    return {
      ...super.getData(options),
      showFancyFont: this._showFancyFont,
      obstacle: 0,
      bonusDice: 0,
      visibilityMode: this._visibilityModes[0],
      visibilityModes: this._visibilityModes,
    }
  }
}
