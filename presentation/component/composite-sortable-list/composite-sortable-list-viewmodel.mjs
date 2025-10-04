import { Search, SEARCH_MODES } from "../../../business/search/search.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonContextMenuViewModel, { ContextMenuItem } from "../button-context-menu/button-context-menu-viewmodel.mjs";
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
   */
  constructor(args = {}) {
    super(args);

    ValidationUtil.validateOrThrow(args, ["listItemViewModels", "listItemTemplate", "indexDataSource"]);

    this.listItemTemplate = args.listItemTemplate;
    this.listItemViewModels = args.listItemViewModels;
    this.indexDataSource = args.indexDataSource;
    this.localizedTitle = args.localizedTitle ?? "";
    this.addItemParams = args.addItemParams;
    this.sortingOptions = args.sortingOptions;
    this.isCollapsible = args.isCollapsible ?? false;
    this.enableFooter = args.enableFooter ?? false;
    this.isSearchable = args.isSearchable ?? false;
    this.searchItemProvder = args.searchItemProvder ?? (() => { return []; });

    // View state.
    this.registerViewStateProperty("_searchTerm");
    this.readViewState();

    this.vmContextMenu = new ButtonContextMenuViewModel({
      id: "vmContextMenu",
      parent: this,
      menuItems: this.getContextMenuItems(),
    });
    this.vmSortableList = new SortableListViewModel({
      id: "vmSortableList",
      parent: this,
      isCollapsible: this.isCollapsible,
      indexDataSource: this.indexDataSource,
      listItemViewModels: this.listItemViewModels,
      listItemTemplate: this.listItemTemplate,
      headerLevel: 3,
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

    // Initial filter, in case a search term is already defined. 
    this._filter(value, this.searchItemProvder());
  }

  /**
   * @returns {Array<ContextMenuItem>}
   * 
   * @private
   */
  getContextMenuItems() {
    const contextMenuItems = [];

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
        contextMenuItems.push(new ContextMenuItem({
          name: sortingOption.localizedLabel ?? sortingOption.localizedToolTip,
          icon: sortingOption.iconHtml,
          callback: () => {
            this._sort(sortingOption.sortingFunc);
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

}
