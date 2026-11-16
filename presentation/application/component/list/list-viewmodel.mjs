import { Search, SEARCH_MODES, SearchItem } from "../../../../business/search/search.mjs";
import { LIST_ITEM_EXPANSION_MODES, ListItemExpansionMode } from "../../../../business/setting/list-item-expansion-modes.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import FoundryWrapper from "../../../../foundry-interop/foundry-wrapper.mjs";
import VisibilityRule from "../../../model/visibility-rule.mjs";
import { TEMPLATES } from "../../templates.mjs"
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs"
import ButtonDropDownViewModel from "../button-dropdown/button-dropdown-viewmodel.mjs";
import { DropDownOption } from "../button-dropdown/dropdown-option.mjs";
import InputTextFieldViewModel from "../input-textfield/input-textfield-viewmodel.mjs";
import ListItemViewModel from "./list-item-viewmodel.mjs"
import ListItem from "./list-item.mjs";
import ListSeparator from "./list-separator.mjs";

/**
 * Wraps the basic structure of a vertical list of items, whose content 
 * may be arbitrary. 
 * 
 * @extends ViewModel
 */
export default class ListViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.list.list; }

  /** @override */
  get clazz() { return ListViewModel; }

  /** @override */
  get visibilityRules() {
    return super.visibilityRules.concat([
      new VisibilityRule({
        selector: "> div > div > .list-header-end > .context-menu",
        shouldBeHidden: () => !this.isEditable || this.contextMenuOptions.length === 0,
      }),
    ]);
  }

  /**
   * @type {String}
   * @readonly
   */
  get itemTemplate() { return ListItemViewModel.TEMPLATE; }

  /**
   * @type {Array<ListItem>}
   * @private
   */
  _items = [];
  /**
   * @type {Array<ListItem>}
   */
  get items() { return this._items; }
  set items(value) {
    this._items = value;

    new Promise(async (resolve) => {
      await this.#render();
      resolve();
    });
  }

  /**
   * @type {String}
   * @protected
   */
  _title = "";
  /**
   * @type {String}
   */
  get title() { return this._title; }
  set title(value) {
    this._title = value;
    this.element.find("> div > div > .list-header-center > h2").text(value);
  }

  /**
   * @type {Array<ListSeparator>}
   * @protected
   */
  _separators = [];
  /**
   * @type {Array<ListSeparator>}
   */
  get separators() { return this._separators; }
  set separators(value) {
    this._separators = value;

    new Promise(async (resolve) => {
      await this.#render();
      resolve();
    });
  }

  get isEditable() { return super.isEditable; }
  set isEditable(value) {
    super.isEditable = value;

    this.vmFilter.isEditable = true;
  }

  /**
   * @type {Array<DropDownOption>}
   * @protected
   */
  _itemContextMenuOptions;
  get itemContextMenuOptions() { return this._itemContextMenuOptions; }
  

  /**
   * @type {Array<DropDownOption>}
   * @private
   */
  #contextMenuOptions;
  get contextMenuOptions() { return this.#contextMenuOptions; }
  
  /**
   * @type {ListItemExpansionMode}
   * @protected
   */
  _itemExpansionMode;
  get itemExpansionMode() { return this._itemExpansionMode; }
  
  /**
   * @type {Boolean}
   * @protected
   */
  _itemsInitiallyExpanded;
  get itemsInitiallyExpanded() { return this._itemsInitiallyExpanded; }
  
  /**
   * @type {Boolean}
   * @protected
   */
  _enableFilter;
  get enableFilter() { return this._enableFilter; }
  
  /**
   * @type {String}
   * @protected
   */
  _searchTerm;
  get searchTerm() { return this._searchTerm; }

  /**
   * @type {Array<ListItemViewModel>}
   * @private
   */
  #listItemViewModels = [];

  /**
   * @param {Object} args The arguments object. 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * 
   * If no value is provided, a shortened UUID will be generated for it. 
   * 
   * This string may not contain any special characters! Alphanumeric symbols, as well as hyphen ('-') and 
   * underscore ('_') are permitted, but no dots, brackets, braces, slashes, equal sign, and so on. Failing to comply to this 
   * naming restriction may result in DOM elements not being properly detected by the `activateListeners` method. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * Default `false`. 
   * @param {Boolean | undefined} args.visible
   * * default `true`
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * 
   * @param {String | undefined} args.title
   * @param {Array<ListItem> | undefined} args.items
   * @param {Array<ListSeparator> | undefined} args.separators A list of visual list separators. 
   * @param {String | undefined} args.searchTerm
   * @param {Function | undefined} args.toSearchableTerm Must return a `String` representing the 
   * searchable term. Arguments:
   * * `item: ListItem` - the item to convert to a searchable `String`. 
   * * default will return the wrapped document's `name` property. 
   * @param {Array<DropDownOption> | undefined} args.contextMenuOptions
   * @param {Array<DropDownOption> | undefined} args.itemContextMenuOptions
   * @param {ListItemExpansionMode | undefined} args.itemExpansionMode
   * @param {Boolean | undefined} args.itemsInitiallyExpanded
   * * default `false`
   * @param {Boolean | undefined} args.enableFilter
   * * default `true`
   */
  constructor(args = {}) {
    super(args);

    this._title = args.title;
    this._separators = args.separators ?? [];
    this._itemContextMenuOptions = args.itemContextMenuOptions ?? [];
    this._itemExpansionMode = args.itemExpansionMode ?? LIST_ITEM_EXPANSION_MODES.window;
    this._itemsInitiallyExpanded = args.itemsInitiallyExpanded ?? false;
    this._enableFilter = args.enableFilter ?? true;
    this._items = args.items ?? [];
    this.toSearchableTerm = args.toSearchableTerm ?? ((listItem) => listItem.document.name);

    this.#contextMenuOptions = args.contextMenuOptions ?? [];
    this.vmContextMenu = new ButtonDropDownViewModel({
      id: "vmContextMenu",
      parent: this,
      isEditable: true,
      options: this.contextMenuOptions,
      visible: true,
    });

    this._searchTerm = args.searchTerm ?? "";
    this.vmFilter = new InputTextFieldViewModel({
      id: "vmFilter",
      parent: this,
      value: this.searchTerm,
      isEditable: true,
      icon: '<i class="ico ico-search lg"></i>',
      enableClearButton: true,
      placeholder: StringUtil.getLoca("system.general.filter"),
      visible: this.enableFilter,
      onChange: (newValue) => {
        this.searchTerm = newValue;
        this.#filter(false);
      },
      onFocus: () => {
        this.element.find(".list-header-start").stop(true, false);
        this.element.find(".list-header-start").animate({
          width: "0%",
        }, 300);
      },
      onFocusLost: () => {
        this.element.find(".list-header-start").stop(true, false);
        this.element.find(".list-header-start").animate({
          width: "25%",
        }, 300);
      },
    });
  }

  async activateListeners(html) {
    await super.activateListeners(html);
    await this.#render();

    if (this.contextMenuOptions.length === 0) {
      this.element.find(".context-menu").addClass("hidden");
    }
  }

  /**
   * Returns the list item with either the given ID or index. 
   * @param {String | Number} idOrIndex ID or index of the item to return. 
   * @returns {ListItemViewModel}
   */
  getListItemViewModel(idOrIndex) {
    const vm = this.#listItemViewModels.find(it => it.item.id === idOrIndex);
    if (!ValidationUtil.isDefined(vm)) {
      vm = this.#listItemViewModels[idOrIndex];
    }
    return vm;
  }

  /**
   * Sets the expansion state of an item with either the given ID or index. 
   * @param {String | Number} idOrIndex ID or index of the item to set. 
   * @param {Boolean} state If `true`, will expand the item, else collapse it. 
   */
  setItemExpanded(idOrIndex, state) {
    if (this.itemExpansionMode.name === LIST_ITEM_EXPANSION_MODES.inline_locked.name) return;
    
    const vm = this.getListItemViewModel(idOrIndex);
    vm.isExpanded = state;
  }

  /**
   * Toggles the expansion state of an item with either the given ID or index. 
   * @param {String | Number} idOrIndex ID or index of the item to toggle. 
   */
  toggleItemExpanded(idOrIndex) {
    if (this.itemExpansionMode.name === LIST_ITEM_EXPANSION_MODES.inline_locked.name) return;

    const vm = this.getListItemViewModel(idOrIndex);
    vm.isExpanded = !vm.isExpanded;
  }

  /**
   * @returns {Promise<void>}
   * @async
   */
  async #render() {
    await this.#prepareItems();
    await this.#renderList();
    this.#filter(true);
  }

  /**
   * @returns {Promise<void>}
   * @async
   */
  async #prepareItems() {
    // Clear existing items
    this.#listItemViewModels.forEach(viewModel => {
      viewModel.dispose();
    });

    this.#listItemViewModels = this.items.map(item => new ListItemViewModel({
      id: `listitem-${item.id}`,
      parent: this,
      item: item,
      contextMenuOptions: this.itemContextMenuOptions,
      expansionMode: this.itemExpansionMode,
      isExpanded: this.itemsInitiallyExpanded,
    }));

    // Prepared items from separators. 
    const preparedSeparators = [];
    for await (const separator of this._separators) {
      if (!separator.applies()) continue;

      const index = separator.getIndex(this.#listItemViewModels.length - 1);
      const html = await separator.separatorContent.render(this);
      preparedSeparators.push({
        index: index,
        html: html,
        tooltip: separator.tooltip,
      });
    };
    preparedSeparators.sort((a, b) => b.index - a.index);

    let separatorCount = 0;
    preparedSeparators.forEach(preparedSeparator => {
      const id = `separator${separatorCount}`;
      separatorCount++;

      const wrappedHtml = `<div id="${viewModel.id}">${preparedSeparator.html}</div>`;
      const viewModel = new ListItemViewModel({
        id: id,
        parent: this,
        html: wrappedHtml,
        isSeparator: true,
        toolTip: preparedSeparator.tooltip,
        expansionMode: this.itemExpansionMode,
        isExpanded: this.itemsInitiallyExpanded,
      });
      this.#listItemViewModels.splice(preparedSeparator.index, 0, viewModel);
    });
  }

  /**
   * @returns {Promise<void>}
   * @async
   */
  async #renderList() {
    const listElm = this.element.find("ul");
    listElm.empty();

    for await (const viewModel of this.#listItemViewModels) {
      // Render and append to DOM. 
      if (ValidationUtil.isNotBlankOrUndefined(viewModel.html)) {
        listElm.append(viewModel.html);
      } else {
        const rendered = await FoundryWrapper.renderTemplate(viewModel.clazz.TEMPLATE, {
          viewModel: viewModel,
        });
        listElm.append(rendered);
      }

      // Activate listeners.
      const itemElm = listElm.find(`#${viewModel.id}`);
      viewModel.activateListeners(itemElm);
    };
  }

  /**
   * Applies the current `searchTerm` as filter on the items, toggling their 
   * visibility. 
   */
  #filter() {
    this.#listItemViewModels.forEach(viewModel => {
      viewModel.visible = true;
    });
    // Map SearchItems
    const searchItems = [];
    this.#listItemViewModels.forEach(viewModel => {
      if (ValidationUtil.isDefined(viewModel.contentViewModel)) {
        searchItems.push(new SearchItem({
          id: viewModel.independentId,
          term: this.toSearchableTerm(viewModel.item),
        }));
      }
    });

    // Search
    const searchResults = new Search().search({
      searchItems: searchItems,
      searchTerm: this.searchTerm,
      searchMode: SEARCH_MODES.FUZZY,
    });

    // Filter
    searchResults.forEach(searchResult => {
      const viewModel = this.#listItemViewModels.find(it => it.independentId === searchResult.id);
      viewModel.visible = searchResult.score > 0;
    });
  }
}
