import { ITEM_TYPES } from "../../../../../business/document/item/item-types.mjs"
import { SEARCH_MODES, Search, SearchItem } from "../../../../../business/search/search.mjs"
import { SKILL_TAGS } from "../../../../../business/tags/system-tags.mjs"
import { isDefined, validateOrThrow } from "../../../../../business/util/validation-utility.mjs"
import { getExtenders } from "../../../../../common/extender-util.mjs"
import ButtonAddViewModel from "../../../../component/button-add/button-add-viewmodel.mjs"
import InputSearchTextViewModel from "../../../../component/input-search/input-search-viewmodel.mjs"
import SortControlsViewModel, { SortingOption } from "../../../../component/sort-controls/sort-controls-viewmodel.mjs"
import DocumentListItemOrderDataSource from "../../../../component/sortable-list/document-list-item-order-datasource.mjs"
import SortableListViewModel from "../../../../component/sortable-list/sortable-list-viewmodel.mjs"
import ViewModel from "../../../../view-model/view-model.mjs"
import SkillListItemViewModel from "../../../item/skill/skill-list-item-viewmodel.mjs"
import * as StringUtil from "../../../../../business/util/string-utility.mjs"

export default class ActorSkillsViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_SKILLS; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * Returns `true`, if innate skills are to be hidden. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get hideInnateSkills() { return (this.innateSkillViewModels ?? []).length === 0; }

  /**
   * Returns `true`, if learning skills are to be hidden. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get hideLearningSkills() { return this.document.progressionVisible === false; }
  
  /**
   * @type {String}
   * @readonly
   */
  get sortControlsTemplate() { return SortControlsViewModel.TEMPLATE; }

  /**
   * @type {String}
   * @private
   */
  _searchTerm = "";
  /**
   * @type {String}
   */
  get searchTerm() {
    return this._searchTerm;
  }
  set searchTerm(value) {
    this._searchTerm = value;
    if (isDefined(this.vmSearch)) {
      this.vmSearch.value = value;
    }

    this._filterSkills(value);

    // Immediately write view state. 
    this.writeViewState();
  }

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
    validateOrThrow(args, ["document"]);

    // Own properties.
    this.document = args.document;

    // View state.
    this.registerViewStateProperty("_searchTerm");
    this.readViewState();

    // Child view models. 

    this.vmSearch = new InputSearchTextViewModel({
      id: "vmSearch",
      parent: this,
      isEditable: true, // Should always be true so that observers can also filter. 
      value: this.searchTerm,
      onChange: (oldValue, newValue) => {
        if (oldValue != newValue) {
          this.searchTerm = newValue;
        }
      },
    });

    this.innateSkillViewModels = [];
    this.innateSkillViewModels = this._getInnateSkillViewModels();
    if (this.hideInnateSkills === false) {
      this.vmInnateSkillList = new SortableListViewModel({
        id: "vmInnateSkillList",
        parent: this,
        contextTemplate: this.contextTemplate,
        indexDataSource: new DocumentListItemOrderDataSource({
          document: this.document,
          listName: "innateSkills",
        }),
        listItemViewModels: this.innateSkillViewModels,
        listItemTemplate: SkillListItemViewModel.TEMPLATE,
        vmBtnAddItem: new ButtonAddViewModel({
          id: "vmAddInnateSkill1",
          parent: this,
          target: this.document,
          creationType: ITEM_TYPES.SKILL,
          withDialog: true,
          creationData: {
            level: 1,
            properties: [
              SKILL_TAGS.INNATE.id,
            ],
          },
          localizedLabel: StringUtil.format(
            game.i18n.localize("system.general.add.addType"),
            game.i18n.localize("system.character.skill.innate.singular"),
          ),
          localizedType: game.i18n.localize("system.character.skill.innate.singular"),
        }),
      });
    }
    this.vmAddInnateSkill2 = new ButtonAddViewModel({
      id: "vmAddInnateSkill2",
      parent: this,
      target: this.document,
      creationType: ITEM_TYPES.SKILL,
      withDialog: true,
      creationData: {
        level: 1,
        properties: [
          SKILL_TAGS.INNATE.id,
        ],
      },
      localizedToolTip: StringUtil.format(
        game.i18n.localize("system.general.add.addType"),
        game.i18n.localize("system.character.skill.innate.singular"),
      ),
      localizedType: game.i18n.localize("system.character.skill.innate.singular"),
    });

    this.learningSkillViewModels = [];
    this.learningSkillViewModels = this._getLearningSkillViewModels();
    this.vmLearningSkillList = new SortableListViewModel({
      id: "vmLearningSkillList",
      parent: this,
      contextTemplate: this.contextTemplate,
      indexDataSource: new DocumentListItemOrderDataSource({
        document: this.document,
        listName: "learningSkills",
      }),
      listItemViewModels: this.learningSkillViewModels,
      listItemTemplate: SkillListItemViewModel.TEMPLATE,
      vmBtnAddItem: new ButtonAddViewModel({
        id: "vmAddLearningSkill1",
        parent: this,
        target: this.document,
        creationType: ITEM_TYPES.SKILL,
        withDialog: true,
        creationData: {
          level: 0,
        },
        localizedLabel: StringUtil.format(
          game.i18n.localize("system.general.add.addType"),
          game.i18n.localize("system.character.skill.learning.singular"),
        ),
        localizedType: game.i18n.localize("system.character.skill.learning.singular"),
      }),
    });
    this.vmAddLearningSkill2 = new ButtonAddViewModel({
      id: "vmAddLearningSkill2",
      parent: this,
      target: this.document,
      creationType: ITEM_TYPES.SKILL,
      withDialog: true,
      creationData: {
        level: 0,
      },
      localizedToolTip: StringUtil.format(
        game.i18n.localize("system.general.add.addType"),
        game.i18n.localize("system.character.skill.learning.singular"),
      ),
      localizedType: game.i18n.localize("system.character.skill.learning.singular"),
    });

    this.knownSkillViewModels = [];
    this.knownSkillViewModels = this._getKnownSkillViewModels();
    this.vmKnownSkillList = new SortableListViewModel({
      id: "vmKnownSkillList",
      parent: this,
      contextTemplate: this.contextTemplate,
      indexDataSource: new DocumentListItemOrderDataSource({
        document: this.document,
        listName: "knownSkills",
      }),
      listItemViewModels: this.knownSkillViewModels,
      listItemTemplate: SkillListItemViewModel.TEMPLATE,
      vmBtnAddItem: new ButtonAddViewModel({
        id: "vmAddKnownSkill1",
        parent: this,
        target: this.document,
        creationType: ITEM_TYPES.SKILL,
        withDialog: true,
        creationData: {
          level: 1,
        },
        localizedLabel: StringUtil.format(
          game.i18n.localize("system.general.add.addType"),
          game.i18n.localize("system.character.skill.known.singular"),
        ),
        localizedType: game.i18n.localize("system.character.skill.known.singular"),
      }),
    });
    this.vmAddKnownSkill2 = new ButtonAddViewModel({
      id: "vmAddKnownSkill2",
      parent: this,
      target: this.document,
      creationType: ITEM_TYPES.SKILL,
      withDialog: true,
      creationData: {
        level: 1,
      },
      localizedToolTip: StringUtil.format(
        game.i18n.localize("system.general.add.addType"),
        game.i18n.localize("system.character.skill.known.singular"),
      ),
      localizedType: game.i18n.localize("system.character.skill.known.singular"),
    });
    
    this.vmSortInnate = new SortControlsViewModel({
      id: "vmSortInnate",
      parent: this,
      options: this._getKnownSkillSortingOptions(),
      compact: true,
      onSort: (_, provideSortable) => {
        provideSortable(this.vmInnateSkillList);
      },
    });
    this.vmSortLearning = new SortControlsViewModel({
      id: "vmSortLearning",
      parent: this,
      options: this._getLearningSkillSortingOptions(),
      compact: true,
      onSort: (_, provideSortable) => {
        provideSortable(this.vmLearningSkillList);
      },
    });
    this.vmSortKnown = new SortControlsViewModel({
      id: "vmSortKnown",
      parent: this,
      options: this._getKnownSkillSortingOptions(),
      compact: true,
      onSort: (_, provideSortable) => {
        provideSortable(this.vmKnownSkillList);
      },
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
    // Innate skills
    const newInnateSkills = this._getInnateSkillViewModels();
    this._cullObsolete(this.innateSkillViewModels, newInnateSkills);
    this.innateSkillViewModels = newInnateSkills;
    
    // Known skills
    const newKnownSkills = this._getKnownSkillViewModels();
    this._cullObsolete(this.knownSkillViewModels, newKnownSkills);
    this.knownSkillViewModels = newKnownSkills;
    
    // Learning skills
    const newLearningSkills = this._getLearningSkillViewModels();
    this._cullObsolete(this.learningSkillViewModels, newLearningSkills);
    this.learningSkillViewModels = newLearningSkills;

    super.update(args);
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this._filterSkills(this.searchTerm);
  }

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmKnownSkillList, {
      ...updates.get(this.vmKnownSkillList),
      listItemViewModels: this.knownSkillViewModels,
    });
    updates.set(this.vmLearningSkillList, {
      ...updates.get(this.vmLearningSkillList),
      listItemViewModels: this.learningSkillViewModels,
    });
    
    return updates;
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
   * Filters the skills by the given search term. 
   * 
   * @param {String} searchTerm 
   * 
   * @private
   */
  _filterSkills(searchTerm) {
    const skills = this.document.skills.innate
      .concat(this.document.skills.learning)
      .concat(this.document.skills.known);

    let innateListElements = [];
    if (this.hideInnateSkills === false) {
      innateListElements = this.vmInnateSkillList.element.find("> li");
    }
    
    const knownListElements = this.vmKnownSkillList.element.find("> li");

    let learningListElements = [];
    if (this.hideLearningSkills === false) {
      learningListElements = this.vmLearningSkillList.element.find("> li");
    }

    const elements = [];
    for (const element of innateListElements) {
      elements.push(element);
    }
    for (const element of knownListElements) {
      elements.push(element);
    }
    for (const element of learningListElements) {
      elements.push(element);
    }

    const trimmedSearchTerm = searchTerm.trim();
    const searchItems = skills.map(it => new SearchItem({
        id: it.id,
        term: it.name,
      }));

    if (trimmedSearchTerm.length > 0) {
      const results = new Search().search(searchItems, trimmedSearchTerm, SEARCH_MODES.STRICT_CASE_INSENSITIVE);

      for (const result of results) {
        const element = elements.find(it => it.id === result.id);
        if (result.score > 0) {
          $(element).removeClass("hidden");
        } else {
          $(element).addClass("hidden");
        }
      }
    } else {
      // Reset visibilities. 
      for (const element of elements) {
        $(element).removeClass("hidden");
      }
    }
  }

  /**
   * Returns the sorting options for learning skill lists. 
   * 
   * @returns {Array<SortingOption>}
   * 
   * @private
   */
  _getLearningSkillSortingOptions() {
    return [
      new SortingOption({
        iconHtml: '<i class="ico ico-tags-solid dark"></i>',
        localizedToolTip: game.i18n.localize("system.general.name.label"),
        sortingFunc: (a, b) => {
          return a.document.name.localeCompare(b.document.name);
        },
      }),
    ];
  }

  /**
   * Returns the sorting options for known and innate skill lists. 
   * 
   * @returns {Array<SortingOption>}
   * 
   * @private
   */
  _getKnownSkillSortingOptions() {
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
    return super.getExtenders().concat(getExtenders(ActorSkillsViewModel));
  }

}
