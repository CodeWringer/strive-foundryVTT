import { Search, SEARCH_MODES, SearchItem } from "../../../../business/search/search.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import FoundryWrapper from "../../../../foundry-interop/foundry-wrapper.mjs";
import { TEMPLATES } from "../../templates.mjs"
import ValueViewModel from "../../view-model/value-view-model.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs"
import ButtonDropDownViewModel from "../button-dropdown/button-dropdown-viewmodel.mjs";
import InputTextFieldViewModel from "../input-textfield/input-textfield-viewmodel.mjs";
import ListItemViewModel from "./list-item-viewmodel.mjs"

/**
 * Wraps the basic structure of a vertical list of items, whose content 
 * may be arbitrary. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {Array<Any>}`
 * * `newValue: {Array<Any>}`
 * 
 * @extends ValueViewModel
 */
export default class ListViewModel extends ValueViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.list.list; }

  /**
   * Returns the class reference of this instance. Required for extending this object. 
   * 
   * @virtual
   * @readonly
   */
  get clazz() { return ListViewModel; }

  /**
   * @type {String}
   * @readonly
   */
  get itemTemplate() { return ListItemViewModel.TEMPLATE; }

  get showContextMenu() { return this.contextMenuOptions.length > 0; }

  #items;
  get items() { return this.#items; }
  set items(value) {
    this.#items = value;
    this.#convertItemsToViewModels();
    this.#render();
    this.#filter(true);
  }

  /**
   * @type {Array<ListItemViewModel>}
   * @private
   */
  #itemViewModels;

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
   * @param {Array<Object> | undefined} args.value Initial value. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives arguments: 
   * * `newValue: {Any}`
   * * `oldValue: {Any}`
   * 
   * @param {Array<DropDownOption> | undefined} args.contextMenuOptions
   * @param {Array<Any> | undefined} args.items
   * @param {Function} args.viewModelFactory
   * @param {String | undefined} args.searchTerm
   * @param {Function | undefined} args.toSearchableTerm Must return a `String` representing the 
   * searchable term. Arguments:
   * * `viewModel: ViewModel` - content view model instance. 
   */
  constructor(args = {}) {
    super(args);

    ValidationUtil.validateOrThrow(args, ["viewModelFactory"]);

    this.toSearchableTerm = args.toSearchableTerm ?? (() => {});

    this.contextMenuOptions = args.contextMenuOptions ?? [];
    if (this.showContextMenu) {
      this.vmContextMenu = new ButtonDropDownViewModel({
        id: "vmContextMenu",
        parent: this,
        options: this.contextMenuOptions,
        visible: this.showContextMenu,
      });
    }

    this._searchTerm = args.searchTerm ?? "";
    this.#items = args.items ?? [];
    this.viewModelFactory = args.viewModelFactory;
    this.#convertItemsToViewModels();

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

  #convertItemsToViewModels() {
    this.#itemViewModels.forEach(viewModel => {
      viewModel.dispose();
    });
    this.#itemViewModels = this.items.map(item => this.viewModelFactory(item, this));
  }

  async #render() {
    const listElm = this.element.find("ul");
    listElm.empty();
    this.#itemViewModels.forEach(async (viewModel) => {
      const rendered = await FoundryWrapper.renderTemplate(viewModel.clazz.TEMPLATE, {
        viewModel: viewModel,
      });
      listElm.append(rendered);
    });
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
        this.#itemViewModels.forEach(vm => {
          vm.visible = true;
        });
      }
    } else {
      const searchItems = this.#itemViewModels.map(vm => new SearchItem({
        id: vm.contentViewModel.independentId,
        term: this.toSearchableTerm(vm.contentViewModel),
      }));
      const searchResults = new Search().search({
        searchItems: searchItems,
        searchTerm: this._searchTerm,
        searchMode: SEARCH_MODES.FUZZY,
      });
      searchResults.forEach(searchResult => {
        const vm = this.#itemViewModels.find(it => it.contentViewModel.independentId === searchResult.id);
        vm.visible = searchResult.score > 0;
      });
    }
  }
}
