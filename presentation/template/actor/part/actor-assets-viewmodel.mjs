import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ItemGridViewViewModel from "../../../component/item-grid/item-grid-view-viewmodel.mjs";
import DocumentListItemOrderDataSource from "../../../component/sortable-list/document-list-item-order-datasource.mjs";
import SortableListViewModel from "../../../component/sortable-list/sortable-list-viewmodel.mjs";
import SheetViewModel from "../../../view-model/sheet-view-model.mjs";
import ItemListItemViewModel from "../../item/item/item-list-item-viewmodel.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";

export default class ActorAssetsViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_ASSETS; }

  /**
   * @type {Actor}
   */
  actor = undefined;

  /** @override */
  get entityId() { return this.actor.id; }

  /**
   * @type {Array<ViewModel>}
   */
  itemViewModels = [];
  
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
   * @param {Actor} args.actor
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["actor"]);

    this.actor = args.actor;
    this.contextType = args.contextType ?? "actor-assets";

    const thiz = this;

    this.vmNsMaxBulk = this.createVmNumberSpinner({
      id: "vmNsMaxBulk",
      propertyOwner: thiz.actor,
      propertyPath: "data.data.assets.maxBulk",
      isEditable: false,
    });
    this.vmNsTotalBulk = this.createVmNumberSpinner({
      id: "vmNsTotalBulk",
      propertyOwner: thiz.actor,
      propertyPath: "data.data.assets.totalBulk",
      isEditable: false,
    });
    this.vmIgv = new ItemGridViewViewModel({
      id: "vmIgv",
      parent: thiz,
      propertyOwner: thiz.actor,
      propertyPath: "data.data.assets",
      isEditable: thiz.isEditable,
      contextTemplate: thiz.contextTemplate,
    });

    const actorItems = this.actor.getPropertyItems();
    for (const item of actorItems) {
      const vm = new ItemListItemViewModel({
        ...args,
        id: item.id,
        parent: thiz,
        item: item,
      });
      this.itemViewModels.push(vm);
    }
    this.vmPropertyList = new SortableListViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      id: "vmPropertyList",
      indexDataSource: new DocumentListItemOrderDataSource({
        propertyOwner: thiz.actor,
        listName: "property",
      }),
      listItemViewModels: this.itemViewModels,
      listItemTemplate: "systems/ambersteel/template/item/item/item-list-item.hbs",
      vmBtnAddItem: thiz.createVmBtnAdd({
        id: "vmBtnAddItem",
        target: thiz.actor,
        creationType: "item",
        withDialog: true,
        localizableLabel: "ambersteel.character.asset.add.label",
        localizableType: "ambersteel.character.asset.singular",
        localizableDialogTitle: "ambersteel.character.asset.add.query",
      }),
    });
  }
}
