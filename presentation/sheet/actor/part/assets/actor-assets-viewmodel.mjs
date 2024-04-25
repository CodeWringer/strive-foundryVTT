import TransientBaseCharacterActor from "../../../../../business/document/actor/transient-base-character-actor.mjs"
import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs"
import ButtonAddViewModel from "../../../../component/button-add/button-add-viewmodel.mjs"
import SortControlsViewModel, { SortingOption } from "../../../../component/sort-controls/sort-controls-viewmodel.mjs"
import DocumentListItemOrderDataSource from "../../../../component/sortable-list/document-list-item-order-datasource.mjs"
import SortableListViewModel from "../../../../component/sortable-list/sortable-list-viewmodel.mjs"
import { TEMPLATES } from "../../../../templatePreloader.mjs"
import ViewModel from "../../../../view-model/view-model.mjs"
import AssetListItemViewModel from "../../../item/asset/asset-list-item-viewmodel.mjs"
import ActorAssetsEquippedViewModel from "./actor-assets-equipped-viewmodel.mjs"

/**
 * @property {TransientBaseCharacterActor} document
 * * Read-only
 * @property {Array<AssetListItemViewModel>} listItemViewModels 
 * @property {Number} maxBulk 
 * @property {Number} currentBulk 
 * @property {Boolean} hasExceededBulk Returns `true`, if the luggage's maximum allowed bulk has been exceeded. 
 * * Read-only. 
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
   * @type {Boolean}
   * @readonly
   */
  get hasExceededBulk() {
    if (this.currentBulk > this.maxBulk) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * @type {String}
   * @readonly
   */
  get sortControlsTemplate() { return SortControlsViewModel.TEMPLATE; }

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
        listName: "luggage",
      }),
      listItemViewModels: this.luggageViewModels,
      listItemTemplate: AssetListItemViewModel.TEMPLATE,
      vmBtnAddItem: new ButtonAddViewModel({
        id: "vmBtnAddItem",
        parent: this,
        target: thiz.document,
        isEditable: thiz.isEditable,
        creationType: TransientAsset.TYPE,
        withDialog: true,
        localizedLabel: game.i18n.localize("system.character.asset.add.label"),
        localizedType: game.i18n.localize("system.character.asset.singular"),
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
      listItemTemplate: AssetListItemViewModel.TEMPLATE,
      vmBtnAddItem: new ButtonAddViewModel({
        id: "vmBtnAddItem",
        parent: this,
        target: thiz.document,
        isEditable: thiz.isEditable,
        creationType: TransientAsset.TYPE,
        withDialog: true,
        localizedLabel: game.i18n.localize("system.character.asset.add.label"),
        localizedType: game.i18n.localize("system.character.asset.singular"),
      }),
    });

    this.vmSortLuggage = new SortControlsViewModel({
      id: "vmSortLuggage",
      parent: this,
      options: this._getAssetSortingOptions(),
      compact: true,
      onSort: (_, provideSortable) => {
        provideSortable(this.vmLuggageList);
      },
    });

    this.vmSortProperty = new SortControlsViewModel({
      id: "vmSortProperty",
      parent: this,
      options: this._getAssetSortingOptions(),
      compact: true,
      onSort: (_, provideSortable) => {
        provideSortable(this.vmPropertyList);
      },
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

  /**
   * @returns {Array<SortingOption>}
   * 
   * @private
   */
  _getAssetSortingOptions() {
    return [
      new SortingOption({
        iconHtml: '<i class="ico ico-tags-solid dark"></i>',
        localizedToolTip: game.i18n.localize("system.general.name.label"),
        sortingFunc: (a, b) => {
          return a.document.name.localeCompare(b.document.name);
        },
      }),
      new SortingOption({
        iconHtml: '<i class="ico ico-bulk-solid dark"></i>',
        localizedToolTip: game.i18n.localize("system.character.asset.bulk"),
        sortingFunc: (a, b) => {
          return a.document.compareBulk(b.document);
        },
      }),
    ];
  }
}
