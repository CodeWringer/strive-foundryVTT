import { arrayContains } from "../../../business/util/array-utility.mjs";
import { moveArrayElement, moveArrayElementBy } from "../../../business/util/array-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * This object groups the view models of one list item, to pass through to the UI. 
 * 
 * @property {String} id 
 * @property {ViewModel} vmBtnMoveTop 
 * @property {ViewModel} vmBtnMoveUp 
 * @property {ViewModel} vmBtnMoveDown 
 * @property {ViewModel} vmBtnMoveBottom 
 * @property {ViewModel} vmBtnAddItem 
 * @property {ViewModel} listItemViewModel 
 * @property {String} listItemTemplate 
 * 
 * @private
 */
class SortableListViewModelGroup {
  constructor(args = {}) {
    this.id = args.id;
    this.vmBtnMoveTop = args.vmBtnMoveTop;
    this.vmBtnMoveUp = args.vmBtnMoveUp;
    this.vmBtnMoveDown = args.vmBtnMoveDown;
    this.vmBtnMoveBottom = args.vmBtnMoveBottom;
    this.vmBtnAddItem = args.vmBtnAddItem;
    this.listItemViewModel = args.listItemViewModel;
    this.listItemTemplate = args.listItemTemplate;
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
  static get TEMPLATE() { return TEMPLATES.COMPONENT_SORTABLE_LIST; }

  /**
   * An array of view models that belong to the entries. 
   * 
   * @type {Array<SortableListViewModelGroup>}
   */
  itemViewModelGroups = [];

  /**
   * This is a list of ids, in the order that they should be rendered in the list. 
   * 
   * It is possible this list contains obsolete information, for example after an item 
   * is deleted, its entry in this list must also be removed. Or a new item might have 
   * been added, which isn't yet in this list and has yet to be added. 
   * 
   * @type {Array<String>}
   * @private
   */
  orderedIdList = [];

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {Boolean | undefined} args.isEditable Optional. If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a template that embeds this input component. 
   * 
   * @param {AbstractListItemIndexDataSource} args.indexDataSource The data source of the indices. 
   * @param {Array<ViewModel>} args.listItemViewModels A list of item view models.
   * @param {String} args.listItemTemplate The absolute path of the template to use for list items. 
   * @param {ViewModel} args.vmBtnAddItem View model of the add item button. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["indexDataSource", "listItemViewModels", "listItemTemplate"]);

    this.indexDataSource = args.indexDataSource;
    this.listItemViewModels = args.listItemViewModels;
    this.listItemTemplate = args.listItemTemplate;
    this.vmBtnAddItem = args.vmBtnAddItem;
    this.contextTemplate = args.contextTemplate ?? "sortable-list";

    this.orderedIdList = this._getOrderedIdList();
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
   * @param {Map<String, Object> | undefined} args.childArgs Do not use!
   * * Intended for internal use, only. 
   * @param {Array<ViewModel>} args.listItemViewModels A list of item view models.
   * 
   * @override
   */
  update(args = {}, childArgs = new Map()) {
    validateOrThrow(args, ["listItemViewModels"]);

    this.listItemViewModels = args.listItemViewModels;

    this.orderedIdList = this._getOrderedIdList();
    // Generate data for the ui. 
    this.itemViewModelGroups = this._generateViewModelGroups();

    super.update(args, childArgs);
  }

  /** @override */
  dispose() {
    if (this.isEditable === true) {
      this._storeItemOrder(false);
    }
    super.dispose();
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
      vmBtnMoveTop: new ButtonViewModel({
        parent: thiz,
        isEditable: upButtonsDisabled ?? thiz.isEditable,
        id: `${id}-vmBtnMoveTop`,
        onClick: () => { thiz._moveToTop(id); },
        localizableTitle: "ambersteel.general.ordering.moveToTop",
      }),
      vmBtnMoveUp: new ButtonViewModel({
        parent: thiz,
        isEditable: upButtonsDisabled ?? thiz.isEditable,
        id: `${id}-vmBtnMoveUp`,
        onClick: () => { thiz._moveUp(id); },
        localizableTitle: "ambersteel.general.ordering.moveUp",
      }),
      vmBtnMoveDown: new ButtonViewModel({
        parent: thiz,
        isEditable: downButtonsDisabled ?? thiz.isEditable,
        id: `${id}-vmBtnMoveDown`,
        onClick: () => { thiz._moveDown(id); },
        localizableTitle: "ambersteel.general.ordering.moveDown",
      }),
      vmBtnMoveBottom: new ButtonViewModel({
        parent: thiz,
        isEditable: downButtonsDisabled ?? thiz.isEditable,
        id: `${id}-vmBtnMoveBottom`,
        onClick: () => { thiz._moveToBottom(id); },
        localizableTitle: "ambersteel.general.ordering.moveToBottom",
      }),
      listItemViewModel: itemViewModel,
      listItemTemplate: thiz.listItemTemplate,
      vmBtnAddItem: thiz.vmBtnAddItem,
    });
  }

  /**
   * @returns {Array<SortableListViewModelGroup>}
   * 
   * @private
   */
  _generateViewModelGroups() {
    const result = [];

    for (let i = 0; i < this.orderedIdList.length; i++) {
      const id = this.orderedIdList[i];
      const listItemViewModel = this.listItemViewModels.find(it => it.entityId === id);

      const upButtonsEnabled = i > 0;
      const downButtonsEnabled = i < this.orderedIdList.length - 1;

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
    this.indexDataSource.setAll(this.orderedIdList, render);
  }

  /**
   * Callback for moving an item to the top. 
   * @param {} item 
   * @private
   * @async
   */
  async _moveToTop(id) {
    moveArrayElement(this.orderedIdList, id, 0);
    this._storeItemOrder();
  }

  /**
   * Callback for moving an item up. 
   * @private
   * @async
   */
  async _moveUp(id) {
    moveArrayElementBy(this.orderedIdList, id, -1);
    this._storeItemOrder();
  }

  /**
   * Callback for moving an item down. 
   * @private
   * @async
   */
  async _moveDown(id) {
    moveArrayElementBy(this.orderedIdList, id, 1);
    this._storeItemOrder();
  }

  /**
   * Callback for moving an item to the bottom. 
   * @private
   * @async
   */
  async _moveToBottom(id) {
    moveArrayElement(this.orderedIdList, id, this.orderedIdList.length - 1);
    this._storeItemOrder();
  }

  /**
   * @returns {Array<String>}
   * 
   * @private
   */
  _getOrderedIdList() {
    const result = [];

    // The ordered IDs currently stroed on the document. 
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
      if (arrayContains(result, listItemViewModel.entityId) === true) {
        continue;
      } else {
        result.push(listItemViewModel.entityId);
      }
    }

    return result;
  }
}

Handlebars.registerPartial('sortableList', `{{> "${SortableListViewModel.TEMPLATE}"}}`);
