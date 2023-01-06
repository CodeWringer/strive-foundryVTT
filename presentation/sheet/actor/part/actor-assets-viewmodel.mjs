import TransientBaseCharacterActor from "../../../../business/document/actor/transient-base-character-actor.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import ItemGridViewViewModel from "../../../component/item-grid/item-grid-view-viewmodel.mjs"
import DocumentListItemOrderDataSource from "../../../component/sortable-list/document-list-item-order-datasource.mjs"
import SortableListViewModel from "../../../component/sortable-list/sortable-list-viewmodel.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModelFactory from "../../../view-model/view-model-factory.mjs"
import ViewModel from "../../../view-model/view-model.mjs"
import AssetListItemViewModel from "../../item/asset/asset-list-item-viewmodel.mjs"

export default class ActorAssetsViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_ASSETS; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {Array<ViewModel>}
   */
  itemViewModels = [];


  /**
   * Returns the maximum bulk. 
   * 
   * @type {Number}
   * @readonly
   */
  get maxBulk() { return this.document.assets.maxBulk; }

  /**
   * Returns the currently used bulk. 
   * 
   * @type {Number}
   * @readonly
   */
  get currentBulk() { return this.document.assets.currentBulk; }
  
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
   * @param {TransientBaseCharacterActor} args.document
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;
    this.contextType = args.contextType ?? "actor-assets";

    const thiz = this;
    const factory = new ViewModelFactory();

    this.vmIgv = new ItemGridViewViewModel({
      id: "vmIgv",
      parent: thiz,
      propertyOwner: thiz.document,
      propertyPath: "assets",
      isEditable: thiz.isEditable,
      contextTemplate: thiz.contextTemplate,
    });

    const remoteAssets = this.document.assets.remote;
    for (const remoteAsset of remoteAssets) {
      const vm = new AssetListItemViewModel({
        ...args,
        id: remoteAsset.id,
        parent: thiz,
        document: remoteAsset,
      });
      this.itemViewModels.push(vm);
    }
    this.vmPropertyList = new SortableListViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      id: "vmPropertyList",
      indexDataSource: new DocumentListItemOrderDataSource({
        document: thiz.document,
        listName: "property",
      }),
      listItemViewModels: this.itemViewModels,
      listItemTemplate: TEMPLATES.ASSET_LIST_ITEM,
      vmBtnAddItem: factory.createVmBtnAdd({
        parent: thiz,
        id: "vmBtnAddItem",
        target: thiz.document,
        creationType: "item",
        withDialog: true,
        localizableLabel: "ambersteel.character.asset.add.label",
        localizableType: "ambersteel.character.asset.singular",
        localizableDialogTitle: "ambersteel.character.asset.add.query",
      }),
    });
  }
}
