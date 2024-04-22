import { format } from "../../../business/util/string-utility.mjs";
import { isDefined, validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * Represents a block of fire-and-forget sorting controls.
 * 
 * @extends ViewModel
 * 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 */
export default class SortControlsViewModel extends ViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_SORT_CONTROLS; }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * 
   * @param {Array<SortingOption> | undefined} args.definitions A list of sortable property definitions.  
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when a sort button is clicked. 
   * Does **not** perform any sorting! That task is delegated to the user of this class! 
   * Arguments: 
   * * `event: Event`
   * * `definition: SortingOption`
   * * `ascending: Boolean` - If true, the user clicked the button to sort in ascending fashion. 
   */
  constructor(args = {}) {
    super(args);

    this.onClick = args.onClick ?? (async () => { });
    this.definitions = args.definitions ?? [];

    this.definitionViewModels = this.definitions.map(definition => {
      return {
        definition: definition,
        vmSortAscending: new ButtonViewModel({
          id: `${definition.id}-ascending`,
          parent: this,
          localizedToolTip: definition.localizedToolTipSortAscending,
          iconHtml: '<i class="ico interactible dark ico-ascending-solid"></i>',
          onClick: async (event) => {
            this.onClick(event, definition, true);
          },
        }),
        vmSortDescending: new ButtonViewModel({
          id: `${definition.id}-descending`,
          parent: this,
          localizedToolTip: definition.localizedToolTipSortDescending,
          iconHtml: '<i class="ico interactible dark ico-descending-solid"></i>',
          onClick: async (event) => {
            this.onClick(event, definition, false);
          },
        }),
      };
    });
  }
}

/**
 * Represents a sortable property of a document. 
 * 
 * @property {String} id An ID by which to identify this definition. 
 * @property {String | undefined} iconHtml An HTML literal to display as icon before the label. 
 * @property {String | undefined} localizedLabel A localized label. 
 * @property {String | undefined} localizedToolTip A localized tooltip for the icon. 
 * @property {String | undefined} localizedToolTipSortAscending A localized tooltip for the button to sort ascending. 
 * * Acts as an override. If undefined, uses the `localizedToolTip` in a composite string. 
 * @property {String | undefined} localizedToolTipSortDescending A localized tooltip for the button to sort descending. 
 * * Acts as an override. If undefined, uses the `localizedToolTip` in a composite string. 
 */
export class SortingOption {
  /**
   * @param {Object} args 
   * @param {String} args.id An ID by which to identify this definition. 
   * @param {String | undefined} args.iconHtml An HTML literal to display as icon before the label. 
   * @param {String | undefined} args.localizedLabel A localized label. 
   * @param {String | undefined} args.localizedToolTip A localized tooltip for the icon. 
   * @param {String | undefined} args.localizedToolTipSortAscending A localized tooltip for the button to sort ascending. 
   * * Acts as an override. If undefined, uses the `localizedToolTip` in a composite string. 
   * @param {String | undefined} args.localizedToolTipSortDescending A localized tooltip for the button to sort descending. 
   * * Acts as an override. If undefined, uses the `localizedToolTip` in a composite string. 
   */
  constructor(args = {}) {
    validateOrThrow(args, ["id"]);

    this.id = args.id;
    this.iconHtml = args.iconHtml;
    this.localizedLabel = args.localizedLabel;
    this.localizedToolTip = args.localizedToolTip;

    if (isDefined(args.localizedToolTipSortAscending)) {
      this.localizedToolTipSortAscending = args.localizedToolTipSortAscending;
    } else if (isDefined(args.localizedToolTip)) {
      this.localizedToolTipSortAscending = format(game.i18n.localize("system.general.sort.sortAscendingBy"), args.localizedToolTip);
    }

    if (isDefined(args.localizedToolTipSortDescending)) {
      this.localizedToolTipSortDescending = args.localizedToolTipSortDescending;
    } else if (isDefined(args.localizedToolTip)) {
      this.localizedToolTipSortDescending = format(game.i18n.localize("system.general.sort.sortDescendingBy"), args.localizedToolTip);
    }
  }
}
