import ButtonViewModel from '../button/button-viewmodel.mjs';
import { isDefined, validateOrThrow } from "../../../business/util/validation-utility.mjs";
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
 * @property {Function | undefined} selectionLabelMapper If not undefined, will be used 
 * to change the content's of a label based on the currently selected entry. 
 * Must return a string value. Arguments: 
 * * `selected: Any`
 * 
 * @method onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
 * * `event: Event`
 * * `data: Item | Expertise` - The created `Item` document or `Expertise`. 
 * @method onSelectionChanged Asynchronous callback that is invoked when selection changes. Arguments: 
 * * `dialog: DynamicInputDialog`
 * * `selected: Document`. 
 * * `choices: Array<ChoiceOption>`. 
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
   * 
   * @param {Function | undefined} args.onSelectionChanged Asynchronous callback that is invoked when selection changes. Arguments: 
   * * `dialog: DynamicInputDialog`
   * * `selected: ChoiceOption`. 
   * * `choices: Array<ChoiceOption>`. 
   * @param {Function | undefined} args.selectionLabelMapper If not undefined, will be used 
   * to change the content's of a label based on the currently selected entry. 
   * Must return a string value. Arguments: 
   * * `selected: ChoiceOption`
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

    this.onSelectionChanged = args.onSelectionChanged ?? (async () => {});
    this.selectionLabelMapper = args.selectionLabelMapper;
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

      return await Item.create(creationData, { parent: this.target.document }); 
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

    const documents = new Map;
    for (let i = 0; i < documentIndices.length; i++) {
      const id = documentIndices[i].id;
      const document = await new DocumentFetcher().find({
        id: id,
      });
      documents.set(id, document);
    }

    const customChoice = new ChoiceOption({
      value: "custom",
      localizedValue: game.i18n.localize("system.general.custom"),
    });

    const options = documentIndices.map(documentIndex => {
      const document = documents.get(documentIndex.id);
      const documentNameForDisplay = ((document ?? {}).getTransientObject() ?? {}).nameForDisplay ?? documentIndex.name;

      return new ChoiceOption({
        value: documentIndex.id,
        localizedValue:  `${documentNameForDisplay}   (${documentIndex.sourceName})`,
      });
    });
    const sortedOptions = options.sort((a, b) => a.localizedValue.localeCompare(b.localizedValue));
    sortedOptions.splice(0, 0, customChoice);

    const nameLabel = "nameLabel";
    const nameInputChoices = "nameInputChoices";

    const inputDefinitions = [
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.DROP_DOWN,
        name: nameInputChoices,
        localizedLabel: this.localizedType,
        required: true,
        defaultValue: customChoice,
        specificArgs: {
          options: sortedOptions,
        },
        onChange: async (_, newValue, dialogViewModel) => {
          await this.onSelectionChanged(newValue, sortedOptions, dialogViewModel);

          if (isDefined(this.selectionLabelMapper)) {
            const mappedLabel = await this.selectionLabelMapper(newValue);
            $(dialogViewModel.element).find(`#${dialogViewModel.id}-${nameLabel} > p`).text(mappedLabel);
          }
        }
      }),
    ];

    if (isDefined(this.selectionLabelMapper)) {
      const mappedLabel = await this.selectionLabelMapper(customChoice);

      inputDefinitions.push(
        new DynamicInputDefinition({
          type: DYNAMIC_INPUT_TYPES.LABEL,
          name: nameLabel,
          localizedLabel: `<p class="font-size-default">${mappedLabel}</p>`,
          showFancyFont: false,
        })
      );
    }

    const dialog = await new DynamicInputDialog({
      localizedTitle: this.localizedDialogTitle,
      inputDefinitions: inputDefinitions,
    }).renderAndAwait(true);

    if (dialog.confirmed !== true) return undefined;

    const selectedValue = dialog[nameInputChoices].value;
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
