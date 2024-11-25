import TransientBaseCharacterActor from "../../../business/document/actor/transient-base-character-actor.mjs";
import { DOCUMENT_COLLECTION_SOURCES } from "../../../business/document/document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import { ITEM_TYPES } from "../../../business/document/item/item-types.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import ObservableField from "../../../common/observables/observable-field.mjs";
import ButtonViewModel from "../../component/button/button-viewmodel.mjs";
import InputRadioButtonGroupViewModel from "../../component/input-choice/input-radio-button-group/input-radio-button-group-viewmodel.mjs";
import StatefulChoiceOption from "../../component/input-choice/stateful-choice-option.mjs";
import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import SortControlsViewModel, { SortingOption } from "../../component/sort-controls/sort-controls-viewmodel.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import DamageFindingHierarchy from "./damage-finding-hierarchy.mjs";
import DamageFindingListItemViewModel from "./damage-finding-list-item-viewmodel.mjs";
import { DamageFinding } from "./damage-finding.mjs";
import DamageHierarchyListItemViewModel from "./damage-hierarchy-list-item-viewmodel.mjs";

/**
 * @property {Array<DamageFindingHierarchy>} hierarchyViewModels
 */
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
   * @type {String}
   * @readonly
   */
  get sortControlsTemplate() { return SortControlsViewModel.TEMPLATE; }

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
   * @property {Object} value.findings 
   * @property {LIST_STYLING} value.activeListStyling 
   * 
   * @type {Object}
   * @private
   */
  _uiState = new ObservableField({
    value: {
      findings: undefined,
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

    ValidationUtil.validateOrThrow(args, ["ui"]);

    this.ui = args.ui;
    this.isEditable = true;

    this.registerViewStateProperty("_uiState");

    this.vmRefresh = new ButtonViewModel({
      id: "vmRefresh",
      parent: this,
      localizedToolTip: "Refresh",
      iconHtml: '<i class="fas fa-sync-alt"></i>',
      onClick: (async () => {
        const findings = await this._getDamageFindings();
        await this._updateTable(findings);
      }),
    });

    this.vmCollapseAll = new ButtonViewModel({
      id: "vmCollapseAll",
      parent: this,
      localizedToolTip: "Collapse All",
      iconHtml: '<i class="fas fa-angle-double-up"></i>',
      onClick: (async () => {
        this.hierarchyViewModels.forEach(vm => {
          vm.isExpanded = false;
        });
      }),
    });
    this.vmExpandAll = new ButtonViewModel({
      id: "vmExpandAll",
      parent: this,
      localizedToolTip: "Expand All",
      iconHtml: '<i class="fas fa-angle-double-down"></i>',
      onClick: (async () => {
        this.hierarchyViewModels.forEach(vm => {
          vm.isExpanded = true;
        });
      }),
    });

    const listSortingOptions = [
      new StatefulChoiceOption({
        value: LIST_STYLING.HIERARCHY,
        activeHtml: `<i class="ico dark ico-list-hierarchical-solid"></i>`,
        isActive: true,
      }),
      new StatefulChoiceOption({
        value: LIST_STYLING.FLAT,
        activeHtml: `<i class="ico dark ico-list-flat-solid"></i>`,
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

    this.vmSort = new SortControlsViewModel({
      id: "vmSort",
      parent: this,
      options: [
        new SortingOption({
          iconHtml: '<i class="ico ico-tags-solid dark"></i>',
          localizedToolTip: game.i18n.localize("system.general.name.label"),
          sortingFunc: (a, b) => {
            return a.name.localeCompare(b.name);
          },
        }),
        new SortingOption({
          iconHtml: '<i class="ico ico-damage-roll-solid dark"></i>',
          sortingFunc: (a, b) => {
            const substitute = this.vmSubstitute.value;

            const minDamageA = a.getComparableDamage(substitute);
            const minDamageB = b.getComparableDamage(substitute);

            if (minDamageA > minDamageB) {
              return 1;
            } else if (minDamageA < minDamageB) {
              return -1;
            } else {
              return 0;
            }
          },
        }),
      ],
      compact: true,
      onSort: (_, provideSortable) => {
        provideSortable(this);
      },
    });

    this.vmSubstitute = new InputNumberSpinnerViewModel({
      id: "vmSubstitute",
      parent: this,
      min: 0,
      max: 10,
    });

    this._uiState.onChange(async (_1, _2, newValue) => {
      await this._updateTable(newValue.findings);
    });
  }
  
  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);
    
    this._tableElement = html.find(`#${DamageDesignerDialogViewModel.ID_TABLE_ELEMENT}`);
    const findings = await this._getDamageFindings();
    await this._updateTable(findings);
  }

  /**
   * Sorts the list in-place, based on the results returned by the given sorting function, 
   * which receives two view model instances to compare, just like the `Array.sort` function. 
   * 
   * @param {Function} sortingFunc The sorting function. Should return an integer value, based on the equality
   * of the arguments. Must return either `-1`, `0` or `1`. Receives view model instances of the represented 
   * list items as arguments. Arguments:
   * * `a: {ViewModel}`
   * * `b: {ViewModel}`
   * 
   */
  sort(sortingFunc) {
    if (this._uiState.value.activeListStyling === LIST_STYLING.FLAT) {
      this._uiState.value.findings.flat.sort(sortingFunc);
    } else { // Hierarchical view
      this._uiState.value.findings.hierarchy.sort(sortingFunc);
    }
    this._updateTable(this._uiState.value.findings);
  }
 
  /**
   * @param {Object} findings 
   * 
   * @async
   * @private
   */
  async _updateTable(findings) {
    this._uiState.value.findings = findings;

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

    this.hierarchyViewModels = viewModels;

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

      const pack = skillDocument.pack ?? "world";
      let collectionHierarchy;
      let actorHierarchy;
      if (ValidationUtil.isDefined(transientSkillDocument.owningDocument)) { // Skill is embedded on actor. 
        collectionHierarchy = this._getCollectionHierarchy(rootHierarchy, pack);
        actorHierarchy = this._getActorHierarchy(collectionHierarchy, transientSkillDocument.owningDocument);
      } else { // Skill is contained in collection. 
        collectionHierarchy = this._getCollectionHierarchy(rootHierarchy, pack);
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

        if (ValidationUtil.isDefined(actorHierarchy)) {
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

          if (ValidationUtil.isDefined(actorHierarchy)) {
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
    if (ValidationUtil.isDefined(collection)) {
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
    if (ValidationUtil.isDefined(actorHierarchy)) {
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
