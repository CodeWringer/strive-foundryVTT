import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonAddViewModel from "../button-add/button-add-viewmodel.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * Represents the footer of a list, whose contents can be edited. 
 * 
 * @extends ViewModel
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
   * @param {Boolean | undefined} args.isCollapsible 
   * * default `false`
   * @param {Array<SortableListAddItemParams> | undefined} args.addItemParams If defined, 
   * buttons to add items will be shown, using these settings. 
   * @param {String | undefined} args.localizedCollapseToolTip A localized tool tip 
   * to add to the "collapse" button. 
   * @param {Function | undefined} args.onExpansionToggled
   */
  constructor(args = {}) {
    super(args);

    this.isCollapsible = args.isCollapsible ?? false;
    this.onExpansionToggled = args.onExpansionToggled ?? (() => {});
    this._addItemParams = args.addItemParams ?? [];
    this.localizedCollapseToolTip = args.localizedCollapseToolTip;

    this.vmToggleExpansion = new ButtonViewModel({
      id: "vmToggleExpansion",
      parent: this,
      isEditable: true, // Should always be interactible. 
      localizedToolTip: this.localizedCollapseToolTip,
      iconHtml: '<i class="ico dark interactible ico-double-chevron-u-solid" style="height: 1.2rem;"></i>',
      onClick: (event, data) => {
        this.onExpansionToggled(event, data);
      },
    });

    let i = 0;
    this.addItemButtonViewModels = this._addItemParams.map(it => 
      new ButtonAddViewModel({
        id: `vmAddItem${i++}`,
        parent: this,
        creationStrategy: it.creationStrategy,
        localizedLabel: it.localizedLabel,
        onClick: (event, data) => {
          if (ValidationUtil.isDefined(data) && ValidationUtil.isDefined(it.onItemAdded)) {
            it.onItemAdded(event, data);
          }
        },
      })
    );
  }
}
