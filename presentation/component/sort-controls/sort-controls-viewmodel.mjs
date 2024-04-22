import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * Represents a block of controls for sorting (lists).
 * 
 * @extends ViewModel
 * 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 */
export default class SortControlsViewModel extends ViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_SORT_CONTROLS; }

  /**
   * @type {Object}
   * @private
   */
  _sortStates = {};

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * 
   * @param {Array<SortingDefinition> | undefined} args.definitions A list of sortable property definitions.  
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when a sort button is clicked. Switches the current 
   * state to the next state, before invoking, but does **not** perform any sorting! That task is delegated to the user of this class! 
   * Arguments: 
   * * `event: Event`
   * * `definition: SortingDefinition`
   */
  constructor(args = {}) {
    super(args);

    // View state.
    this.registerViewStateProperty("_sortStates");
    this.readViewState();

    this.onClick = args.onClick ?? (async () => { });
    this.definitions = args.definitions ?? [];

    // Replace given definition states with those (if any) retrieved from view state. 
    this.definitions.forEach(definition => {
      definition.state = this._sortStates[definition.id] ?? SORTING_STATE.INDETERMINATE;
    });

    this.presentableViewModels = this.definitions.map(definition => {
      return {
        definition: definition,
        viewModel: new ButtonViewModel({
          id: definition.id,
          parent: this,
          localizedToolTip: definition.localizedToolTip,
          localizedLabel: definition.localizedLabel,
          iconHtml: definition.iconHtml,
          onClick: async (event) => {
            // Switch the current state. 
            if (definition.state === SORTING_STATE.ASCENDING) {
              definition.state = SORTING_STATE.DESCENDING;
            } else {
              definition.state = SORTING_STATE.ASCENDING;
            }

            // Reset other definitions. 
            this.definitions.forEach(otherDefinition => {
              if (otherDefinition.id !== definition.id) {
                otherDefinition.state = SORTING_STATE.INDETERMINATE;
                this._sortStates[otherDefinition.id] = otherDefinition.state;
              }
            });

            // View state update. 
            this._sortStates[definition.id] = definition.state;
            this.writeViewState();

            // Re-render symbols. 
            this._renderSymbols();

            // Invoke callback. 
            this.onClick(event, definition);
          },
        }),
        symbol: definition.getSymbol(),
      };
    });
  }

  /**
   * Re-renders the symbols of all definitions, based on their current state. 
   * 
   * @private
   */
  _renderSymbols() {
    this.presentableViewModels.forEach(vm => {
      const symbolElement = this.element.find(`#${vm.viewModel.id}-symbol`);
      $(symbolElement).html(vm.definition.getSymbol());
    });
  }
}

/**
 * Represents a sortable property of a document. 
 * 
 * @property {String} id An ID by which to identify this definition. 
 * @property {SORTING_STATE} state The current state of the sorting definition. 
 * @property {String} iconHtml An HTML literal to display as icon before the label. 
 * @property {String} localizedLabel A localized label. 
 * @property {String} localizedToolTip A localized tooltip. 
 */
export class SortingDefinition {
  /**
   * @param {Object} args 
   * @param {String} args.id An ID by which to identify this definition. 
   * @param {SORTING_STATE | undefined} args.state The current state of the sorting definition. 
   * * default `SORTING_STATE.INDETERMINATE`
   * @param {String | undefined} args.iconHtml An HTML literal to display as icon before the label. 
   * * default `""`
   * @param {String | undefined} args.localizedLabel A localized label. 
   * * default `""`
   * @param {String | undefined} args.localizedToolTip A localized tooltip. 
   * * default `""`
   */
  constructor(args = {}) {
    validateOrThrow(args, ["id"]);

    this.id = args.id;
    this.state = args.state ?? SORTING_STATE.INDETERMINATE;
    this.iconHtml = args.iconHtml ?? "";
    this.localizedLabel = args.localizedLabel ?? "";
    this.localizedToolTip = args.localizedToolTip ?? "";
  }

  /**
   * Returns current state represented by a symbol as an HTML literal. 
   * 
   * @returns {String}
   */
  getSymbol() {
    if (this.state === SORTING_STATE.ASCENDING) {
      return '<i class="fas fa-caret-up"></i>';
    } else if (this.state === SORTING_STATE.DESCENDING) {
      return '<i class="fas fa-caret-down"></i>';
    } else {
      return "-";
    }
  }
}

/**
 * Represents the state a sorting definition can be in. 
 * 
 * @property {Number} INDETERMINATE The property has not yet been used in sorting. 
 * @property {Number} ASCENDING The property is used to sort in an ascending fashion. 
 * @property {Number} DESCENDING The property is used to sort in a descending fashion. 
 * 
 * @constant
 */
export const SORTING_STATE = {
  INDETERMINATE: 0,
  ASCENDING: 1,
  DESCENDING: 2,
}
