import { TEMPLATES } from "../../templatePreloader.mjs";
import { moveArrayElement, moveArrayElementBy } from "../../utils/array-utility.mjs";
import { validateOrThrow } from "../../utils/validation-utility.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import SheetViewModel from "../sheet-viewmodel.mjs";
import ViewModel from "../viewmodel.mjs";

/**
 * This object groups the view models of one list item, to pass through to the 
 * UI. 
 * @private
 * @property {ViewModel} vmBtnMoveTop 
 * @property {ViewModel} vmBtnMoveUp 
 * @property {ViewModel} vmBtnMoveDown 
 * @property {ViewModel} vmBtnMoveBottom 
 * @property {ViewModel} vmBtnAddItem 
 * @property {ViewModel} listItemViewModel 
 * @property {String} listItemTemplate 
 */
class SortableListViewModelGroup {
  constructor(args = {}) {
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
 * --- Inherited from ViewModel
 * 
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Own properties
 * 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * 
 */
export default class SortableListViewModel extends SheetViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_SORTABLE_LIST; }

  /**
   * @type {Array<SortableListViewModelGroup>}
   */
  itemViewModelGroups = [];

  /**
   * @type {Array<String>}
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

    const thiz = this;

    // Get the item order. 

    // This is only a list of IDs, in the order that they should be rendered in the list. 
    // It is possible this list contains obsolete information, for example after an item 
    // is deleted, its entry in this list must also be removed. 
    // Or a new item might have been added, which isn't yet in this list and has to 
    // be added. 
    const orderedIdList = this.indexDataSource.getAll();

    // Cull obsolete entries. 
    for (let i = orderedIdList.length -1; i >= 0; i--) {
      const listItemViewModel = this.listItemViewModels.find(it => it.entityId === orderedIdList[i]);
      if (listItemViewModel === undefined) {
        orderedIdList.splice(i, 1);
      }
    }

    // Add new entries. 
    for (const listItemViewModel of this.listItemViewModels) {
      const entityId = listItemViewModel.entityId;
      const id = orderedIdList.find(it => it === entityId);
      if (id === undefined) {
        orderedIdList.push(entityId);
      }
    }

    // Ensure the ordered ids remain accessible. 
    this.orderedIdList = orderedIdList;

    // Generate data for the ui. 
    for (let i = 0; i < orderedIdList.length; i++) {
      const id = orderedIdList[i];
      const listItemViewModel = this.listItemViewModels.find(it => it.entityId === id);

      const upButtonsDisabled = i === 0;
      const downButtonsDisabled = i === orderedIdList.length - 1;

      const itemViewModelGroup = this._generateViewModelGroup(id, listItemViewModel, !upButtonsDisabled, !downButtonsDisabled);
      this.itemViewModelGroups.push(itemViewModelGroup);
    }
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
   * @param {String} id 
   * @param {ViewModel} itemViewModel 
   * @param {Boolean | undefined} upButtonsDisabled Optional. 
   * @param {Boolean | undefined} downButtonsDisabled Optional. 
   * @returns {SortableListViewModelGroup}
   */
  _generateViewModelGroup(id, itemViewModel, upButtonsDisabled, downButtonsDisabled) {
    const thiz = this;
    return new SortableListViewModelGroup({
      vmBtnMoveTop: new ButtonViewModel({
        parent: thiz,
        isEditable: upButtonsDisabled ?? thiz.isEditable,
        id: `${id}-vmBtnMoveTop`,
        onClick: () => { thiz._moveToTop(id); },
        localizableTitle: "ambersteel.itemOrdering.moveToTop",
      }),
      vmBtnMoveUp: new ButtonViewModel({
        parent: thiz,
        isEditable: upButtonsDisabled ?? thiz.isEditable,
        id: `${id}-vmBtnMoveUp`,
        onClick: () => { thiz._moveUp(id); },
        localizableTitle: "ambersteel.itemOrdering.moveUp",
      }),
      vmBtnMoveDown: new ButtonViewModel({
        parent: thiz,
        isEditable: downButtonsDisabled ?? thiz.isEditable,
        id: `${id}-vmBtnMoveDown`,
        onClick: () => { thiz._moveDown(id); },
        localizableTitle: "ambersteel.itemOrdering.moveDown",
      }),
      vmBtnMoveBottom: new ButtonViewModel({
        parent: thiz,
        isEditable: downButtonsDisabled ?? thiz.isEditable,
        id: `${id}-vmBtnMoveBottom`,
        onClick: () => { thiz._moveToBottom(id); },
        localizableTitle: "ambersteel.itemOrdering.moveToBottom",
      }),
      listItemViewModel: itemViewModel,
      listItemTemplate: thiz.listItemTemplate,
      vmBtnAddItem: thiz.vmBtnAddItem,
    });
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
}

Handlebars.registerPartial('sortableList', `{{> "${SortableListViewModel.TEMPLATE}"}}`);
