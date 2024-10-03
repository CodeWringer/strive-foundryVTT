import { arrayContains } from "../../../business/util/array-utility.mjs";
import { moveArrayElement, moveArrayElementBy } from "../../../business/util/array-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

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
    this.id = args.id;
    this.vmBtnMoveUp = args.vmBtnMoveUp;
    this.vmBtnMoveDown = args.vmBtnMoveDown;
    this.listItemViewModel = args.listItemViewModel;
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
   * Returns `true`, if there is an "add" button view model. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get hasAddButton() { return this.vmBtnAddItem !== undefined; }

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
   * @param {ViewModel | undefined} args.vmBtnAddItem View model of the add item button. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["indexDataSource", "listItemViewModels", "listItemTemplate"]);

    this.indexDataSource = args.indexDataSource;
    this.contextTemplate = args.contextTemplate ?? "sortable-list";
    this.listItemTemplate = args.listItemTemplate;
    
    // Prepare given list. 
    this.listItemViewModels = args.listItemViewModels;
    for (const listItemViewModel of this.listItemViewModels) {
      listItemViewModel.parent = this;
    }

    // Prepare given "add" button, if necessary. 
    this.vmBtnAddItem = args.vmBtnAddItem;
    if (this.vmBtnAddItem !== undefined) {
      this.vmBtnAddItem.parent = this;
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
    validateOrThrow(args, ["listItemViewModels"]);

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
   * @param {Boolean | undefined} render 
   * @private
   */
  _storeItemOrder(render = true) {
    this.indexDataSource.setAll(this._orderedIdList, render);
  }

  /**
   * Callback for moving an item to the top. 
   * @param {} item 
   * @private
   * @async
   */
  async _moveToTop(id) {
    moveArrayElement(this._orderedIdList, id, 0);
    this._storeItemOrder();
  }

  /**
   * Callback for moving an item up. 
   * @private
   * @async
   */
  async _moveUp(id) {
    moveArrayElementBy(this._orderedIdList, id, -1);
    this._storeItemOrder();
  }

  /**
   * Callback for moving an item down. 
   * @private
   * @async
   */
  async _moveDown(id) {
    moveArrayElementBy(this._orderedIdList, id, 1);
    this._storeItemOrder();
  }

  /**
   * Callback for moving an item to the bottom. 
   * @private
   * @async
   */
  async _moveToBottom(id) {
    moveArrayElement(this._orderedIdList, id, this._orderedIdList.length - 1);
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
      if (arrayContains(result, listItemViewModel.entityId) !== true) {
        result.push(listItemViewModel.entityId);
      }
    }

    return result;
  }
}
