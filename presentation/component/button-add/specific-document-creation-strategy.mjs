import { ACTOR_TYPES } from "../../../business/document/actor/actor-types.mjs";
import TransientBaseActor from "../../../business/document/actor/transient-base-actor.mjs";
import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import { GENERAL_DOCUMENT_TYPES } from "../../../business/document/general-document-types.mjs";
import { StringUtil } from "../../../business/util/string-utility.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import DynamicInputDefinition from "../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../dialog/dynamic-input-dialog/dynamic-input-types.mjs";
import ChoiceOption from "../input-choice/choice-option.mjs";
import DocumentCreationStrategy from "./document-creation-strategy.mjs";

/**
 * Lets the user select a specific template document from a given list of options. 
 * 
 * @property {String} localizedSelectionType The localized type of document 
 * that is rollable. E. g. `"Injury"`. 
 * @property {TransientBaseActor | undefined} target The Actor document instance on which 
 * to embed the new document instance. 
 * @property {Object | undefined} creationDataOverrides Overrides applied to the selected 
 * creation data. Can be used to override a specific property, while leaving 
 * the others untouched. For example, to set a starting level for a skill Item. 
 * 
 * @extends DocumentCreationStrategy
 */
export default class SpecificDocumentCreationStrategy extends DocumentCreationStrategy {
  
  /**
   * Returns the name of the choices input. 
   * 
   * @type {String}
   * @readonly
   * @protected
   */
  get nameInputChoices() { return "nameInputChoices"; }

  /**
   * Returns the value of the custom choice. Can be used to identify this choice 
   * in the list of choices. 
   * 
   * @type {String}
   * @readonly
   * @protected
   */
  get customChoiceValue() { return "custom"; }

  /**
   * @param {Object} args 
   * @param {ITEM_TYPES | ACTOR_TYPES} args.documentType Must be the internal type name of 
   * the type of document to create. E. g. `"skill"` or `"expertise"` or `"npc"` and so on.
   * @param {TransientBaseActor | undefined} args.target The Actor document instance on which 
   * to embed the new document instance. Note it is only possible to nest Items in Actors. 
   * @param {Object | undefined} args.creationDataOverrides Overrides applied to the selected 
   * creation data. Can be used to override a specific property, while leaving 
   * the others untouched. For example, to set a starting level for a skill Item. 
   * 
   * @param {Function | undefined} args.onSelectionChanged Asynchronous callback that is 
   * invoked when selection changes. Arguments: 
   * * `dialog: DynamicInputDialog`
   * * `selected: Document`. 
   * * `choices: Array<ChoiceOption>`. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["documentType"]);

    this._generalType = this._getIsTypeAnActor(args.documentType) ? GENERAL_DOCUMENT_TYPES.ACTOR : GENERAL_DOCUMENT_TYPES.ITEM;
    this.documentType = args.documentType;

    this.onSelectionChanged = args.onSelectionChanged ?? (async (dialog, selected, choices) => {});
  }

  /**
   * Gathers all template documents available for choosing from and returns them 
   * as a list of options. 
   * 
   * @returns {Array<ChoiceOption>} 
   * 
   * @async
   * @protected
   */
  async _getChoices() {
    const documentIndices = new DocumentFetcher().getIndices({
      documentType: this._generalType,
      contentType: this.documentType,
    });

    const documents = new Map;
    // Load the full documents, so their detailed data can be accessed. 
    for (let i = 0; i < documentIndices.length; i++) {
      const id = documentIndices[i].id;
      const document = await new DocumentFetcher().find({
        id: id,
      });
      documents.set(id, document);
    }
    
    // Map the documents to choices. 
    const options = documentIndices.map(documentIndex => {
      const document = documents.get(documentIndex.id);
      const documentNameForDisplay = ((document ?? {}).getTransientObject() ?? {}).nameForDisplay ?? documentIndex.name;
      
      return new ChoiceOption({
        value: documentIndex.id,
        localizedValue: `${documentNameForDisplay}   (${documentIndex.sourceName})`,
      });
    });
    const sortedOptions = options.sort((a, b) => a.localizedValue.localeCompare(b.localizedValue));

    // Insert "custom" choice. 
    const customChoice = new ChoiceOption({
      value: this.customChoiceValue,
      localizedValue: game.i18n.localize("system.general.custom"),
    });
    sortedOptions.splice(0, 0, customChoice);

    return sortedOptions;
  }

  /**
   * Prepares and returns the dynamic dialog input definitions. 
   * 
   * @param {Array<ChoiceOption>} choices 
   * 
   * @returns {Array<DynamicInputDefinition>}
   * 
   * @async
   * @protected
   */
  async _getDialogInputs(choices) {
    const localizedType = game.i18n.localize(`TYPES.${this._generalType}.${this.documentType}`);
    const customChoice = choices.find(it => it.value === this.customChoiceValue);
    
    return [
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.DROP_DOWN,
        name: this.nameInputChoices,
        localizedLabel: localizedType,
        required: true,
        defaultValue: customChoice,
        specificArgs: {
          options: choices,
        },
        onChange: async (_, newValue, dialogViewModel) => {
          await this.onSelectionChanged(dialogViewModel.ui, newValue, choices);
        }
      }),
    ];
  }

  /**
   * Parses the creation data from the dialog and returns it. 
   * 
   * @param {DynamicInputDialog} dialog The dialog instance to parse from. 
   * 
   * @returns {Object} The creation data. 
   * 
   * @async
   * @protected
   */
  async _parseCreationData(dialog) {
    const selectedValue = dialog[this.nameInputChoices];
    if (selectedValue.value === this.customChoiceValue) {
      return {
        name: `New ${this.documentType.capitalize()}`,
        type: this.documentType,
        system: {
          isCustom: true,
        }
      };
    } else {
      const templateItem = await new DocumentFetcher().find({
        id: selectedValue.value,
      });
      if (templateItem === undefined) {
        throw new Error("Template item could not be found");
      }
      return {
        name: templateItem.name,
        type: templateItem.type,
        system: {
          ...templateItem.system,
          isCustom: false,
        }
      };
    }
  }

  /**
   * Prompts for and returns the creation data. 
   * 
   * @returns {Object} 
   * 
   * @async
   * @override
   */
  async _getCreationData() {
    const sortedOptions = await this._getChoices();
    const inputDefinitions = await this._getDialogInputs(sortedOptions);

    const localizedType = game.i18n.localize(`TYPES.${this._generalType}.${this.documentType}`);
    const localizedDialogTitle = StringUtil.format(
      game.i18n.localize("system.general.add.query"),
      localizedType
    );
    const dialog = await new DynamicInputDialog({
      localizedTitle: localizedDialogTitle,
      inputDefinitions: inputDefinitions,
    }).renderAndAwait(true);

    if (dialog.confirmed !== true) return undefined;

    return await this._parseCreationData(dialog);
  }
}
