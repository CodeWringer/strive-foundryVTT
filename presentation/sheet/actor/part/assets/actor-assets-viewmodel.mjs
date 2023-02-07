import TransientBaseCharacterActor from "../../../../../business/document/actor/transient-base-character-actor.mjs"
import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs"
import DocumentListItemOrderDataSource from "../../../../component/sortable-list/document-list-item-order-datasource.mjs"
import SortableListViewModel from "../../../../component/sortable-list/sortable-list-viewmodel.mjs"
import { TEMPLATES } from "../../../../templatePreloader.mjs"
import ViewModelFactory from "../../../../view-model/view-model-factory.mjs"
import ViewModel from "../../../../view-model/view-model.mjs"
import AssetListItemViewModel from "../../../item/asset/asset-list-item-viewmodel.mjs"
import ActorAssetsEquippedViewModel from "./actor-assets-equipped-viewmodel.mjs"

/**
 * @property {TransientBaseCharacterActor} document
 * * Read-only
 * @property {Array<AssetListItemViewModel>} listItemViewModels 
 * @property {Number} maxBulk 
 * @property {Number} currentBulk 
 * 
 * @property {ViewModel} vmPropertyList 
 */
export default class ActorAssetsViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_ASSETS; }

  /** @override */
  get entityId() { return this.document.id; }

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
   * @type {String}
   * @readonly
   */
  get templateEquipped() { return TEMPLATES.ACTOR_ASSETS_EQUIPPED; }

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

    this.vmEquipped = new ActorAssetsEquippedViewModel({
      id: "vmEquipped",
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      document: this.document,
    });

    this.luggageViewModels = [];
    this.luggageViewModels = this._getAssetViewModels(this.document.assets.luggage, this.luggageViewModels);
    this.vmLuggageList = new SortableListViewModel({
      id: "vmLuggageList",
      parent: this,
      isEditable: this.isEditable,
      indexDataSource: new DocumentListItemOrderDataSource({
        document: thiz.document,
        listName: "property",
      }),
      listItemViewModels: this.luggageViewModels,
      listItemTemplate: TEMPLATES.ASSET_LIST_ITEM,
      vmBtnAddItem: factory.createVmBtnAdd({
        id: "vmBtnAddItem",
        target: thiz.document,
        isEditable: thiz.isEditable,
        creationType: "item",
        withDialog: true,
        localizableLabel: "ambersteel.character.asset.add.label",
        localizableType: "ambersteel.character.asset.singular",
        localizableDialogTitle: "ambersteel.character.asset.add.query",
      }),
    });

    this.propertyViewModels = [];
    this.propertyViewModels = this._getAssetViewModels(this.document.assets.property, this.propertyViewModels);
    this.vmPropertyList = new SortableListViewModel({
      id: "vmPropertyList",
      parent: this,
      isEditable: this.isEditable,
      indexDataSource: new DocumentListItemOrderDataSource({
        document: thiz.document,
        listName: "property",
      }),
      listItemViewModels: this.propertyViewModels,
      listItemTemplate: TEMPLATES.ASSET_LIST_ITEM,
      vmBtnAddItem: factory.createVmBtnAdd({
        id: "vmBtnAddItem",
        target: thiz.document,
        isEditable: thiz.isEditable,
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
   * 
   * @override
   */
  update(args = {}) {
    this.luggageViewModels = this._getAssetViewModels(this.document.assets.luggage, this.luggageViewModels);
    this.propertyViewModels = this._getAssetViewModels(this.document.assets.property, this.propertyViewModels);

    super.update(args);
  }

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmLuggageList, {
      ...updates.get(this.vmLuggageList),
      listItemViewModels: this.luggageViewModels,
    });
    updates.set(this.vmPropertyList, {
      ...updates.get(this.vmPropertyList),
      listItemViewModels: this.propertyViewModels,
    });

    return updates;
  }
  
  /**
   * Returns an array of view models for the given array of `TransientAsset`s. 
   * 
   * @param {Array<TransientAsset>} assets
   * @param {Array<TransientAsset>} cacheList
   * 
   * @returns {Array<AssetListItemViewModel>}
   * 
   * @private
   */
  _getAssetViewModels(assets, cacheList) {
    const result = [];
    
    for (const document of assets) {
      let vm = cacheList.find(it => it._id === document.id);
      if (vm === undefined) {
        vm = new AssetListItemViewModel({
          id: document.id,
          document: document,
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
