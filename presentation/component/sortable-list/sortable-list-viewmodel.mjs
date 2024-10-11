import { ArrayUtil } from "../../../business/util/array-utility.mjs";
import { UuidUtil } from "../../../business/util/uuid-utility.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonAddViewModel from "../button-add/button-add-viewmodel.mjs";
import ButtonToggleVisibilityViewModel from "../button-toggle-visibility/button-toggle-visibility-viewmodel.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import SortControlsViewModel from "../sort-controls/sort-controls-viewmodel.mjs";

/**
 * This object groups the view models of one list item, to pass through to the UI. 
 * 
 * @property {String} id 
 * @property {ViewModel} vmBtnMoveUp 
 * @property {ViewModel} vmBtnMoveDown 
 * @property {ViewModel} listItemViewModel 
 * 
 * @private
 */
class SortableListViewModelGroup {
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["id", "vmBtnMoveUp", "vmBtnMoveDown", "listItemViewModel"]);

    this.id = args.id;
    this.vmBtnMoveUp = args.vmBtnMoveUp;
    this.vmBtnMoveDown = args.vmBtnMoveDown;
    this.listItemViewModel = args.listItemViewModel;
  }
}

/**
 * Provides the parameters for the buttons that enable adding items. 
 * 
 * @property {Document | TransientDocument} target
 * @property {ITEM_TYPES} creationType
 * @property {Object | undefined} creationData
 * @property {Boolean} withDialog
 * @property {String | undefined} localizedLabel
 * @property {String | undefined} localizedToolTip
 * @property {String | undefined} localizedType
 * @property {Function | undefined} onItemAdded If defined, this function will be 
 * invoked upon item creation. Arguments:
 * * `event: Event`
 * * `document: Document`
*/
export class SortableListAddItemParams {
  /**
   * @param {Object} args 
   * @param {Document | TransientDocument} args.target
   * @param {ITEM_TYPES} args.creationType
   * @param {Object | undefined} args.creationData
   * @param {Boolean} args.withDialog
   * @param {String | undefined} args.localizedLabel
   * @param {String | undefined} args.localizedToolTip
   * @param {String | undefined} args.localizedType
   * @param {Function | undefined} args.onItemAdded If defined, this callback function will be 
   * invoked upon item creation. Arguments:
   * * `event: Event`
   * * `document: Document`
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["target", "creationType", "withDialog"]);

    this.target = args.target;
    this.creationType = args.creationType;
    this.creationData = args.creationData;
    this.localizedLabel = args.localizedLabel;
    this.localizedToolTip = args.localizedToolTip;
    this.localizedType = args.localizedType;
    this.withDialog = args.withDialog;
    this.onItemAdded = args.onItemAdded;
  }
}

/**
 * Provides the parameters for the buttons that enable sorting items. 
 * 
 * @property {Array<SortingOption>} options
 * @property {Boolean} compact
 * @property {Function} onSort If defined, this callback function will be 
 * invoked upon item sorting. Arguments:
 * * `event: Event`
 */
export class SortableListSortParams {
  /**
   * @param {Object} args 
   * @param {Array<SortingOption>} args.options
   * @param {Boolean} args.compact
   * @param {Function} args.onSort If defined, this callback function will be 
   * invoked upon item sorting. Arguments:
   * * `event: Event`
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["options", "compact"]);

    this.options = args.options;
    this.compact = args.compact;
    this.onSort = args.onSort;
  }
}

/**
 * Represents a sortable and orderable list of arbitrary entries. 
 * 
 * @extends ViewModel
 * 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 */
export default class SortableListViewModel extends ViewModel {
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPONENT_SORTABLE_LIST; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('sortableList', `{{> "${SortableListViewModel.TEMPLATE}"}}`);
  }

  /**
   * This is a list of `entityId`s, in the order that they should be rendered in the list. 
   * 
   * It is possible this list contains obsolete information, for example after an item 
   * is deleted, its entry in this list must also be removed. Or a new item might have 
   * been added, which isn't yet in this list and has yet to be added. 
   * 
   * @type {Array<String>}
   * @private
   */
  _orderedIdList = [];

  /**
   * An array of view models that belong to the entries. 
   * 
   * @type {Array<SortableListViewModelGroup>}
   */
  itemViewModelGroups = [];

