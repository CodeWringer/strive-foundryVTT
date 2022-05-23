import ItemGridViewViewModel from "../../../module/components/item-grid/item-grid-view-viewmodel.mjs";
import SheetViewModel from "../../../module/components/sheet-viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";
import ItemListItemViewModel from "../../item/item/item-list-item-viewmodel.mjs";

export default class ActorAssetsViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_ASSETS; }

  /**
   * @type {Actor}
   */
  actor = undefined;

  /**
   * @type {Object}
   */
  itemViewModels = Object.create(null);
  
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
    this.vmBtnAddItem = this.createVmBtnAdd({
      id: "vmBtnAddItem",
      target: thiz.actor,
      creationType: "item",
      withDialog: true,
    });

    for (const item of this.actor.propertyItems) {
      this.itemViewModels[item.id] = new ItemListItemViewModel({
        ...args,
        id: item.id,
        parent: thiz,
        item: item,
      });
    }
  }
}
