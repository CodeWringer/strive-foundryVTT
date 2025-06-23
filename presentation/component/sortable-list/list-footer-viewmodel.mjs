import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonAddViewModel from "../button-add/button-add-viewmodel.mjs";
import ButtonToggleVisibilityViewModel from "../button-toggle-visibility/button-toggle-visibility-viewmodel.mjs";

/**
 * Represents the footer of a list, whose contents can be edited. 
 * 
 * @extends ViewModel
 * 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 */
export default class ListFooterViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPONENT_LIST_FOOTER; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('listFooter', `{{> "${ListFooterViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {ViewModel | undefined} args.parent 
   * 
   * @param {Boolean | undefined} args.isEditable 
   * * default `false`
   * 
   * @param {String} args.visGroupId ID which enables the expandability of content. 
   * @param {Boolean | undefined} args.isCollapsible 
   * * default `false`
   * @param {Boolean | undefined} args.isExpanded 
   * * default `false`
   * @param {SortableListAddItemParams | undefined} args.addItemParams If defined, 
   * buttons to add items will be shown, using these settings. 
   * @param {Function | undefined} args.onExpansionToggled
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["visGroupId"]);

    this.visGroupId = args.visGroupId;
    this.isEditable = args.isEditable ?? false;
    this.isCollapsible = args.isCollapsible ?? false;
    this.isExpanded = args.isExpanded ?? false;
    this.onExpansionToggled = args.onExpansionToggled ?? (() => {});

    this.vmToggleExpansion = new ButtonToggleVisibilityViewModel({
      parent: this,
      id: "vmToggleExpansion",
      isEditable: true, // Should always be interactible. 
      value: this.isExpanded,
      iconInactive: '<i class="fas fa-angle-double-down"></i>',
      iconActive: '<i class="fas fa-angle-double-up"></i>',
      visGroup: this.visGroupId,
      onClick: (event, data) => {
        this.onExpansionToggled(event, data);
      },
    });
    this.vmAddItem = new ButtonAddViewModel({
      id: "vmAddItem",
      parent: this,
      creationStrategy: args.addItemParams.creationStrategy,
      localizedLabel: args.addItemParams.localizedLabel,
      onClick: (event, data) => {
        if (ValidationUtil.isDefined(args.addItemParams.onItemAdded)) {
          args.addItemParams.onItemAdded(event, data);
        }
      },
    });
  }
}
