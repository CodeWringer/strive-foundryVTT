import { TEMPLATES } from "../../templatePreloader.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import * as ItemAddDialog from '../../dialog/dialog-item-add.mjs';
import { findItem, contentCollectionTypes } from '../../utils/content-utility.mjs';
import { validateOrThrow, isObject } from "../../utils/validation-utility.mjs";
import { isNotBlankOrUndefined } from "../../utils/validation-utility.mjs";

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
 * @property {String} localizableLabel The label text. 
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
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["target", "creationType"]);

    this.creationType = args.creationType;
    this.withDialog = args.withDialog ?? false;
    this.creationData = args.creationData ?? Object.create(null);
    this.localizableTitle = args.localizableTitle ?? "ambersteel.labels.add";
    this.localizableLabel = args.localizableLabel;

    if (isObject(this.creationData) !== true) {
      this.creationData = this._parseCreationData(this.creationData);
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @override
   * @see {ButtonViewModel.onClick}
   * @async
   * @throws {Error} NullPointerException - Thrown, if 'target', 'target.type' or 'creationType' is undefined. 
   * @throws {Error} InvalidArgumentException - Thrown, if trying to add a skill-ability to a non-skill-item. 
   * @throws {Error} InvalidArgumentException - Thrown, if 'creationType' is unrecognized. 
   */
  async onClick(html, isOwner, isEditable) {
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

    let createCustom = true;
    let templateId = undefined;

    // TODO: Refactor and somehow get rid of the explicit statements. 
    if (this.withDialog === true) {
      let dialogResult = undefined;
      if (this.creationType === "skill") {
        dialogResult = await ItemAddDialog.query("skill", "ambersteel.labels.skill", "ambersteel.dialog.titleSkillAddQuery");
      } else if (this.creationType === "injury") {
        dialogResult = await ItemAddDialog.query("injury", "ambersteel.labels.injury", "ambersteel.dialog.titleInjuryAddQuery");
      } else if (this.creationType === "illness") {
        dialogResult = await ItemAddDialog.query("illness", "ambersteel.labels.illness", "ambersteel.dialog.titleIllnessAddQuery");
      } else if (this.creationType === "fate-card") {
        dialogResult = await ItemAddDialog.query("fate-card", "ambersteel.fateSystem.fateCard", "ambersteel.dialog.titleFateCardAddQuery");
      } else if (this.creationType === "item") {
        dialogResult = await ItemAddDialog.query("item", "ambersteel.labels.item", "ambersteel.dialog.titleAddItemQuery");
      } else if (this.creationType === "mutation") {
        dialogResult = await ItemAddDialog.query("mutation", "ambersteel.labels.mutation", "ambersteel.dialog.titleMutationAddQuery");
      } else {
        throw new Error(`InvalidArgumentException: Invalid creationType '${this.creationType}'`);
      }

      if (!dialogResult.confirmed) return;

      createCustom = dialogResult.isCustomChecked === true;
      templateId = dialogResult.selected;
    }

    if (createCustom === true) {
      const itemData = {
        name: `New ${this.creationType.capitalize()}`,
        type: this.creationType,
        data: {
          ...this.creationData,
          isCustom: true,
        }
      };
      return await Item.create(itemData, { parent: this.target });
    } else {
      const templateItem = await findItem({ id: templateId }, contentCollectionTypes.all);
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
      const propertyValue = this._coerce(splits[i + 1]);
      parsedCreationData[propertyName] = propertyValue;
    }

    return parsedCreationData;
  }

  /**
   * Returns a parsed/coerced value, based on the given string value. 
   * @param {String} value A string value to parse/coerce. 
   * @returns {Boolean | Number | String}
   */
  _coerce(value) {
    const regexpFloat = /\d+\.\d+/;
    const regexpInt = /\d+/;
    const matchFloat = value.match(regexpFloat);
    const matchInt = value.match(regexpInt);

    if (value === "true" || value === "false") {
      return value === "true";
    } else if (matchFloat !== null && matchFloat[0].length === value.length) {
      return parseFloat(value);
    } else if (matchInt !== null && matchInt[0].length === value.length) {
      return parseInt(value);
    } else {
      return value;
    }
  }
}

Handlebars.registerHelper('createButtonAddViewModel', function(id, target, creationType, withDialog, creationData, callback, callbackData) {
  return new ButtonAddViewModel({
    id: id,
    target: target,
    creationType: creationType,
    withDialog: withDialog,
    creationData: creationData,
    callback: callback,
    callbackData: callbackData,
  });
});
Handlebars.registerPartial('buttonAdd', `{{> "${ButtonAddViewModel.TEMPLATE}"}}`);
