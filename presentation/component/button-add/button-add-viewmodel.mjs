import { TEMPLATES } from "../../template/templatePreloader.mjs";
import ButtonViewModel from '../button/button-viewmodel.mjs';
import AddItemDialog from '../../dialog/dialog-item-add/dialog-item-add.mjs';
import { validateOrThrow, isObject, isNotBlankOrUndefined } from "../../../business/util/validation-utility.mjs";
import GetShowFancyFontUseCase from "../../../business/use-case/get-show-fancy-font-use-case.mjs";
import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import { coerce } from "../../../business/util/string-utility.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Inherited from ButtonViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {Object} target The target object to affect.  
 * 
 * --- Own properties
 * 
 * @property {Boolean} withDialog If true, will prompt the user to make a selection with a dialog. 
 * @property {String | undefined} creationType = "skill"|"skill-ability"|"fate-card"|"item"|"injury"|"illness"
 * @property {Object} creationData Data to pass to the item creation function. 
 * @property {Boolean} showLabel If true, will show the label. 
 * @property {String | undefined} localizableLabel The label text. 
 * @property {String | undefined} localizableType Localization key of the type of thing to add. 
 * @property {String | undefined} localizableDialogTitle Localization key of the title of the dialog. 
 * 
 */
export default class ButtonAddViewModel extends ButtonViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON_ADD; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get showLabel() { return isNotBlankOrUndefined(this.localizableLabel); }
  
  /**
   * @type {String}
   * @readonly
   */
  get localizedLabel() { return game.i18n.localize(this.localizableLabel); }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {Object} args.target The target object to affect. 
   * @param {Function | String | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any | undefined} args.callbackData Optional. Defines any data to pass to the completion callback. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
   * 
   * @param {String} args.creationType = "skill"|"skill-ability"|"fate-card"|"item"|"injury"|"illness"
   * @param {Boolean | undefined} args.withDialog Optional. If true, will prompt the user to make a selection with a dialog. 
   * @param {Object | String | undefined} args.creationData Optional. Data to pass to the item creation function. 
   * @param {String | undefined} args.localizableTitle Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * @param {String | undefined} args.localizableLabel Optional. The localizable label. 
   * @param {String | undefined} localizableType Localization key of the type of thing to add. 
   * @param {String | undefined} localizableDialogTitle Localization key of the title of the dialog. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["target", "creationType"]);

    this.creationType = args.creationType;
    this.withDialog = args.withDialog ?? false;
    this.creationData = args.creationData ?? Object.create(null);
    this.localizableTitle = args.localizableTitle ?? "ambersteel.general.add";
    this.localizableLabel = args.localizableLabel;
    this.localizableType = args.localizableType;
    this.localizableDialogTitle = args.localizableDialogTitle;
    this.showFancyFont = new GetShowFancyFontUseCase().invoke();

    if (isObject(this.creationData) !== true) {
      this.creationData = this._parseCreationData(this.creationData);
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * 
   * @override
   * @see {ButtonViewModel.onClick}
   * 
   * @throws {Error} NullPointerException - Thrown, if 'target', 'target.type' or 'creationType' is undefined. 
   * @throws {Error} InvalidArgumentException - Thrown, if trying to add a skill-ability to a non-skill-item. 
   * @throws {Error} InvalidArgumentException - Thrown, if 'creationType' is unrecognized. 
   */
  onClick(html, isOwner, isEditable) {
    if (isEditable !== true) return;

    if (this.target === undefined || this.target.type === undefined) {
      throw new Error("NullPointerException: 'target' or 'target.type' is undefined");
    }
    if (this.creationType === undefined) {
      throw new Error("NullPointerException: 'creationType' is undefined");
    }

    // Special case, because skill abilities aren't items - they're objects contained in an array, 
    // referenced by a property of a skill-item.
    if (this.creationType === "skill-ability") {
      if (this.target.type !== "skill") {
        throw new Error("InvalidArgumentException: Cannot add item of type 'skill-ability' to non-'skill'-type item!");
      }
      const creationData = {
        ...this.creationData,
        isCustom: true
      };
      this.target.createSkillAbility(creationData);
      return;
    }

    if (this.withDialog === true) {
      new AddItemDialog({
        itemType: this.creationType,
        localizedItemLabel: game.i18n.localize(this.localizableType),
        localizedTitle: game.i18n.localize(this.localizableDialogTitle),
        closeCallback: async (dialog) => {
          if (dialog.confirmed !== true) return;

          if (dialog.isCustomChecked === true) {
            return await this._createCustom();
          } else {
            const templateId = dialog.selected;
            const templateItem = await new DocumentFetcher().find({
              id: templateId,
            });
            const itemData = {
              name: templateItem !== undefined ? templateItem.name : `New ${this.creationType.capitalize()}`,
              type: templateItem !== undefined ? templateItem.type : this.creationType,
              data: {
                ...(templateItem !== undefined ? templateItem.data.data : {}),
                ...this.creationData,
                isCustom: false,
              }
            };
            return await Item.create(itemData, { parent: this.target });
          }
        },
      }).render(true);
    } else {
      this._createCustom();
    }
  }

  /**
   * Creates and returns a new document of the type defined on this view model and 
   * then returns it. 
   * 
   * @returns The new document instance. 
   * 
   * @async
   * @private
   */
  async _createCustom() {
    const itemData = {
      name: `New ${this.creationType.capitalize()}`,
      type: this.creationType,
      data: {
        ...this.creationData,
        isCustom: true,
      }
    };
    return await Item.create(itemData, { parent: this.target });
  }

  /**
   * Parses the given creation data representing string and returns it as an object, instead. 
   * @param {String} creationData Must be a string in the form "[<key1>:<value1>,<key2>:<value2>,...]"
   * E. g. "[value:5,flag:false]"
   * @returns {Object} The parsed creation data. 
   */
  _parseCreationData(creationData) {
    const parsedCreationData = Object.create(null);

    const splits = creationData.substring(1, creationData.length - 1).split(":");
    for (let i = 0; i < splits.length; i += 2) {
      const propertyName = splits[i];
      const propertyValue = coerce(splits[i + 1]);
      parsedCreationData[propertyName] = propertyValue;
    }

    return parsedCreationData;
  }
}

Handlebars.registerPartial('buttonAdd', `{{> "${ButtonAddViewModel.TEMPLATE}"}}`);
