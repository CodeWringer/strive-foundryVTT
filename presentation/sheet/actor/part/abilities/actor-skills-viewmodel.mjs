import { ACTOR_TYPES } from "../../../../../business/document/actor/actor-types.mjs"
import TransientBaseCharacterActor from "../../../../../business/document/actor/transient-base-character-actor.mjs"
import { ITEM_TYPES } from "../../../../../business/document/item/item-types.mjs"
import { SearchItem } from "../../../../../business/search/search.mjs"
import { SKILL_TAGS } from "../../../../../business/tags/system-tags.mjs"
import { StringUtil } from "../../../../../business/util/string-utility.mjs"
import { ValidationUtil } from "../../../../../business/util/validation-utility.mjs"
import { ExtenderUtil } from "../../../../../common/extender-util.mjs"
import SpecificDocumentCreationStrategy from "../../../../component/button-add/specific-document-creation-strategy.mjs"
import CompositeSortableListViewModel from "../../../../component/composite-sortable-list/composite-sortable-list-viewmodel.mjs"
import { SortingOption } from "../../../../component/sort-controls/sort-controls-viewmodel.mjs"
import DocumentListItemOrderDataSource from "../../../../component/sortable-list/document-list-item-order-datasource.mjs"
import { SortableListAddItemParams } from "../../../../component/sortable-list/sortable-list-viewmodel.mjs"
import ViewModel from "../../../../view-model/view-model.mjs"
import SkillListItemViewModel from "../../../item/skill/skill-list-item-viewmodel.mjs"

export default class ActorSkillsViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_SKILLS; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * Returns `true`, if learning skills are to be hidden. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get hideLearningSkills() { return this.document.advancement.advancementEnabled === false; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM If true, the current user is a GM. 
   * 
   * @param {TransientBaseCharacterActor} args.document
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.document = args.document;

    this.skillViewModels = this._getSkillViewModels();
    const nonInnateSkillFilter = (document) => {
      const hasInnateTag = ValidationUtil.isDefined(document.tags.find(it => it.id === SKILL_TAGS.INNATE.id));
      if (hasInnateTag)
        return false;
      else
        return true;
    };
    const addItemParams = [
      // Known skill add button
      new SortableListAddItemParams({
        creationStrategy: new SpecificDocumentCreationStrategy({
          documentType: ITEM_TYPES.SKILL,
          target: this.document,
          filter: nonInnateSkillFilter,
          creationDataOverrides: {
            system: {
              level: 1,
            },
          },
        }),
        localizedLabel: StringUtil.format(
          game.i18n.localize("system.general.add.addType"),
          game.i18n.localize("system.character.skill.known.singular"),
        ),
        localizedToolTip: StringUtil.format(
          game.i18n.localize("system.general.add.addType"),
          game.i18n.localize("system.character.skill.known.singular"),
        ),
      }),
      // Innate skill add button
      new SortableListAddItemParams({
        creationStrategy: new SpecificDocumentCreationStrategy({
          documentType: ITEM_TYPES.SKILL,
          target: this.document,
          filter: (document) => {
            const hasInnateTag = ValidationUtil.isDefined(document.tags.find(it => it.id === SKILL_TAGS.INNATE.id));
            if (hasInnateTag)
              return true;
            else
              return false;
          },
          creationDataOverrides: {
            system: {
              level: 1,
              properties: [
                SKILL_TAGS.INNATE.id,
              ],
            },
          },
        }),
        localizedLabel: StringUtil.format(
          game.i18n.localize("system.general.add.addType"),
          game.i18n.localize("system.character.skill.innate.singular"),
        ),
        localizedToolTip: StringUtil.format(
          game.i18n.localize("system.general.add.addType"),
          game.i18n.localize("system.character.skill.innate.singular"),
        ),
      }),
    ];
    if (this.document.type === ACTOR_TYPES.PC || this.document.advancement.advancementEnabled === true) {
      // Learning skill add button
      addItemParams.splice(0, 0, new SortableListAddItemParams({
        creationStrategy: new SpecificDocumentCreationStrategy({
          documentType: ITEM_TYPES.SKILL,
          target: this.document,
          filter: nonInnateSkillFilter,
          creationDataOverrides: {
            system: {
              level: 0,
            },
          },
        }),
        localizedLabel: StringUtil.format(
          game.i18n.localize("system.general.add.addType"),
          game.i18n.localize("system.character.skill.learning.singular"),
        ),
        localizedToolTip: StringUtil.format(
          game.i18n.localize("system.general.add.addType"),
          game.i18n.localize("system.character.skill.learning.singular"),
        ),
      }));
    }

