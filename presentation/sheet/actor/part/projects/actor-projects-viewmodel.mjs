import SpecificDocumentCreationStrategy from "../../../../../business/model/document/creation/specific-document-creation-strategy.mjs"
import { ITEM_TYPES } from "../../../../../business/model/document/item/item-types.mjs"
import { ExtenderUtil } from "../../../../../common/extender-util.mjs"
import { StringUtil } from "../../../../../common/util/string-utility.mjs"
import { ValidationUtil } from "../../../../../common/util/validation-utility.mjs"
import CompositeSortableListViewModel from "../../../../component/composite-sortable-list/composite-sortable-list-viewmodel.mjs"
import DocumentListItemOrderDataSource from "../../../../component/sortable-list/document-list-item-order-datasource.mjs"
import ViewModel from "../../../../view-model/view-model.mjs"
import ProjectListItemViewModel from "../../../item/project/project-list-item-viewmodel.mjs"

export default class ActorProjectsViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_PROJECTS; }

  /** @override */
  get entityId() { return this.document.id; }

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
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.document = args.document;

    this.listItemViewModels = this._getViewModels(
      this.document.projects,
      this.listItemViewModels ?? [],
      (args) => new ProjectListItemViewModel(args),
    )
    this.vmProjects = new CompositeSortableListViewModel({
      id: "vmProjects",
      parent: this,
      listItemTemplate: ProjectListItemViewModel.TEMPLATE,
      listItemViewModels: this.listItemViewModels,
      isCollapsible: false,
      enableFooter: true,
      isSearchable: false,
      indexDataSource: new DocumentListItemOrderDataSource({
        document: this.document,
        listName: "projects",
      }),
      addItemParams: [
        new SortableListAddItemParams({
          creationStrategy: new SpecificDocumentCreationStrategy({
            documentType: ITEM_TYPES.PROJECT,
            target: this.document,
          }),
          localizedLabel: StringUtil.format(
            game.i18n.localize("system.general.add.addType"),
            game.i18n.localize("system.project.project"),
          ),
          localizedToolTip: StringUtil.format(
            game.i18n.localize("system.general.add.addType"),
            game.i18n.localize("system.project.project"),
          ),
        }),
      ],
    });
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(ActorProjectsViewModel));
  }

}
