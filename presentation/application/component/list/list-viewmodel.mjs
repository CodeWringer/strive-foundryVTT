import { Search, SEARCH_MODES, SearchItem } from "../../../../business/search/search.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import FoundryWrapper from "../../../../foundry-interop/foundry-wrapper.mjs";
import { TEMPLATES } from "../../templates.mjs"
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs"
import ButtonDropDownViewModel from "../button-dropdown/button-dropdown-viewmodel.mjs";
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

  /**
   * @type {String}
   * @readonly
   */
  get itemTemplate() { return ListItemViewModel.TEMPLATE; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get showContextMenu() { return this.contextMenuOptions.length > 0; }

  /**
   * @type {Array<ListItem>}
   * @private
   */
  #items = [];
  /**
   * @type {Array<ListItem>}
   */
  get items() { return this.#items; }
  set items(value) {
    this.#items = value;

    new Promise(async (resolve) => {
      await this.#render();
      resolve();
    });
  }

  /**
   * @type {Array<ListSeparator>}
   * @private
   */
  #separators = [];
  /**
   * @type {Array<ListSeparator>}
   */
  get separators() { return this.#separators; }
  set separators(value) {
    this.#separators = value;

    new Promise(async (resolve) => {
      await this.#render();
      resolve();
    });
  }

  get isEditable() { return super.isEditable; }
  set isEditable(value) {
    super.isEditable = value;

    if (ValidationUtil.isDefined(this.vmContextMenu)) {
      this.vmContextMenu.visible = value;
    }
  }

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
   * @param {Object | undefined} args.document An associated data document. 
   * @param {Boolean | undefined} args.visible
   * * default `true`
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * 
   * @param {Array<ListItem> | undefined} args.items
   * @param {Array<ListSeparator> | undefined} args.separators A list of visual list separators. 
   * @param {String | undefined} args.searchTerm
   * @param {Function | undefined} args.toSearchableTerm Must return a `String` representing the 
   * searchable term. Arguments:
   * * `item: ListItem` - the item to convert to a searchable `String`. 
   * @param {Array<DropDownOption> | undefined} args.contextMenuOptions
   * @param {Array<DropDownOption> | undefined} args.itemContextMenuOptions
   */
  constructor(args = {}) {
    super(args);

    this.toSearchableTerm = args.toSearchableTerm ?? (() => { });
    this.#separators = args.separators ?? [];
    this.itemContextMenuOptions = args.itemContextMenuOptions ?? [];

    this.contextMenuOptions = args.contextMenuOptions ?? [];
    if (this.showContextMenu) {
      this.vmContextMenu = new ButtonDropDownViewModel({
        id: "vmContextMenu",
        parent: this,
        options: this.contextMenuOptions,
        visible: this.isEditable,
      });
    }

    this._searchTerm = args.searchTerm ?? "";
    this.#items = args.items ?? [];

    this.vmFilter = new InputTextFieldViewModel({
      id: "vmFilter",
      parent: this,
      value: this._searchTerm,
      isEditable: true,
      icon: '<i class="ico ico-search lg"></i>',
      enableClearButton: true,
      placeholder: StringUtil.getLoca("system.general.filter"),
      onChange: (newValue) => {
        this._searchTerm = newValue;

        this.#filter(false);
      },
      onFocus: () => {
        this.element.find(".list-header-start").stop(true, true);
        this.element.find(".list-header-start").animate({
          width: "0%",
        }, 300);
        this.element.find(".list-header-end").stop(true, true);
        this.element.find(".list-header-end").animate({
          width: "50%",
        }, 300);
      },
      onFocusLost: () => {
        this.element.find(".list-header-start").stop(true, true);
        this.element.find(".list-header-start").animate({
          width: "25%",
        }, 300);
        this.element.find(".list-header-end").stop(true, true);
        this.element.find(".list-header-end").animate({
          width: "25%",
        }, 300);
      },
    });
  }

  async activateListeners(html) {
    await super.activateListeners(html);

    await this.#render();
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
    }));

    // Prepared items from separators. 
    const preparedSeparators = [];
    for await (const separator of this.#separators) {
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
   * @param {Boolean} earlyExit If `true`, allows for an early exit if the current 
   * search term is empty or undefined. Should be most performant. 
   * @returns 
   */
  #filter(earlyExit = false) {
    if (ValidationUtil.isBlankOrUndefined(this._searchTerm)) {
      if (earlyExit) {
        return;
      } else {
        this.#listItemViewModels.forEach(viewModel => {
          viewModel.visible = true;
        });
      }
    } else {
      // Map SearchItems
      const searchItems = [];
      this.#listItemViewModels.forEach(viewModel => {
        if (ValidationUtil.isDefined(viewModel.contentViewModel)) {
          searchItems.push(new SearchItem({
            id: viewModel.independentId,
            term: this.toSearchableTerm(viewModel.contentViewModel),
          }));
        }
      });

      // Search
      const searchResults = new Search().search({
        searchItems: searchItems,
        searchTerm: this._searchTerm,
        searchMode: SEARCH_MODES.FUZZY,
      });

      // Filter
      searchResults.forEach(searchResult => {
        const viewModel = this.#listItemViewModels.find(it => it.independentId === searchResult.id);
        viewModel.visible = searchResult.score > 0;
      });
    }
  }
}
