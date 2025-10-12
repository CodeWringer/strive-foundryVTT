import { ITEM_TYPES } from "../../../../../../business/document/item/item-types.mjs";
import { StringUtil } from "../../../../../../business/util/string-utility.mjs";
import { ValidationUtil } from "../../../../../../business/util/validation-utility.mjs";
import SpecificDocumentCreationStrategy from "../../../../../../business/document/creation/specific-document-creation-strategy.mjs";
import CompositeSortableListViewModel, { SortableListAddItemParams } from "../../../../../component/composite-sortable-list/composite-sortable-list-viewmodel.mjs";
import { SortingOption } from "../../../../../component/sort-controls/sort-controls-viewmodel.mjs";
import DocumentListItemOrderDataSource from "../../../../../component/sortable-list/document-list-item-order-datasource.mjs";
import ViewModel from "../../../../../view-model/view-model.mjs";
import MomentumActionListItemViewModel from "../../../../item/momentum-action/momentum-action-list-item-viewmodel.mjs";

export default class ActorMomentumViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_MOMENTUM; }

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
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.listItemViewModels = this._getListItemViewModels();

    this.vmMomentumActions = new CompositeSortableListViewModel({
      id: "vmMomentumActions",
      parent: this,
      listItemTemplate: MomentumActionListItemViewModel.TEMPLATE,
      listItemViewModels: this.listItemViewModels,
      indexDataSource: new DocumentListItemOrderDataSource({
        document: this.document,
        listName: "momentum-actions",
      }),
      localizedTitle: game.i18n.localize("system.combat.momentum.plural"),
      addItemParams: [
        new SortableListAddItemParams({
          creationStrategy: new SpecificDocumentCreationStrategy({
            documentType: ITEM_TYPES.MOMENTUM_ACTION,
            target: this.document,
          }),
          localizedLabel: StringUtil.format(
            game.i18n.localize("system.general.add.addType"),
            game.i18n.localize("system.combat.momentum.action"),
          ),
          localizedToolTip: StringUtil.format(
            game.i18n.localize("system.general.add.addType"),
            game.i18n.localize("system.combat.momentum.action"),
          ),
        }),
      ],
      sortingOptions: [
        new SortingOption({
          iconHtml: '<i class="ico ico-tags-solid"></i>',
          localizedToolTip: game.i18n.localize("system.general.name.label"),
          sortingFunc: (a, b) => {
            return a.document.name.localeCompare(b.document.name);
          },
        }),
      ],
      isCollapsible: false,
      enableFooter: true,
      isSearchable: false,
    });
  }

  /**
   * @returns {Array<MomentumActionListItemViewModel>}
   * @private
   */
  _getListItemViewModels() {
    return this._getViewModels(
      this.document.momentum.actions,
      this.listItemViewModels,
      (args) => { return new MomentumActionListItemViewModel(args); }
    );
  }

}