  /**
   * Returns the `SortControlsViewModel.TEMPLATE`, for use in a Handlebars "with" block. 
   * 
   * @type {String}
   * @readonly
   */
  get sortControlsTemplate() { return SortControlsViewModel.TEMPLATE; }

  /**
   * Returns `true`, if there is an "add" button view model. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get hasAddButton() { return ValidationUtil.isDefined(this.vmAddItem1) && ValidationUtil.isDefined(this.vmAddItem2); }

  /**
   * Returns `true`, if sorting controls are defined. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get hasSortControls() { return ValidationUtil.isDefined(this.vmSortControls); }
  
  /**
   * @type {Boolean}
   * @private
   */
  _isCollapsible = false;
  /**
   * @type {Boolean}
   */
  get isCollapsible() {
    return this._isCollapsible;
  }
  set isCollapsible(value) {
    this._isCollapsible = value;
    if (value === false) {
      this.isExpanded = true;
    }
  }
  
  /**
   * @type {Boolean}
   * @private
   */
  _isExpanded = true;
  /**
   * @type {Boolean}
   */
  get isExpanded() {
    return this._isExpanded;
  }
  set isExpanded(value) {
    if (!this.isCollapsible) return;

    this._isExpanded = value;

    // Synchronize the toggle buttons. 
    this.vmToggleExpansion1.value = value;
    this.vmToggleExpansion2.value = value;
    // Hide the second expansion toggle button if the expertise list is currently hidden. 
    if (value === true) {
      this.vmToggleExpansion2.element.parent().removeClass("hidden");
    } else {
      this.vmToggleExpansion2.element.parent().addClass("hidden");
    }

    // Immediately write view state. 
    this.writeViewState();
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {ViewModel | undefined} args.parent 
   * 
   * @param {Boolean | undefined} args.isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Name or path of a template that embeds this input component. 
   * 
   * @param {AbstractListItemIndexDataSource} args.indexDataSource The data source of the indices. 
   * @param {Array<ViewModel>} args.listItemViewModels A list of item view models.
   * @param {String} args.listItemTemplate The absolute path of the template to use for list items. 
   * @param {String | undefined} args.localizedTitle The localized title to display at 
   * the head of the list. 
   * @param {Number | undefined} args.headerLevel
   * * Default `1`
   * @param {Boolean | undefined} args.isCollapsible If `true`, the list will be collapsible. 
   * * Default `false`
   * @param {Boolean | undefined} args.isExpanded If `true`, the list is initially expanded. 
   * * Default `true`
   * * If `isCollapsible` is set to `false`, will **always** be `true`. 
   * @param {SortableListAddItemParams | undefined} args.addItemParams If defined, 
   * buttons to add items will be shown, using these settings. 
   * @param {SortableListSortParams | undefined} args.sortParams If defined, 
   * buttons to sort items will be shown, using these settings. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["indexDataSource", "listItemViewModels", "listItemTemplate"]);

    this.indexDataSource = args.indexDataSource;
    this.contextTemplate = args.contextTemplate ?? "sortable-list";
    this.listItemTemplate = args.listItemTemplate;
    this.localizedTitle = args.localizedTitle;
    this.headerLevel = args.headerLevel ?? 1;
    this._isCollapsible = args.isCollapsible ?? false;
    this._isExpanded = args.isCollapsible ? (args.isExpanded ?? true) : true;
    this._addItemParams = args.addItemParams;
    this._visGroupId = UuidUtil.createUUID();

    this.registerViewStateProperty("_isExpanded");