    this.vmSkills = new CompositeSortableListViewModel({
      id: "CompositeSortableListViewModel",
      parent: this,
      listItemTemplate: SkillListItemViewModel.TEMPLATE,
      listItemViewModels: this.skillViewModels,
      indexDataSource: new DocumentListItemOrderDataSource({
        document: this.document,
        listName: "skills",
      }),
      localizedTitle: game.i18n.localize("system.character.skill.plural"),
      addItemParams: addItemParams,
      sortingOptions: this._getSkillSortingOptions(),
      isCollapsible: false,
      enableFooter: true,
      isSearchable: true,
      searchItemProvder: () => {
        let skills = this.document.skills.known;
        skills = skills.concat(this.document.skills.innate);
        if (this.hideLearningSkills === false) {
          skills = skills.concat(this.document.skills.learning);
        }

        return skills.map(it =>
          new SearchItem({
            id: it.id,
            term: it.name,
          })
        );
      }
    });
  }

  /**
   * Updates the data of this view model. 
   * 
   * @param {Object} args
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document.
   * * Default `false`. 
   * 
   * @override
   */
  update(args = {}) {
    const newSkillViewModels = this._getSkillViewModels();
    this._cullObsolete(this.skillViewModels, newSkillViewModels);
    this.skillViewModels = newSkillViewModels;

    super.update(args);
  }

  /**
   * Returns ALL skill item view model instances. Learning, innate and known skills 
   * are all returned as a single array. 
   * 
   * @returns {Array<SkillListItemViewModel>}
   * 
   * @private
   */
  _getSkillViewModels() {
    let skillViewModels = [];
    skillViewModels = skillViewModels.concat(this._getInnateSkillViewModels());
    if (this.hideLearningSkills === false) {
      skillViewModels = skillViewModels.concat(this._getLearningSkillViewModels());
    }
    return skillViewModels.concat(this._getKnownSkillViewModels());
  }

  /**
   * @returns {Array<SkillListItemViewModel>}
   * 
   * @private
   */
  _getInnateSkillViewModels() {
    return this._getViewModels(
      this.document.skills.innate,
      this.innateSkillViewModels,
      (args) => { return new SkillListItemViewModel(args); }
    );
  }


  /**
   * @returns {Array<SkillListItemViewModel>}
   * 
   * @private
   */
  _getLearningSkillViewModels() {
    return this._getViewModels(
      this.document.skills.learning,
      this.learningSkillViewModels,
      (args) => { return new SkillListItemViewModel(args); }
    );
  }

  /**
   * @returns {Array<SkillListItemViewModel>}
   * 
   * @private
   */
  _getKnownSkillViewModels() {
    return this._getViewModels(
      this.document.skills.known,
      this.knownSkillViewModels,
      (args) => { return new SkillListItemViewModel(args); }
    );
  }

  /**
   * Returns the sorting options for known and innate skill lists. 
   * 
   * @returns {Array<SortingOption>}
   * 
   * @private
   */
  _getSkillSortingOptions() {
    return [
      new SortingOption({
        iconHtml: '<i class="ico ico-tags-solid dark"></i>',
        localizedToolTip: game.i18n.localize("system.general.name.label"),
        sortingFunc: (a, b) => {
          return a.document.name.localeCompare(b.document.name);
        },
      }),
      new SortingOption({
        iconHtml: '<i class="ico ico-level-solid dark"></i>',
        localizedToolTip: game.i18n.localize("system.character.advancement.level"),
        sortingFunc: (a, b) => {
          return a.document.compareLevel(b.document);
        },
      }),
    ];
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(ActorSkillsViewModel));
  }

}
