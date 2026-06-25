import CompositeSortableListViewModel from "../../../../component/composite-sortable-list/composite-sortable-list-viewmodel.mjs";
import { SortingOption } from "../../../../component/sort-controls/sort-controls-viewmodel.mjs";
import DocumentListItemOrderDataSource from "../../../../component/sortable-list/document-list-item-order-datasource.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";
import BaseListItemViewModel from "../../../item/base/base-list-item-viewmodel.mjs";

export default class ActorTraitsViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_TRAITS; }

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

    this.traitViewModels = this._getViewModels(
      this.document.traits,
      this.traitViewModels,
      (args) => { return new BaseListItemViewModel(args); }
    );
    this.vmTraits = new CompositeSortableListViewModel({
      id: "vmTraits",
      parent: this,
      listItemTemplate: BaseListItemViewModel.TEMPLATE,
      listItemViewModels: this.traitViewModels,
      indexDataSource: new DocumentListItemOrderDataSource({
        document: this.document,
        listName: "traits",
      }),
      localizedTitle: game.i18n.localize("system.character.trait.traits"),
      sortingOptions: this._getTraitSortingOptions(),
      isCollapsible: false,
      enableFooter: false,
      isSearchable: false,
    });
  }

  /**
   * Returns the sorting options for known and innate skill lists. 
   * 
   * @returns {Array<SortingOption>}
   * 
   * @private
   */
  _getTraitSortingOptions() {
    return [
      new SortingOption({
        iconHtml: '<i class="ico ico-tags-solid custom-icon-sm"></i>',
        localizedToolTip: game.i18n.localize("system.general.name.label"),
        sortingFunc: (a, b) => {
          return a.document.name.localeCompare(b.document.name);
        },
      }),
    ];
  }

}
