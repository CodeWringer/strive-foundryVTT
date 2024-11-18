import { GENERAL_DOCUMENT_TYPES } from "../../../business/document/general-document-types.mjs";
import { ITEM_TYPES } from "../../../business/document/item/item-types.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import SpecificDocumentCreationStrategy from "./specific-document-creation-strategy.mjs";
import DynamicInputDefinition from "../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../dialog/dynamic-input-dialog/dynamic-input-types.mjs";

/**
 * Lets the user select a specific template fate-card from a given list of options. 
 * 
 * @extends SpecificDocumentCreationStrategy
 */
export default class FateCardCreationStrategy extends SpecificDocumentCreationStrategy {
  /**
   * Returns the name of the label that changes, based on the fate-card that 
   * was selected. 
   * 
   * @type {String}
   * @readonly
   * @protected
   */
  get nameLabel() { return "nameLabel"; }
  
  /**
   * @param {Object} args 
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
   * @param {Function | undefined} args.selectionLabelMapper If not undefined, will be used 
   * to change the content's of a label based on the currently selected entry. 
   * Must return a string value. Arguments: 
   * * `selected: ChoiceOption`
   */
  constructor(args = {}) {
    super({
      ...args,
      documentType: ITEM_TYPES.FATE_CARD,
    });
    this.selectionLabelMapper = args.selectionLabelMapper;
  }

  /** @override */
  async _getDialogInputs(choices) {
    if (ValidationUtil.isDefined(this.selectionLabelMapper)) {
      const superInputs = await super._getDialogInputs(choices);
      const choicesInput = superInputs.find(it => it.name === this.nameInputChoices);

      const defaultChoice = choicesInput.defaultValue;
      const mappedLabel = await this.selectionLabelMapper(defaultChoice);

      // Override the original onChange method so it also handles updating the label. 
      choicesInput.onChange = async (_, newValue, dialogViewModel) => {
        await this.onSelectionChanged(dialogViewModel.ui, newValue, choices);

        const mappedLabel = await this.selectionLabelMapper(newValue);
        $(dialogViewModel.element).find(`#${dialogViewModel.id}-${this.nameLabel} > p`).text(mappedLabel);
      };

      return superInputs.concat([
        new DynamicInputDefinition({
          type: DYNAMIC_INPUT_TYPES.LABEL,
          name: this.nameLabel,
          localizedLabel: `<p class="font-size-default">${mappedLabel}</p>`,
          showFancyFont: false,
        }),
      ]);
    } else {
      return await super._getDialogInputs();
    }
  }
}
