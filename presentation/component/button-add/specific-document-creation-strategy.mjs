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
import { DocumentCreationStrategy } from "./document-creation-strategy.mjs";

/**
 * Lets the user select a specific template document from a given list of options. 
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
   * @param {GENERAL_DOCUMENT_TYPES} args.generalType Must be one of: `"Actor"` | `"Item"`
   * @param {ITEM_TYPES | ACTOR_TYPES} args.documentType Must be the internal type name of 
   * the type of document to create. E. g. `"skill"` or `"expertise"` or `"npc"` and so on.
   * @param {TransientBaseActor | undefined} args.target The Actor document instance on which 
   * to embed the new document instance. Note - this can only apply when `generalType` 
   * is of value `"Item"`! Otherwise, an error is thrown! 
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
    ValidationUtil.validateOrThrow(args, ["generalType", "documentType"]);

    this.generalType = args.generalType;
    this.documentType = args.documentType;
    this.target = args.target;
    this.creationDataOverrides = args.creationDataOverrides ?? Object.create(null);

    this.onSelectionChanged = args.onSelectionChanged ?? (async (dialog, selected, choices) => {});
  }

  /** @override */
  async selectAndCreate() {
    if (ValidationUtil.isDefined(this.target) && this.generalType === GENERAL_DOCUMENT_TYPES.ACTOR) {
      throw new Error("Actors can not ever be embedded");
    } else if (this._targetIsAnItem()) {
      throw new Error("Items can not be embedded on other Items.");
    }

    const creationData = await this._get();

    // If the creation data is undefined, then the user has canceled. 
    if (!ValidationUtil.isDefined(creationData)) return; // Bail out. 
    
    // Try to create the document. 
    if (this._targetIsAnActor() && this.generalType === GENERAL_DOCUMENT_TYPES.ITEM) {
      // Create embedded Item document. 
      return await Item.create(creationData, { parent: this.target.document }); 
    } else if (!ValidationUtil.isDefined(this.target) && this.generalType === GENERAL_DOCUMENT_TYPES.ITEM) {
      // Create world Item document. 
      return await Item.create(creationData, {}); 
    } else if (!ValidationUtil.isDefined(this.target) && this.generalType === GENERAL_DOCUMENT_TYPES.ACTOR) {
      // Create world Actor document. 
      return await Actor.create(creationData, {}); 
    } else {
      throw new Error("Failed to create document - bad configuration");
    }
  }

  /**
   * Returns `true`, if the `target` is an actor. 
   * 
   * @returns {Boolean}
   * 
   * @private
   */
  _targetIsAnActor() {
    if (ValidationUtil.isDefined(this.target)) {
      return this.target.document.documentName === GENERAL_DOCUMENT_TYPES.ACTOR;
    } else {
      return false;
    }
  }

  /**
   * Returns `true`, if the `target` is an item. 
   * 
   * @returns {Boolean}
   * 
   * @private
   */
  _targetIsAnItem() {
    if (ValidationUtil.isDefined(this.target)) {
      return this.target.document.documentName === GENERAL_DOCUMENT_TYPES.ITEM;
    } else {
      return false;
    }
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
      documentType: this.generalType,
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
    const localizedType = game.i18n.localize(`TYPES.${this.generalType}.${this.documentType}`);
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
          ...this.creationDataOverrides,
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
          ...this.creationDataOverrides,
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
   * @private
   */
  async _get() {
    const sortedOptions = await this._getChoices();
    const inputDefinitions = await this._getDialogInputs(sortedOptions);

    const localizedType = game.i18n.localize(`TYPES.${this.generalType}.${this.documentType}`);
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
