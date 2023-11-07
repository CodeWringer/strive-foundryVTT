import { TEMPLATES } from '../../templatePreloader.mjs';
import ButtonViewModel from '../button/button-viewmodel.mjs';
import AddItemDialog from '../../dialog/dialog-item-add/dialog-item-add.mjs';
import { validateOrThrow, isObject, isNotBlankOrUndefined } from "../../../business/util/validation-utility.mjs";
import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import { coerce } from "../../../business/util/string-utility.mjs";

/**
 * A button that allows adding a newly created embedded document to a specific actor. 
 * 
 * @extends ButtonViewModel
 * 
 * @property {Boolean} withDialog If true, will prompt the user to make a selection with a dialog. 
 * @property {String | undefined} creationType = "skill"|"skill-ability"|"fate-card"|"item"|"injury"|"illness"
 * @property {Object} creationData Data to pass to the item creation function. 
 * @property {Boolean} showLabel If true, will show the label. 
 * @property {String | undefined} localizedLabel Localized label. 
 * @property {String | undefined} localizedType Localized name of the type of thing to add. 
 * @property {String | undefined} localizedDialogTitle Localized title of the dialog. 
 * 
 */
export default class ButtonAddViewModel extends ButtonViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON_ADD; }
  
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonAdd', `{{> "${ButtonAddViewModel.TEMPLATE}"}}`);
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get showLabel() { return isNotBlankOrUndefined(this.localizedLabel); }
  
  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {TransientDocument} args.target The target object to affect. 
   * @param {Function | String | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
   * 
   * @param {String} args.creationType = "skill"|"skill-ability"|"fate-card"|"item"|"injury"|"illness"
   * @param {Boolean | undefined} args.withDialog Optional. If true, will prompt the user to make a selection with a dialog. 
   * @param {Object | undefined} args.creationData Optional. Data to pass to the item creation function. 
   * @param {String | undefined} args.localizedTooltip Optional. Sets the tooltip text to display on cursor hover over the DOM element. 
   * @param {String | undefined} args.localizedLabel 
   * @param {String | undefined} args.localizedType Localized name of the type of thing to add. 
   * @param {String | undefined} args.localizedDialogTitle Localized title of the dialog. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["target", "creationType"]);

    this.creationType = args.creationType;
    this.withDialog = args.withDialog ?? false;
    this.creationData = args.creationData ?? Object.create(null);

    this.localizedTooltip = args.localizedTooltip ?? "ambersteel.general.add";
    this.localizedLabel = args.localizedLabel;
    this.localizedType = args.localizedType;
    this.localizedDialogTitle = args.localizedDialogTitle;
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
   * 
   * @async
   */
  async onClick() {
    if (this.isEditable !== true) return;

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
    } else if (this.withDialog === true) {
      this._createWithDialog();
    } else {
      const creationData = {
        name: `New ${this.creationType.capitalize()}`,
        type: this.creationType,
        system: {
          ...this.creationData,
          isCustom: true,
        }
      };
      return await Item.create(creationData, { parent: this.target.document }); // TODO #85: This should probably be extracted to the transient-type object. 
    }
  }

  /**
   * Prompts the user to pick a specific document to add to the target, via a dialog. 
   * 
   * @async
   * @private
   */
  async _createWithDialog() {
    await new AddItemDialog({
      itemType: this.creationType,
      localizedItemLabel: this.localizedType,
      localizedTitle: this.localizedDialogTitle,
      closeCallback: async (dialog) => {
        if (dialog.confirmed !== true) return;

        let creationData;

        if (dialog.isCustomChecked === true) {
          creationData = {
            name: `New ${this.creationType.capitalize()}`,
            type: this.creationType,
            system: {
              ...this.creationData,
              isCustom: true,
            }
          };
        } else {
          const templateId = dialog.selected;
          const templateItem = await new DocumentFetcher().find({
            id: templateId,
          });
          creationData = {
            name: templateItem !== undefined ? templateItem.name : `New ${this.creationType.capitalize()}`,
            type: templateItem !== undefined ? templateItem.type : this.creationType,
            system: {
              ...(templateItem !== undefined ? templateItem.system : {}),
              ...this.creationData,
              isCustom: false,
            }
          };
        }
        return await Item.create(creationData, { parent: this.target.document }); // TODO #85: This should probably be extracted to the transient-type object. 
      },
    }).renderAndAwait(true);
  }
}
