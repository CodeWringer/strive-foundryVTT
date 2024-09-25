import { DOCUMENT_COLLECTION_SOURCES } from "../../../business/document/document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import { ITEM_TYPES } from "../../../business/document/item/item-types.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import FoundryWrapper from "../../../common/foundry-wrapper.mjs";
import ObservableField from "../../../common/observables/observable-field.mjs";
import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputSliderViewModel from "../../component/input-slider/input-slider-viewmodel.mjs";
import { setElementValue } from "../../sheet/sheet-utility.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import DamageDesignerListItemViewModel from "./damage-designer-list-item-viewmodel.mjs";
import { DamageFinding } from "./damage-finding.mjs";

export default class DamageDesignerDialogViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.DIALOG_DICE_POOL_DESIGNER; }

  /**
   * @static
   * @readonly
   * @type {String}
   */
  static get ID_TABLE_ELEMENT() { return "table"; }

  /**
   * Observable ui state. 
   * 
   * @example
   * To update, copy the entire value object and adjust its fields: 
   * ```JS
   * this._uiState.value = {
   *   ...this._uiState.value,
   *   hitThreshold: newValue,
   * };
   * ```
   * 
   * @property {Object} value 
   * 
   * @type {Object}
   * @private
   */
  _uiState = new ObservableField({
    value: {
    }
  });

  /**
   * @type {JQuery}
   * @private
   */
  _tableElement = undefined;

  /**
   * @param {Object} args 
   * @param {Application} args.ui The dialog that owns this view model. 
   */
  constructor(args = {}) {
    super(args);

    validateOrThrow(args, ["ui"]);

    this.ui = args.ui;
    this.isEditable = true;

    this.registerViewStateProperty("_uiState");

    this._uiState.onChange(async (_1, _2, newValue) => {
      await this._updateTable();
    });

    this._updateTable();
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this._tableElement = html.find(`#${DamageDesignerDialogViewModel.ID_TABLE_ELEMENT}`);
    await this._updateTable();
  }

  /**
   * @private
   * 
   * @async
   */
  async _updateTable() {
    const damageFindings = await this._getDamageFindings();

    const damageFindingViewModels = damageFindings.map(it => 
      new DamageDesignerListItemViewModel({
        id: `damage-finding-${it.id}`,
        parent: this,
        damageFinding: it,
      })
    );

    const renderedDamageFindings = [];
    for (const viewModel of damageFindingViewModels) {
      const renderedViewModel = await viewModel.render();
      renderedDamageFindings.push(renderedViewModel);
    }

    const renderedContent = renderedDamageFindings.join("\n");
    
    // Manipulate the DOM. 
    $(this._tableElement).empty();
    $(this._tableElement).append(renderedContent);

    damageFindingViewModels.forEach(viewModel => {
      const html = $(this._tableElement).find(`#${viewModel.id}`);
      viewModel.activateListeners(html);
    });
  }

  /**
   * Gathers all skill documents and of them returns all those with at least one 
   * damage list. 
   * 
   * @returns {Array<DamageFinding>}
   * 
   * @private
   * 
   * @async
   */
  async _getDamageFindings() {
    const skillDocuments = await new DocumentFetcher().findAll({
      documentType: "Item",
      contentType: ITEM_TYPES.SKILL,
      source: DOCUMENT_COLLECTION_SOURCES.all,
      searchEmbedded: true,
      includeLocked: true,
    });

    const damageFindings = [];

    skillDocuments.forEach(skillDocument => {
      const transientSkillDocument = skillDocument.getTransientObject();

      const expertises = [];

      transientSkillDocument.expertises.forEach(expertise => {
        if (expertise.damage.length > 0) {
          const expertiseDamageFinding = new DamageFinding({
            name: expertise.name,
            id: expertise.id,
            sourceCollectionId: transientSkillDocument.id,
            damage: expertise.damage.concat([]), // Safe-copy
            expertises: [], // Expertises cannot be nested (at this time). 
            document: expertise,
          });
          expertises.push(expertiseDamageFinding);
        }
      });

      if (transientSkillDocument.damage.length > 0 || expertises.length > 0) {
        const skillDamageFinding = new DamageFinding({
          name: transientSkillDocument.name,
          id: transientSkillDocument.id,
          sourceCollectionId: skillDocument.pack,
          damage: transientSkillDocument.damage.concat([]), // Safe-copy
          expertises: expertises,
          document: transientSkillDocument,
        });
        damageFindings.push(skillDamageFinding);
      }
    });

    return damageFindings;
  }
}