    this.vmToggleExpansion1 = new ButtonToggleVisibilityViewModel({
      parent: this,
      id: "vmToggleExpansion1",
      isEditable: true,
      value: this.isExpanded,
      iconInactive: '<i class="fas fa-angle-double-down"></i>',
      iconActive: '<i class="fas fa-angle-double-up"></i>',
      visGroup: this._visGroupId,
      onClick: async (event, data) => {
        this.isExpanded = !this.isExpanded;
      },
    });
    this.vmToggleExpansion2 = new ButtonToggleVisibilityViewModel({
      parent: this,
      id: "vmToggleExpansion2",
      isEditable: true,
      value: this.isExpanded,
      iconInactive: '<i class="fas fa-angle-double-down"></i>',
      iconActive: '<i class="fas fa-angle-double-up"></i>',
      visGroup: this._visGroupId,
      onClick: async (event, data) => {
        this.isExpanded = !this.isExpanded;
      },
    });
    if (ValidationUtil.isDefined(args.addItemParams)) {
      this.vmAddItem1 = new ButtonAddViewModel({
        id: "vmAddItem1",
        parent: this,
        target: args.addItemParams.target,
        creationType: args.addItemParams.creationType,
        creationData: args.addItemParams.creationData,
        withDialog: args.addItemParams.withDialog,
        localizedToolTip: args.addItemParams.localizedToolTip,
        localizedType: args.addItemParams.localizedType,
        onClick: (event, data) => {
          if (ValidationUtil.isDefined(args.addItemParams.onItemAdded)) {
            args.addItemParams.onItemAdded(event, data);
          }
        },
      });
      this.vmAddItem2 = new ButtonAddViewModel({
        id: "vmAddItem2",
        parent: this,
        target: args.addItemParams.target,
        creationType: args.addItemParams.creationType,
        creationData: args.addItemParams.creationData,
        withDialog: args.addItemParams.withDialog,
        localizedLabel: args.addItemParams.localizedLabel,
        localizedType: args.addItemParams.localizedType,
        onClick: (event, data) => {
          if (ValidationUtil.isDefined(args.addItemParams.onItemAdded)) {
            args.addItemParams.onItemAdded(event, data);
          }
        },
      });
    }

    if (ValidationUtil.isDefined(args.sortParams) && args.sortParams.options.length > 0) {
      this.vmSortControls = new SortControlsViewModel({
        id: "vmSortControls",
        parent: this,
        options: args.sortParams.options,
        compact: args.sortParams.compact,
        onSort: (event, provideSortable) => {
          provideSortable(this);
          if (ValidationUtil.isDefined(args.sortParams.onSort)) {
            args.sortParams.onSort(event);
          }
        },
      });
    }
    
    // Prepare given list. 
    this.listItemViewModels = args.listItemViewModels;
    for (const listItemViewModel of this.listItemViewModels) {
      listItemViewModel.parent = this;
    }

    this._orderedIdList = this._getOrderedIdList();

    // Generate data for the ui. 
    this.itemViewModelGroups = this._generateViewModelGroups();
  }

  /**
   * Updates the data of this view model. 
   * 
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document.
   * * Default `false`. 
   * @param {Array<ViewModel>} args.listItemViewModels A list of item view models.
   * 
   * @override
   */
  update(args = {}) {
    ValidationUtil.validateOrThrow(args, ["listItemViewModels"]);

    // TODO #85: Preserve list items as possible. No need to replace all list item view models every time, if not all items have changed. 

    // Unset parent from current list.
    for (const listItemViewModel of this.listItemViewModels) {
      listItemViewModel.parent = undefined;
    }
    
    // Override current list with given list. 
    this.listItemViewModels = args.listItemViewModels;
    
    // Set parent on given list. 
    for (const listItemViewModel of this.listItemViewModels) {
      listItemViewModel.parent = this;
    }

    this._orderedIdList = this._getOrderedIdList();

    // Clean up of previous ui data. 
    for (const itemViewModelGroup of this.itemViewModelGroups) {
      itemViewModelGroup.vmBtnMoveUp.parent = undefined;
      itemViewModelGroup.vmBtnMoveDown.parent = undefined;
    }
    // Generate new data for the ui. 
    this.itemViewModelGroups = this._generateViewModelGroups();

    super.update(args);
  }

