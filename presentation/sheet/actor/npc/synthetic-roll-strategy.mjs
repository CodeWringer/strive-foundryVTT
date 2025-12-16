import TransientBaseActor from "../../../../business/document/actor/transient-base-actor.mjs";
import { DOCUMENT_COLLECTION_SOURCES } from "../../../../business/document/document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "../../../../business/document/document-fetcher/document-fetcher.mjs";
import { GENERAL_DOCUMENT_TYPES } from "../../../../business/document/general-document-types.mjs";
import { ITEM_TYPES } from "../../../../business/document/item/item-types.mjs";
import Ruleset from "../../../../business/ruleset/ruleset.mjs";
import { Search, SEARCH_MODES, SearchItem } from "../../../../business/search/search.mjs";
import { ArrayUtil } from "../../../../business/util/array-utility.mjs";
import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";
import ChoiceOption from "../../../component/input-choice/choice-option.mjs";
import InputDropDownViewModel from "../../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputSearchTextViewModel from "../../../component/input-search/input-search-viewmodel.mjs";
import DynamicInputDefinition from "../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";

/**
 * Lets the user select a specific Skill document, which will then be rolled, but without it being 
 * present on the character. 
 */
export default class SyntheticRollStrategy {
  /**
   * @param {Object} args 
   * @param {TransientBaseActor} args.target The Actor document instance for which 
   * to do the roll. 
   * @param {Function | undefined} args.filter A function that can filter, allowing only 
   * those documents for which it returns true to be valid choices. **Must** return a boolean
   * value. Receives arguments:
   * * `document: TransientDocument` - A document instance
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["target"]);

    this.target = args.target;
    this.filter = args.filter ?? (() => { return true });

    this._collectionSource = DOCUMENT_COLLECTION_SOURCES.systemAndModuleCompendia;
    this._searchTerm = "";
    this._choicesCache = new Map();
  }

  /**
   * Prompts the user for a Skill and roll data and then performs the roll. 
   */
  async prompt() {
    const dialog = await new DynamicInputDialog({
      id: "synthetic-roll-strategy",
      easyDismissal: true,
      localizedTitle: game.i18n.localize("system.roll.syntheticSkill"),
      inputDefinitions: [
        // Document collection choices input
        new DynamicInputDefinition({
          name: "collection",
          localizedLabel: game.i18n.localize("system.general.collection"),
          template: InputDropDownViewModel.TEMPLATE,
          rememberValue: true,
          viewModelFactory: async (id, parent, overrides) => {
            const options = DOCUMENT_COLLECTION_SOURCES.asChoices();
            if (ValidationUtil.isDefined(overrides.value)) {
              this._collectionSource = DOCUMENT_COLLECTION_SOURCES.asArray().find(it => it.name === overrides.value.value);
            }
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
            dialogViewModel.refreshInput("choices");
          },
        }),
        // Search
        new DynamicInputDefinition({
          name: "search",
          rememberValue: true,
          template: InputSearchTextViewModel.TEMPLATE,
          viewModelFactory: async (id, parent, overrides) => {
            return new InputSearchTextViewModel({
              id: id,
              parent: parent,
              value: this._searchTerm,
              localizedPlaceholder: game.i18n.localize("system.character.skill.search"),
              ...overrides,
            });
          },
          onChange: async (_, newValue, dialogViewModel) => {
            this._searchTerm = newValue;
            dialogViewModel.refreshInput("choices");
          },
        }),
        // Document choices input
        new DynamicInputDefinition({
          name: "choices",
          localizedLabel: game.i18n.localize(`TYPES.Item.skill`),
          template: InputDropDownViewModel.TEMPLATE,
          viewModelFactory: async (id, parent, overrides) => {
            const options = await this._getChoices();
            return new InputDropDownViewModel({
              id: id,
              parent: parent,
              options: options,
              ...overrides,
            });
          },
        }),
      ],
    }).renderAndAwait(true);

    if (!dialog.confirmed) return;

    const skill = await new DocumentFetcher().find({
      id: dialog["choices"].value,
    });
    if (skill === undefined) {
      throw new Error("Document could not be found");
    }

    const transientSkill = skill.getTransientObject();

    const rollSchema = new Ruleset().getSkillRollSchema({
      owningDocumentOverride: this.target,
    });
    const queriedRollData = await rollSchema.queryRollData(transientSkill);
    if (!ValidationUtil.isDefined(queriedRollData)) return; // User canceled. 
    const rollData = await rollSchema.getRollData(transientSkill, queriedRollData);
    const rollResult = await rollData.roll();
    await rollResult.sendToChat({
      visibilityMode: queriedRollData.visbilityMode,
      actor: this.target,
      primaryImage: transientSkill.img,
      primaryTitle: transientSkill.name,
      secondaryImage: this.target.img,
      secondaryTitle: this.target.name,
    });
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
    // Always prefer cached choices, so as to avoid unnecessarily loading the documents again, 
    // which is costly. 
    let choices = this._choicesCache.get(this._collectionSource.name);

    if (!ValidationUtil.isDefined(choices)) {
      // Load all documents that can be found in the collection source. 

      const documentIndices = new DocumentFetcher().getIndices({
        documentType: GENERAL_DOCUMENT_TYPES.ITEM,
        contentType: ITEM_TYPES.SKILL,
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
      choices = options.sort((a, b) => a.localizedValue.localeCompare(b.localizedValue));
      this._choicesCache.set(this._collectionSource.name, choices);
    }

    if (this._searchTerm.length > 0) {
      // Filter
      const searchItems = choices.map(choice => new SearchItem({
        id: choice.value,
        term: choice.localizedValue,
      }));
      const results = new Search().search(searchItems, this._searchTerm, SEARCH_MODES.STRICT_CASE_INSENSITIVE);
      return ArrayUtil.arrayTakeWhen(choices, ((choice) => {
        const searchResult = results.find(it => it.term === choice.localizedValue);
        return searchResult.score > 0;
      }));
    } else {
      return choices;
    }
  }
}
