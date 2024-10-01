import TransientBaseCharacterActor from "../../../business/document/actor/transient-base-character-actor.mjs";
import { DOCUMENT_COLLECTION_SOURCES } from "../../../business/document/document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import { ITEM_TYPES } from "../../../business/document/item/item-types.mjs";
import { isDefined, validateOrThrow } from "../../../business/util/validation-utility.mjs";
import FoundryWrapper from "../../../common/foundry-wrapper.mjs";
import ObservableField from "../../../common/observables/observable-field.mjs";
import InputRadioButtonGroupViewModel from "../../component/input-choice/input-radio-button-group/input-radio-button-group-viewmodel.mjs";
import StatefulChoiceOption from "../../component/input-choice/stateful-choice-option.mjs";
import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputSliderViewModel from "../../component/input-slider/input-slider-viewmodel.mjs";
import { setElementValue } from "../../sheet/sheet-utility.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import DamageFindingHierarchy from "./damage-finding-hierarchy.mjs";
import DamageFindingListItemViewModel from "./damage-finding-list-item-viewmodel.mjs";
import { DamageFinding } from "./damage-finding.mjs";
import DamageHierarchyListItemViewModel from "./damage-hierarchy-list-item-viewmodel.mjs";

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
      activeListStyling: LIST_STYLING.HIERARCHY,
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

    const listSortingOptions = [
      new StatefulChoiceOption({
        value: LIST_STYLING.HIERARCHY,
        activeHtml: `<i class="ico ico-list-hierarchical-solid interactible active"></i>`,
        inactiveHtml: `<i class="ico ico-list-hierarchical-solid interactible"></i>`,
      }),
      new StatefulChoiceOption({
        value: LIST_STYLING.FLAT,
        activeHtml: `<i class="ico ico-list-flat-solid interactible active"></i>`,
        inactiveHtml: `<i class="ico ico-list-flat-solid interactible"></i>`,
      }),
    ];
    this.vmListViewSelection = new InputRadioButtonGroupViewModel({
      id: "vmListViewSelection",
      parent: this,
      options: listSortingOptions,
      value: listSortingOptions.find(it => it.value === this._uiState.value.activeListStyling),
      onChange: (oldValue, newValue) => {
        this._uiState.value = {
          ...this._uiState.value,
          activeListStyling: newValue.value,
        };
      },
    });

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
    const findings = await this._getDamageFindings();

    let renderedContent = "";
    let viewModels = [];

    if (this._uiState.value.activeListStyling === LIST_STYLING.FLAT) {
      viewModels = findings.flat.map(it =>
        new DamageFindingListItemViewModel({
          id: `finding-${it.id}`,
          parent: this,
          damageFinding: it,
        })
      );

      const renderedDamageFindings = [];
      for (const viewModel of viewModels) {
        const renderedViewModel = await viewModel.render();
        renderedDamageFindings.push(renderedViewModel);
      }

      renderedContent = renderedDamageFindings.join("\n");
    } else { // Hierarchical view
      for await (const subHierarchy of findings.hierarchy.subHierarchies) {
        const vm = new DamageHierarchyListItemViewModel({
          id: subHierarchy.id,
          parent: this,
          hierarchy: subHierarchy,
        });
        viewModels.push(vm);
        const renderedSubHierarchy = await vm.render();
        renderedContent = `${renderedContent}\n${renderedSubHierarchy}`
      }
    }

    // Manipulate the DOM. 
    $(this._tableElement).empty();
    $(this._tableElement).append(renderedContent);

    viewModels.forEach(viewModel => {
      const html = $(this._tableElement).find(`#${viewModel.id}`);
      viewModel.activateListeners(html);
    });
  }

  /**
   * Gathers all skill documents and Expertises and of them returns all 
   * those with at least one damage list. 
   * 
   * @returns {Object} Properties:
   * * `flat: Array<DamageFinding>`
   * * `hierarchy: DamageFindingHierarchy`
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

    const flat = [];
    // Collection -> [actor -> ]skill -> Expertise
    const rootHierarchy = new DamageFindingHierarchy({
      id: "root",
      name: "root",
    });

    skillDocuments.forEach(skillDocument => {
      const transientSkillDocument = skillDocument.getTransientObject();

      let collectionHierarchy;
      let actorHierarchy;
      if (isDefined(transientSkillDocument.owningDocument)) { // Skill is embedded on actor. 
        collectionHierarchy = this._getCollectionHierarchy(rootHierarchy, skillDocument.pack);
        actorHierarchy = this._getActorHierarchy(collectionHierarchy, transientSkillDocument.owningDocument);
      } else { // Skill is contained in collection. 
        collectionHierarchy = this._getCollectionHierarchy(rootHierarchy, skillDocument.pack);
      }

      const skillHierarchy = new DamageFindingHierarchy({
        id: transientSkillDocument.id,
        name: transientSkillDocument.name
      });

      if (transientSkillDocument.damage.length) {
        const skillDamageFinding = new DamageFinding({
          name: transientSkillDocument.name,
          id: transientSkillDocument.id,
          damage: transientSkillDocument.damage.concat([]), // Safe-copy
          document: transientSkillDocument,
        });

        flat.push(skillDamageFinding);

        if (isDefined(actorHierarchy)) {
          actorHierarchy.addFinding(skillDamageFinding);
          collectionHierarchy.addSubHierarchy(actorHierarchy);
        } else {
          collectionHierarchy.addFinding(skillDamageFinding);
        }

        rootHierarchy.addSubHierarchy(collectionHierarchy);
      }

      transientSkillDocument.expertises.forEach(expertise => {
        if (expertise.damage.length > 0) {
          const expertiseDamageFinding = new DamageFinding({
            name: expertise.name,
            id: expertise.id,
            damage: expertise.damage.concat([]), // Safe-copy
            document: expertise,
          });

          flat.push(expertiseDamageFinding);
          skillHierarchy.addFinding(expertiseDamageFinding);

          if (isDefined(actorHierarchy)) {
            actorHierarchy.addSubHierarchy(skillHierarchy);
            collectionHierarchy.addSubHierarchy(actorHierarchy);
          } else {
            collectionHierarchy.addSubHierarchy(skillHierarchy);
          }

          rootHierarchy.addSubHierarchy(collectionHierarchy);
        }
      });
    });

    return {
      flat: flat,
      hierarchy: rootHierarchy,
    };
  }

  /**
   * 
   * @param {DamageFindingHierarchy} rootHierarchy 
   * @param {String} packId 
   * 
   * @returns {DamageFindingHierarchy}
   * 
   * @private
   */
  _getCollectionHierarchy(rootHierarchy, packId) {
    const collection = rootHierarchy.getSubHierarchy(packId);
    if (isDefined(collection)) {
      return collection;
    } else {
      return new DamageFindingHierarchy({
        id: packId,
        name: packId,
      });
    }
  }

  /**
   * 
   * @param {DamageFindingHierarchy} collectionHierarchy 
   * @param {TransientBaseCharacterActor} actor 
   * 
   * @returns {DamageFindingHierarchy}
   * 
   * @private
   */
  _getActorHierarchy(collectionHierarchy, actor) {
    const actorHierarchy = collectionHierarchy.getSubHierarchy(actor.id);
    if (isDefined(actorHierarchy)) {
      return actorHierarchy;
    } else {
      return new DamageFindingHierarchy({
        id: actor.id,
        name: actor.name,
      });
    }
  }
}

export const LIST_STYLING = {
  FLAT: "FLAT",
  HIERARCHY: "HIERARCHY",
}
