import TransientBaseCharacterActor from "../../../../business/document/actor/transient-base-character-actor.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import ItemGridViewViewModel from "../../../component/item-grid/item-grid-view-viewmodel.mjs"
import DocumentListItemOrderDataSource from "../../../component/sortable-list/document-list-item-order-datasource.mjs"
import SortableListViewModel from "../../../component/sortable-list/sortable-list-viewmodel.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModelFactory from "../../../view-model/view-model-factory.mjs"
import ViewModel from "../../../view-model/view-model.mjs"
import AssetListItemViewModel from "../../item/asset/asset-list-item-viewmodel.mjs"

/**
 * @property {Array<AssetListItemViewModel>} listItemViewModels 
 * @property {Number} maxBulk 
 * @property {Number} currentBulk 
 * 
 * @property {ViewModel} vmIgv 
 * @property {ViewModel} vmPropertyList 
 */
export default class ActorAssetsViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_ASSETS; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {Array<AssetListItemViewModel>}
   */
  listItemViewModels = [];

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

    this.listItemViewModels = this._getAssetViewModels();

    this.vmPropertyList = new SortableListViewModel({
      parent: this,
      isEditable: this.isEditable,
      id: "vmPropertyList",
      indexDataSource: new DocumentListItemOrderDataSource({
        document: thiz.document,
        listName: "property",
      }),
      listItemViewModels: this.listItemViewModels,
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
   * 
   * @override
   */
  update(args = {}, childArgs = new Map()) {
    this.listItemViewModels = this._getAssetViewModels();
    childArgs.set(this.vmPropertyList.id, {
      isEditable: this.isEditable,
      listItemViewModels: this.listItemViewModels,
    });

    super.update(args, childArgs);
  }

  /**
   * @returns {Array<AssetListItemViewModel>}
   * 
   * @private
   */
  _getAssetViewModels() {
    const result = [];
    
    const remoteAssets = this.document.assets.remote;
    for (const remoteAsset of remoteAssets) {
      let vm = this.listItemViewModels.find(it => it.id === remoteAsset.id);
      if (vm === undefined) {
        vm = new AssetListItemViewModel({
          id: remoteAsset.id,
          parent: this,
          document: remoteAsset,
          isEditable: this.isEditable,
          isSendable: this.isSendable,
          isOwner: this.isOwner,
        });
      }
      result.push(vm);
    }

    return result;
  }
}