  /** @override */
  dispose() {
    if (this.isEditable === true) {
      this._storeItemOrder(false);
    }
    super.dispose();
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
   * @example
   * ```JS
   * mySortableList.sort((a, b) => {
   *   return a.document.name.localeCompare(b.document.name);
   * });
   * ```
   * 
   */
  sort(sortingFunc) {
    const newViewModelList = this.listItemViewModels.concat([]); // Safe copy
    newViewModelList.sort(sortingFunc);

    this._orderedIdList = newViewModelList.map(vm => 
      vm.entityId
    );

    this._storeItemOrder();
  }
 
  /**
   * Returns a `SortableListViewModelGroup` instance, based on the given id and item view model. 
   * 
   * @param {String} id 
   * @param {ViewModel} itemViewModel 
   * @param {Boolean | undefined} upButtonsDisabled Optional. 
   * @param {Boolean | undefined} downButtonsDisabled Optional. 
   * 
   * @returns {SortableListViewModelGroup}
   */
  _generateViewModelGroup(id, itemViewModel, upButtonsDisabled, downButtonsDisabled) {
    const thiz = this;
    return new SortableListViewModelGroup({
      id: id,
      vmBtnMoveUp: new ButtonViewModel({
        parent: thiz,
        isEditable: upButtonsDisabled ?? thiz.isEditable,
        id: `${id}-vmBtnMoveUp`,
        iconHtml: '<i class="fas fa-angle-up"></i>',
        onClick: (event) => {
          if (event.ctrlKey || event.shiftKey) {
            thiz._moveToTop(id);
          } else {
            thiz._moveUp(id);
          }
        },
        localizedToolTip: game.i18n.localize("system.general.ordering.moveUp"),
      }),
      vmBtnMoveDown: new ButtonViewModel({
        parent: thiz,
        isEditable: downButtonsDisabled ?? thiz.isEditable,
        id: `${id}-vmBtnMoveDown`,
        iconHtml: '<i class="fas fa-angle-down"></i>',
        onClick: (event) => {
          if (event.ctrlKey || event.shiftKey) {
            thiz._moveToBottom(id);
          } else {
            thiz._moveDown(id);
          }
        },
        localizedToolTip: game.i18n.localize("system.general.ordering.moveDown"),
      }),
      listItemViewModel: itemViewModel,
    });
  }

  /**
   * Generates and returns the groups of view models based on the ordered id list. 
   * 
   * @returns {Array<SortableListViewModelGroup>}
   * 
   * @private
   */
  _generateViewModelGroups() {
    const result = [];

    for (let i = 0; i < this._orderedIdList.length; i++) {
      const id = this._orderedIdList[i];
      const listItemViewModel = this.listItemViewModels.find(it => it.entityId === id);

      const upButtonsEnabled = i > 0;
      const downButtonsEnabled = i < this._orderedIdList.length - 1;

      const itemViewModelGroup = this._generateViewModelGroup(id, listItemViewModel, upButtonsEnabled, downButtonsEnabled);
      result.push(itemViewModelGroup);
    }

    return result;
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
   * Callback for moving an item to the top. 
   * 
   * @param {String} id Id of the item to move. 
   * 
   * @private
   * @async
   */
  async _moveToTop(id) {
    ArrayUtil.moveArrayElement(this._orderedIdList, id, 0);
    this._storeItemOrder();
  }

  /**
   * Callback for moving an item up. 
   * 
   * @param {String} id Id of the item to move. 
   * 
   * @private
   * @async
   */
  async _moveUp(id) {
    ArrayUtil.moveArrayElementBy(this._orderedIdList, id, -1);
    this._storeItemOrder();
  }

  /**
   * Callback for moving an item down. 
   * 
   * @param {String} id Id of the item to move. 
   * 
   * @private
   * @async
   */
  async _moveDown(id) {
    ArrayUtil.moveArrayElementBy(this._orderedIdList, id, 1);
    this._storeItemOrder();
  }

  /**
   * Callback for moving an item to the bottom. 
   * 
   * @param {String} id Id of the item to move. 
   * 
   * @private
   * @async
   */
  async _moveToBottom(id) {
    ArrayUtil.moveArrayElement(this._orderedIdList, id, this._orderedIdList.length - 1);
    this._storeItemOrder();
  }

  /**
   * Fetches and returns the list of ordered item IDs from the data source. 
   * 
   * Culls missing IDs and adds new IDs from the given view model list. 
   * 
   * @returns {Array<String>}
   * 
   * @private
   */
  _getOrderedIdList() {
    const result = [];

    // The ordered IDs currently stored on the document. 
    const existingIds = this.indexDataSource.getAll();

    // Cull removed entries. 
    for (const existingId of existingIds) {
      const listItemViewModel = this.listItemViewModels.find(it => it.entityId === existingId);
      if (listItemViewModel !== undefined) {
        result.push(existingId);
      }
    }

    // Add new entries.
    for (const listItemViewModel of this.listItemViewModels) {
      if (ArrayUtil.arrayContains(result, listItemViewModel.entityId) !== true) {
        result.push(listItemViewModel.entityId);
      }
    }

    return result;
  }
}
