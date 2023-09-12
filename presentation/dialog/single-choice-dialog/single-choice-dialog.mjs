import GetShowFancyFontUseCase from '../../../business/use-case/get-show-fancy-font-use-case.mjs';
import { validateOrThrow } from '../../../business/util/validation-utility.mjs';
import ChoiceOption from '../../component/input-choice/choice-option.mjs';
import { setSelectedOptionByValue } from '../../sheet/sheet-utility.mjs';
import { getElementValue } from '../../sheet/sheet-utility.mjs';
import { TEMPLATES } from '../../templatePreloader.mjs';
import ConfirmableModalDialog from '../confirmable-modal-dialog/confirmable-modal-dialog.mjs';

/**
 * The localization key of the dialog title. 
 * 
 * @type {String}
 * @constant
 * @private
 */
const DIALOG_TITLE = "ambersteel.general.select";

/**
 * The CSS selector of the drop-down element. 
 * 
 * @type {String}
 * @readonly
 * @private
 */
const SELECTOR_ITEM_SELECT = ".ambersteel-item-select";

/**
 * Represents a dialog for the selection of **one** from several possible choices. 
 * 
 * @extends ConfirmableModalDialog
 * 
 * @property {Array<ChoiceOption>} choices A list of possible choices. 
 * * Read-only
 * @property {ChoiceOption} selected Gets or sets the currently selected choice. 
 * @property {String | undefined} localizedLabel A localized string to hint at the type of choice. 
 */
export default class SingleChoiceDialog extends ConfirmableModalDialog {
  /** @override */
  get template() { return TEMPLATES.DIALOG_SINGLE_CHOICE; }

  /** @override */
  get id() { return "dialog-single-choice"; }

  /**
   * A list of possible choices. 
   * 
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  choices = [];

  /**
   * Returns the currently selected choice. 
   * 
   * @type {ChoiceOption}
   */
  get selected() { 
    const choiceKey = getElementValue(this._html.find(SELECTOR_ITEM_SELECT));
    return this.choices.find(it => it.value == choiceKey);
  }
  /**
   * Sets the currently selected choice, based on the given value. 
   * 
   * @param {ChoiceOption} value The value to set. 
   */
  set selected(value) {
    setSelectedOptionByValue(this._html.find(SELECTOR_ITEM_SELECT), value.value);
  }

  /**
   * The value to set initially. 
   * 
   * @type {ChoiceOption}
   * @private
   */
  _initialValue = undefined;

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
   * 
   * @param {Array<ChoiceOption>} options.choices A list of possible choices. 
   * @param {ChoiceOption | undefined} options.selected The initially selected choice. Defaults to the 
   * first option given. 
   * @param {String | undefined} options.localizedLabel A localized string to hint at the type of choice. 
   */
  constructor(options = {}) {
    super({...options,
      localizedTitle: options.localizedTitle ?? game.i18n.localize(DIALOG_TITLE),
    });

    validateOrThrow(options, ["choices"]);

    this.choices = options.choices;
    this._initialValue = options.selected ?? options.choices[0];
    this.localizedLabel = options.localizedLabel;

    this._showFancyFont = new GetShowFancyFontUseCase().invoke();
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.selected = this._initialValue;
  }

  /** @override */
  getData(options) {
    return {
      ...super.getData(options),
      showFancyFont: this._showFancyFont,
      localizedLabel: this.localizedLabel,
      choices: this.choices,
      selected: this._initialValue,
    }
  }
}
