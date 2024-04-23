import { format } from "../../../business/util/string-utility.mjs";
import { isDefined, validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { KEY_CODES } from "../../keyboard/key-codes.mjs";
import { KEYBOARD } from "../../keyboard/keyboard.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * Represents a block of fire-and-forget sorting controls.
 * 
 * @extends ViewModel
 * 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {Array<SortingOption>} options A list of sorting options. 
 * @property {Boolean} compact If `true`, will render in compact form, with only one button and omitting 
 * the label, if one is defined. The user will have to hold 'alt' for descending sort. 
 * @property {Function} onSort Callback that is invoked when a sort button is clicked. 
 * * `event: Event`
 * * `provideSortable: Function` - Must be invoked by the user and receive a single argument: 
 * * * `sortable: Array<Any> | Object` - The list to sort **in-place**! If type is `Object`, then the object **must** provide a `sort`-method! 
 */
export default class SortControlsViewModel extends ViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_SORT_CONTROLS; }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * 
   * @param {Array<SortingOption> | undefined} args.options A list of sorting options. 
   * @param {Boolean | undefined} args.compact If `true`, will render in compact form, with only one button and omitting 
   * the label, if one is defined. The user will have to hold 'alt' for descending sort. 
   * * default `false`
   * @param {Function | undefined} args.onSort Callback that is invoked when a sort button is clicked. 
   * * `event: Event`
   * * `provideSortable: Function` - Must be invoked by the user and receive a single argument: 
   * * * `sortable: Array<Any> | Object` - The list to sort **in-place**! If type is `Object`, then the object **must** provide a `sort`-method! 
   * 
   * @example
   * ```JS
   * this.vmSortInnate = new SortControlsViewModel({
   *   id: "vmSortInnate",
   *   parent: this,
   *   options: [
   *     new SortingOption({
   *       iconHtml: '<i class="ico ico-tags-solid dark pad-r-sm"></i>',
   *       localizedToolTip: game.i18n.localize("system.general.name.label"),
   *       sortingFunc: (a, b) => {
   *         return a.document.name.localeCompare(b.document.name);
   *       },
   *     }),
   *   ],
   *   onSort: (_, provideSortable) => {
   *     provideSortable(this.vmInnateSkillList);
   *   },
   *  });
   * ```
   */
  constructor(args = {}) {
    super(args);

    this.onSort = args.onSort ?? (() => {});
    this.options = args.options ?? [];
    this.compact = args.compact ?? false;

    this.optionViewModels = this.options.map(option => {
      const index = this.options.indexOf(option);

      let localizedToolTipSortAscending = option.localizedToolTipSortAscending;
      let localizedToolTipSortDescending = option.localizedToolTipSortDescending;
      if (this.compact === true) {
        const localizedHintReverseKey = game.i18n.localize("system.general.sort.hintReverseKey");

        if (isDefined(localizedToolTipSortAscending)) {
          localizedToolTipSortAscending = `${localizedToolTipSortAscending}. ${localizedHintReverseKey}`;
        } else {
          localizedToolTipSortAscending = localizedHintReverseKey;
        }

        if (isDefined(localizedToolTipSortDescending)) {
          localizedToolTipSortDescending = `${localizedToolTipSortDescending}. ${localizedHintReverseKey}`;
        } else {
          localizedToolTipSortDescending = localizedHintReverseKey;
        }
      }

      return {
        option: option,
        vmSortAscending: new ButtonViewModel({
          id: `${index}-ascending`,
          parent: this,
          localizedToolTip: localizedToolTipSortAscending,
          iconHtml: '<i class="ico interactible dark ico-ascending-solid"></i>',
          onClick: (event) => {
            this.onSort(event, (sortable) => {
              sortable.sort(option.sortingFunc);
            });
          },
        }),
        vmSortDescending: new ButtonViewModel({
          id: `${index}-descending`,
          parent: this,
          localizedToolTip: localizedToolTipSortDescending,
          iconHtml: '<i class="ico interactible dark ico-descending-solid"></i>',
          onClick: (event) => {
            this.onSort(event, (sortable) => {
              const reverseSort = this._getReverseSortFunc(option.sortingFunc);
              sortable.sort(reverseSort);
            });
          },
        }),
      };
    });
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    if (this.compact !== true) return;

    const data = {
      buttonsSortAscending: this.element.find(".sort-ascending"),
      buttonsSortDescending: this.element.find(".sort-descending"),
    }

    KEYBOARD.onKeyDown(KEY_CODES.ALT, this._handleGlobalKeyDown, data);
    KEYBOARD.onKeyUp(KEY_CODES.ALT, this._handleGlobalKeyUp, data);
  }

  /** @override */
  dispose() {
    KEYBOARD.offKeyDown(KEY_CODES.ALT, this._handleGlobalKeyDown);
    KEYBOARD.offKeyUp(KEY_CODES.ALT, this._handleGlobalKeyUp);

    super.dispose();
  }

  /**
   * Handles the global "keydown" event. 
   * 
   * @param {Object} data event data object. 
   * * Contains the lists of button elements in the `data` property. 
   * 
   * @private
   */
  _handleGlobalKeyDown(data) {
    data.buttonsSortAscending.addClass("hidden");
    data.buttonsSortDescending.removeClass("hidden");
  }

  /**
   * Handles the global "keyup" event. 
   * 
   * @param {Object} data event data object. 
   * * Contains the lists of button elements in the `data` property. 
   * 
   * @private
   */
  _handleGlobalKeyUp(data) {
    data.buttonsSortAscending.removeClass("hidden");
    data.buttonsSortDescending.addClass("hidden");
  }

  /**
   * Wraps the given function in a new function which reverses the result, useful for 'descending' sorting. 
   * 
   * @param {Function<Number>} sortingFunc A function with which to do comparisons. Must return a numeric result, 
   * the same way `Array.sort` does. Allowed numbers are `-1`, `0` and `1`. 
   * 
   * @returns {Function<Number>} 
   */
  _getReverseSortFunc(sortingFunc) {
    return (a, b) => {
      return sortingFunc(b, a);
    }  
  }
}

/**
 * Represents a sortable property of a document. 
 * 
 * @property {Function<Number>} sortingFunc A function with which to do comparisons. Must return a numeric result, 
 * the same way `Array.sort` does. Allowed numbers are `-1`, `0` and `1`. 
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
   * @param {Function<Number>} args.sortingFunc A function with which to do comparisons. Must return a numeric result, 
   * the same way `Array.sort` does. Allowed numbers are `-1`, `0` and `1`. 
   * @param {String | undefined} args.iconHtml An HTML literal to display as icon before the label. 
   * @param {String | undefined} args.localizedLabel A localized label. 
   * @param {String | undefined} args.localizedToolTip A localized tooltip for the icon. 
   * @param {String | undefined} args.localizedToolTipSortAscending A localized tooltip for the button to sort ascending. 
   * * Acts as an override. If undefined, uses the `localizedToolTip` in a composite string. 
   * @param {String | undefined} args.localizedToolTipSortDescending A localized tooltip for the button to sort descending. 
   * * Acts as an override. If undefined, uses the `localizedToolTip` in a composite string. 
   */
  constructor(args = {}) {
    validateOrThrow(args, ["sortingFunc"]);

    this.sortingFunc = args.sortingFunc;
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
