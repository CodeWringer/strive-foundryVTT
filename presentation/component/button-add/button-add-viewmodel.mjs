import ButtonViewModel from '../button/button-viewmodel.mjs';
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import DynamicInputDialog from '../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs';
import DynamicInputDefinition from '../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs';
import { DYNAMIC_INPUT_TYPES } from '../../dialog/dynamic-input-dialog/dynamic-input-types.mjs';
import ChoiceOption from '../input-choice/choice-option.mjs';
import Expertise from '../../../business/document/item/skill/expertise.mjs';
import { ITEM_TYPES } from '../../../business/document/item/item-types.mjs';

/**
 * A button that allows adding a newly created embedded document to a specific actor. 
 * 
 * @extends ButtonViewModel
 * 
 * @property {Boolean} withDialog If true, will prompt the user to make a selection with a dialog. 
 * @property {String} creationType Must be the internal type name of the type of document to create. 
 * E. g. `"skill"` or `"expertise"` or `"npc"` and so on.
 * @property {Object} creationData Data to pass to the item creation function. 
 * @property {String | undefined} localizedType Localized name of the type of thing to add. 
 * @property {String | undefined} localizedDialogTitle Localized title of the dialog. 
 * 
 * @method onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
 * * `event: Event`
 * * `data: Item | Expertise` - The created `Item` document or `Expertise`. 
 */
export default class ButtonAddViewModel extends ButtonViewModel {
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonAdd', `{{> "${super.TEMPLATE}"}}`);
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, will be interactible. 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.localizedLabel A localized text to 
   * display as a button label. 
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
   * * `event: Event`
   * * `data: Item | Expertise` - The created `Item` document or `Expertise`. 
   * 
   * @param {TransientDocument} args.target The target object to affect. 
   * @param {String} args.creationType Must be the internal type name of the type of document to create. 
   * E. g. `"skill"` or `"expertise"` or `"npc"` and so on.
   * @param {Boolean | undefined} args.withDialog If true, will prompt the user to make a selection with a dialog. 
   * * default `false`
   * @param {Object | undefined} args.creationData Data to pass to the item creation function. 
   * @param {String | undefined} args.localizedType Localized name of the type of thing to add. 
   * @param {String | undefined} args.localizedDialogTitle Localized title of the dialog. 
   */
  constructor(args = {}) {
    super({
      ...args,
      iconHtml: '<i class="fas fa-plus"></i>',
      localizedLabel: args.localizedLabel,
      localizedToolTip: args.localizedToolTip ?? game.i18n.localize("system.general.add"),
    });
    validateOrThrow(args, ["target", "creationType"]);

    this.target = args.target;
    this.creationType = args.creationType;
    this.withDialog = args.withDialog ?? false;
    this.creationData = args.creationData ?? Object.create(null);
    this.localizedType = args.localizedType;
    this.localizedDialogTitle = args.localizedDialogTitle;
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * 
   * @param {Event} event
   * 
   * @returns {Item | Expertise} The created `Item` document or `Expertise`. 
   * 
   * @throws {Error} NullPointerException - Thrown, if 'target', 'target.type' or 'creationType' is undefined. 
   * @throws {Error} InvalidArgumentException - Thrown, if trying to add an expertise to a non-skill-item. 
   * @throws {Error} InvalidArgumentException - Thrown, if 'creationType' is unrecognized. 
   * 
   * @async
   * @protected
   * @override
   */
  async _onClick(event) {
    if (this.isEditable !== true) return;

    if (this.target === undefined || this.target.type === undefined) {
      throw new Error("NullPointerException: 'target' or 'target.type' is undefined");
    }
    if (this.creationType === undefined) {
      throw new Error("NullPointerException: 'creationType' is undefined");
    }

    // Special case, because expertises aren't items - they're objects contained in an array, 
    // referenced by a property of a skill-item.
    if (this.creationType === ITEM_TYPES.EXPERTISE) {
      if (this.target.type !== ITEM_TYPES.SKILL) {
        throw new Error("InvalidArgumentException: Cannot add item of type 'expertise' to non-'skill'-type item!");
      }
      const creationData = {
        ...this.creationData,
        isCustom: true
      };
      return await this.target.createExpertise(creationData);
    } else {
      let creationData;

      if (this.withDialog === true) {
        creationData = await this._getCreationDataWithDialog();
      } else {
        creationData = {
          name: `New ${this.creationType.capitalize()}`,
          type: this.creationType,
          system: {
            ...this.creationData,
            isCustom: true,
          }
        };
      }

      // Check if the user canceled. 
      if (creationData === undefined) return;

      return await Item.create(creationData, { parent: this.target.document }); // TODO #85: This should probably be extracted to the transient-type object. 
    }
  }

  /**
   * Prompts the user to pick a specific document to add to the target, 
   * via a dialog and returns the creation data of the selected document. 
   * 
   * @returns {Object | undefined} The creation data the user implicitly picked. 
   * Returns `undefined`, if the user canceled. 
   * 
   * @async
   * @private
   */
  async _getCreationDataWithDialog() {
    const documentIndices = new DocumentFetcher().getIndices({
      documentType: "Item",
      contentType: this.creationType,
    });

    const customChoice = new ChoiceOption({
      value: "custom",
      localizedValue: game.i18n.localize("system.general.custom"),
    });

    const options = documentIndices.map(documentIndex => 
      new ChoiceOption({
        value: documentIndex.id,
        localizedValue: `${documentIndex.name} (${documentIndex.sourceName})`,
      })
    ).sort((a, b) => a.localizedValue.localeCompare(b.localizedValue));
    options.splice(0, 0, customChoice);

    const inputChoices = "inputChoices";
    const dialog = await new DynamicInputDialog({
      localizedTitle: this.localizedDialogTitle,
      inputDefinitions: [
        new DynamicInputDefinition({
          type: DYNAMIC_INPUT_TYPES.DROP_DOWN,
          name: inputChoices,
          localizedLabel: this.localizedType,
          required: true,
          defaultValue: customChoice,
          specificArgs: {
            options: options,
          },
        }),
      ],
    }).renderAndAwait(true);

    if (dialog.confirmed !== true) return undefined;

    const selectedValue = dialog[inputChoices].value;
    let creationData;
    if (selectedValue === customChoice.value) {
      creationData = {
        name: `New ${this.creationType.capitalize()}`,
        type: this.creationType,
        system: {
          ...this.creationData,
          isCustom: true,
        }
      };
    } else {
      const templateItem = await new DocumentFetcher().find({
        id: selectedValue,
      });
      if (templateItem === undefined) {
        throw new Error("Template item could not be found");
      }
      creationData = {
        name: templateItem.name,
        type: templateItem.type,
        system: {
          ...templateItem.system,
          ...this.creationData,
          isCustom: false,
        }
      };
    }

    return creationData;
  }
}
