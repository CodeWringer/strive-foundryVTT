import { Search, SEARCH_MODES } from "../../../business/search/search.mjs";
import { StringUtil } from "../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import { TemplatedComponent } from "../../sheet/item/base/templated-component.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonDropDownViewModel from "../button-dropdown/button-dropdown-viewmodel.mjs";
import InputSearchTextViewModel from "../input-search/input-search-viewmodel.mjs";
import ListFooterViewModel from "../sortable-list/list-footer-viewmodel.mjs";
import SortableListViewModel from "../sortable-list/sortable-list-viewmodel.mjs";

export default class CompositeSortableListViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPOSITE_SORTABLE_LIST; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('compositeSortableList', `{{> "${CompositeSortableListViewModel.TEMPLATE}"}}`);
  }

  /**
   * @type {String}
   */
  get searchTerm() {
    return this._searchTerm ?? "";
  }
  set searchTerm(value) {
    this._searchTerm = value;
    if (ValidationUtil.isDefined(this.vmSearch)) {
      this.vmSearch.value = value;
    }

    this._filter(value, this.searchItemProvder());

    // Immediately write view state. 
    this.writeViewState();
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hasHeaderExtraContent() { return ValidationUtil.isDefined(this.headerExtraContent); }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If `true`, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If `true`, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If `true`, the current user is the owner of the represented document. 
   * 
   * @param {String} args.listItemTemplate 
   * @param {Array<ViewModel>} args.listItemViewModels 
   * @param {AbstractListItemIndexDataSource} args.indexDataSource The data source of the indices. 
   * @param {String | undefined} args.localizedTitle 
   * @param {Array<ContextMenuItem> | undefined} args.additionalContextMenuItems 
   * @param {Array<SortableListAddItemParams> | undefined} args.addItemParams 
   * @param {Array<SortingOption> | undefined} args.sortingOptions 
   * @param {Boolean | undefined} args.isCollapsible 
   * * default `false`
   * @param {Boolean | undefined} args.isSearchable 
   * * default `false`
   * @param {Boolean | undefined} args.enableFooter 
   * * default `false`
   * @param {Function | undefined} args.searchItemProvder Expected to return `Array<SearchItem>`
   * * If `isSearchable` is true, then this argument should not be left undefined! 
   * @param {TemplatedComponent | undefined} args.headerExtraContent 
   */
  constructor(args = {}) {
    super(args);

    ValidationUtil.validateOrThrow(args, ["listItemViewModels", "listItemTemplate", "indexDataSource"]);

    this.listItemTemplate = args.listItemTemplate;
    this.listItemViewModels = args.listItemViewModels;
    this.indexDataSource = args.indexDataSource;
    this.localizedTitle = args.localizedTitle ?? "";
    this.additionalContextMenuItems = args.additionalContextMenuItems;
    this.addItemParams = args.addItemParams;
    this.sortingOptions = args.sortingOptions;
    this.isCollapsible = args.isCollapsible ?? false;
    this.enableFooter = args.enableFooter ?? false;
    this.isSearchable = args.isSearchable ?? false;
    this.searchItemProvder = args.searchItemProvder ?? (() => { return []; });
    this.headerExtraContent = args.headerExtraContent;

    // View state.
    this.registerViewStateProperty("_searchTerm");
    this.readViewState();

    this.vmContextMenu = new ButtonDropDownViewModel({
      id: "vmContextMenu",
      parent: this,
      menuItems: this.getContextMenuItems(),
    });
    this.vmSortableList = new SortableListViewModel({
      id: "vmSortableList",
      parent: this,
      indexDataSource: this.indexDataSource,
      listItemViewModels: this.listItemViewModels,
      listItemTemplate: this.listItemTemplate,
    });
    if (this.isSearchable) {
      this.vmSearch = new InputSearchTextViewModel({
        id: "vmSearch",
        parent: this,
        isEditable: true, // Should always be true so that observers can also filter. 
        value: this.searchTerm,
        localizedPlaceholder: game.i18n.localize("system.general.search"),
        onChange: (oldValue, newValue) => {
          if (oldValue != newValue) {
            this.searchTerm = newValue;
          }
        },
      });
    }
    if (this.enableFooter) {
      this.vmFooter = new ListFooterViewModel({
        id: "vmFooter",
        parent: this,
        isCollapsible: this.isCollapsible,
        addItemParams: this.addItemParams,
        onExpansionToggled: () => {
          this.vmSortableList.isExpanded = !this.vmSortableList.isExpanded;
        },
      })
    }
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    if (this.isSearchable) {
      // Initial filter, in case a search term is already defined. 
      this._filter(this.searchTerm, this.searchItemProvder());
    }
  }

  /**
   * @returns {Array<ContextMenuItem>}
   * 
   * @private
   */
  getContextMenuItems() {
    const contextMenuItems = this.additionalContextMenuItems ?? [];

    if (ValidationUtil.isDefined(this.addItemParams)) {
      for (const addItemParam of this.addItemParams) {
        contextMenuItems.push(new ContextMenuItem({
          name: addItemParam.localizedLabel,
          icon: '<i class="fas fa-plus"></i>',
          callback: () => {
            addItemParam.creationStrategy.selectAndCreate();
          },
        }));
      }
    }
    if (ValidationUtil.isDefined(this.sortingOptions)) {
      for (const sortingOption of this.sortingOptions) {
        // Ascending sort
        const localizedLabelAscendingSort = StringUtil.format(game.i18n.localize("system.general.sort.sortAscendingBy"),
          (sortingOption.localizedLabel ?? sortingOption.localizedToolTip)
        );
        contextMenuItems.push(new ContextMenuItem({
          name: localizedLabelAscendingSort,
          icon: sortingOption.iconHtml,
          callback: () => {
            this._sort(sortingOption.sortingFunc);
          },
        }));
        // Descending sort
        const localizedLabelDescendingSort = StringUtil.format(game.i18n.localize("system.general.sort.sortDescendingBy"),
          (sortingOption.localizedLabel ?? sortingOption.localizedToolTip)
        );
        const descendingSort = this._getReverseSortFunc(sortingOption.sortingFunc);
        contextMenuItems.push(new ContextMenuItem({
          name: localizedLabelDescendingSort,
          icon: sortingOption.iconHtml,
          callback: () => {
            this._sort(descendingSort);
          },
        }));
      }
    }

    return contextMenuItems;
  }

  /**
   * Sorts the list in-place via the given sorting function. 
   * 
   * @param {Function} sortingFunc 
   * @private
   */
  _sort(sortingFunc) {
    const newViewModelList = this.listItemViewModels.concat([]); // Safe copy
    newViewModelList.sort(sortingFunc);

    this._orderedIdList = newViewModelList.map(vm => 
      vm.entityId
    );

    this._storeItemOrder();
  }

  /**
   * Writes out the item order. 
   * 
   * @param {Boolean | undefined} render If `true`, will re-render the list. 
   * * Default `true`
   * 
   * @private
   */
  _storeItemOrder(render = true) {
    this.indexDataSource.setAll(this._orderedIdList, render);
  }

  /**
   * Filters the list by the given search term. 
   * 
   * @param {String} searchTerm 
   * @param {Array<SearchItem>} searchItems
   * 
   * @private
   */
  _filter(searchTerm, searchItems) {
    const elements = this.vmSortableList.getListElements();
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm.length > 0) {
      // At first, hide all elements. They will be un-hidden again, once the search is done. 
      for (const element of elements) {
        $(element).addClass("hidden");
      }

      const results = new Search().search(searchItems, trimmedSearchTerm, SEARCH_MODES.STRICT_CASE_INSENSITIVE);
      for (const result of results) {
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          if (element.id !== result.id) continue;
          if (result.score > 0) {
            $(element).removeClass("hidden");
          } else {
            $(element).addClass("hidden");
          }
          break;
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
   * Wraps the given function in a new function which reverses the result, useful for 'descending' sorting. 
   * 
   * @param {Function<Number>} sortingFunc A function with which to do comparisons. Must return a numeric result, 
   * the same way `Array.sort` does. Allowed numbers are `-1`, `0` and `1`. 
   * 
   * @returns {Function<Number>} 
   * @private
   */
  _getReverseSortFunc(sortingFunc) {
    return (a, b) => {
      return sortingFunc(b, a);
    }  
  }
}

/**
 * Provides the parameters for the buttons that enable adding items. 
 * 
 * @property {DocumentCreationStrategy} creationStrategy Determines how a user might 
 * be prompted for input, if at all, to determine the creation data for a new document. 
 * @property {String | undefined} localizedToolTip A localized text to 
 * display as a tool tip. 
 * @property {String | undefined} localizedLabel A localized text to 
 * display as a button label. 
 * @property {Function | undefined} onItemAdded If defined, this function will be 
 * invoked upon item creation. Arguments:
 * * `event: Event`
 * * `document: Document`
*/
export class SortableListAddItemParams {
  /**
   * @param {Object} args 
   * @param {DocumentCreationStrategy} args.creationStrategy Determines how a user might 
   * be prompted for input, if at all, to determine the creation data for a new document. 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.localizedLabel A localized text to 
   * display as a button label. 
   * 
   * @param {Function | undefined} args.onItemAdded If defined, this callback function will be 
   * invoked after item creation. Arguments:
   * * `event: Event`
   * * `document: Document`
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["creationStrategy"]);

    this.creationStrategy = args.creationStrategy;
    this.localizedToolTip = args.localizedToolTip;
    this.localizedLabel = args.localizedLabel;
    this.onItemAdded = args.onItemAdded;
  }
}
