import { ACTOR_TYPES } from "../../../business/document/actor/actor-types.mjs";
import TransientBaseActor from "../../../business/document/actor/transient-base-actor.mjs";
import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import { GENERAL_DOCUMENT_TYPES } from "../../../business/document/general-document-types.mjs";
import { StringUtil } from "../../../business/util/string-utility.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import DynamicInputDialog from "../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import ChoiceOption from "../input-choice/choice-option.mjs";
import DocumentCreationStrategy from "./document-creation-strategy.mjs";
import DynamicInputDefinition from "../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import InputDropDownViewModel from "../input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import DynamicLabelViewModel from "../label/dynamic-label.mjs";
import { DOCUMENT_COLLECTION_SOURCES } from "../../../business/document/document-fetcher/document-collection-source.mjs";

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
   * Returns the name of the choices input that allows selection of a document collection source. 
   * 
   * @type {String}
   * @readonly
   * @protected
   */
  get nameInputCollectionSources() { return "nameInputCollectionSources"; }

  /**
   * Returns the name of the choices input. 
   * 
   * @type {String}
   * @readonly
   * @protected
   */
  get nameInputChoices() { return "nameInputChoices"; }

  /**
   * Returns the name of the label that changes based on the selected entry. 
   * 
   * @type {String}
   * @readonly
   * @protected
   */
  get nameLabel() { return "nameLabel"; }

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
   * @param {Function | undefined} args.filter A function that can filter, allowing only 
   * those documents for which it returns true to be valid choices. **Must** return a boolean
   * value. Receives arguments:
   * * `document: TransientDocument` - A document instance
   * 
   * @param {Function | undefined} args.selectionLabelMapper If not undefined, will be used 
   * to change the content's of a label based on the currently selected entry. 
   * Must return a string value. Must be async. Arguments: 
   * * `selected: ChoiceOption | undefined`
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["documentType"]);

    this._generalType = this._getIsTypeAnActor(args.documentType) ? GENERAL_DOCUMENT_TYPES.ACTOR : GENERAL_DOCUMENT_TYPES.ITEM;
    this.documentType = args.documentType;
    this.filter = args.filter ?? (() => { return true });
    this.selectionLabelMapper = args.selectionLabelMapper;

    this._collectionSource = DOCUMENT_COLLECTION_SOURCES.systemAndModuleCompendia;
  }

  /**
   * Gathers all template documents available for choosing from and returns them 
   * as a list of options. 
   * 
   * @returns {Array<ChoiceOption>} 
   * 
   * @async
   * @protected
   * @virtual
   */
  async _getChoices() {
    const documentIndices = new DocumentFetcher().getIndices({
      documentType: this._generalType,
      contentType: this.documentType,
      source: this._collectionSource,
    });

    // Load the full documents, so their detailed data can be accessed. 
    const documents = new Map;
    for (let i = 0; i < documentIndices.length; i++) {
      const id = documentIndices[i].id;
      const document = await new DocumentFetcher().find({
        id: id,
      });
      const transientDocument = document.getTransientObject();
      if (this.filter(transientDocument) === true) {
        documents.set(id, transientDocument);
      }
    }

    // Map the documents to choices. 
    const options = [];
    for (let i = 0; i < documentIndices.length; i++) {
      const documentIndex = documentIndices[i];
      const document = documents.get(documentIndex.id);
      if (!ValidationUtil.isDefined(document)) continue;
      const documentNameForDisplay = document.nameForDisplay ?? documentIndex.name;

      options.push(new ChoiceOption({
        value: documentIndex.id,
        localizedValue: `${documentNameForDisplay}   (${documentIndex.sourceName})`,
      }));
    }
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
   * @returns {Array<DynamicInputDefinition>}
   * 
   * @protected
   * @virtual
   */
  _getDialogInputs() {
    const inputs = [
      // Document collection choices input
      new DynamicInputDefinition({
        name: this.nameInputCollectionSources,
        localizedLabel: game.i18n.localize("system.general.collection"),
        template: InputDropDownViewModel.TEMPLATE,
        rememberValue: true,
        viewModelFactory: async (id, parent, overrides) => {
          const options = DOCUMENT_COLLECTION_SOURCES.asChoices();
          return new InputDropDownViewModel({
            id: id,
            parent: parent,
            options: options,
            value: options.find(it => it.value === DOCUMENT_COLLECTION_SOURCES.systemAndModuleCompendia.name),
            ...overrides,
          });
        },
        onChange: async (oldValue, newValue, dialogViewModel) => {
          this._collectionSource = DOCUMENT_COLLECTION_SOURCES.asArray().find(it => it.name === newValue.value);
          dialogViewModel.refreshInput(this.nameInputChoices);
          if (ValidationUtil.isDefined(this.selectionLabelMapper)) {
            dialogViewModel.refreshInput(this.nameLabel);
          }
        },
      }),
      // Document choices input
      new DynamicInputDefinition({
        name: this.nameInputChoices,
        localizedLabel: game.i18n.localize(`TYPES.${this._generalType}.${this.documentType}`),
        template: InputDropDownViewModel.TEMPLATE,
        viewModelFactory: async (id, parent, overrides) => {
          const sortedOptions = await this._getChoices();
          const customChoice = sortedOptions.find(it => it.value === this.customChoiceValue);
          return new InputDropDownViewModel({
            id: id,
            parent: parent,
            options: sortedOptions,
            value: customChoice,
            ...overrides,
          });
        },
        onChange: async (oldValue, newValue, dialogViewModel) => {
          const labelInst = dialogViewModel.inputInstances.find(it => it.name === this.nameLabel);

          if (!ValidationUtil.isDefined(labelInst)) return;

          const mappedLabel = await this.selectionLabelMapper(newValue);
          labelInst.viewModel.localizedLabel = mappedLabel;
        },
      }),
    ];

    if (ValidationUtil.isDefined(this.selectionLabelMapper)) {
      return inputs.concat([
        // Dynamic label
        new DynamicInputDefinition({
          name: this.nameLabel,
          template: DynamicLabelViewModel.TEMPLATE,
          viewModelFactory: async (id, parent, overrides) => {
            const mappedLabel = await this.selectionLabelMapper(undefined);
            return new DynamicLabelViewModel({
              id: id,
              parent: parent,
              localizedLabel: mappedLabel,
              ...overrides,
            });
          },
        }),
      ]);
    }

    return inputs;
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
   * @virtual
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
   * @virtual
   */
  async _getCreationData() {
    const inputDefinitions = this._getDialogInputs();

    const localizedType = game.i18n.localize(`TYPES.${this._generalType}.${this.documentType}`);
    const localizedDialogTitle = StringUtil.format(
      game.i18n.localize("system.general.add.query"),
      localizedType
    );
    const dialog = await new DynamicInputDialog({
      id: "specific-document-creation",
      localizedTitle: localizedDialogTitle,
      inputDefinitions: inputDefinitions,
    }).renderAndAwait(true);

    if (dialog.confirmed !== true) return undefined;

    return await this._parseCreationData(dialog);
  }
}
