import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import ObservableField from "../../../common/observables/observable-field.mjs";
import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputSliderViewModel from "../../component/input-slider/input-slider-viewmodel.mjs";
import { setElementValue } from "../../sheet/sheet-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";

export default class DicePoolDesignerDialogViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.DIALOG_DICE_POOL_DESIGNER; }

  /**
   * Observable ui state. 
   * 
   * @example
   * To update, copy the entire value object and adjust its fields: 
   * ```JS
   * this._uiState.value = {
   *   ...this._uiState.value,
   *   successThreshold: newValue,
   * };
   * ```
   * 
   * @property {Object} value 
   * @property {Number} value.dieFaces The number of faces on a die. 
   * * default `6`
   * @property {Number} value.successThreshold Sets the lower bound of faces that are considered 
   * successes. Any face turning up this number and numbers above, are considered successes. 
   * * default `5`
   * @property {Number} value.obLimit 
   * @property {Number} value.diceLimit 
   * @property {Number} value.sampleSize 
   * @property {Number} value.modifier Number of automatic hits/misses. 
   * 
   * @type {Object}
   * @private
   */
  _uiState = new ObservableField({ value: {
      dieFaces: 6,
      successThreshold: 5,
      obLimit: 10,
      diceLimit: 20,
      sampleSize: 1000,
      modifier: 0,
    }
  });

  /**
   * @type {JQuery}
   * @private
   */
  _diceProbabilityTableElement = undefined;
  
  /**
   * @param {Object} args 
   * @param {Application} args.ui The dialog that owns this view model. 
   */
  constructor(args = {}) {
    super(args);

    validateOrThrow(args, ["ui"]);

    this.ui = args.ui;
    this.isEditable = true;

    this.registerViewStateProperty("_uiState");

    this.vmSuccessThresholdSlider = new InputSliderViewModel({
        id: "vmSuccessThresholdSlider",
        parent: this,
        min: 1,
        max: this._uiState.value.dieFaces,
        value: this._uiState.value.successThreshold,
        onChange: (_, newValue) => {
            this._uiState.value = {
                ...this._uiState.value,
                successThreshold: newValue,
            };
        },
    });
    this.vmSuccessThreshold = new InputNumberSpinnerViewModel({
        id: "vmSuccessThreshold",
        parent: this,
        min: 1,
        max: this._uiState.value.dieFaces,
        value: this._uiState.value.successThreshold,
        onChange: (_, newValue) => {
            this._uiState.value = {
                ...this._uiState.value,
                successThreshold: newValue,
            };
        },
    });

    this.vmDiceLimitSlider = new InputSliderViewModel({
        id: "vmDiceLimitSlider",
        parent: this,
        min: 1,
        max: 30,
        value: this._uiState.value.diceLimit,
        onChange: (_, newValue) => {
            this._uiState.value = {
                ...this._uiState.value,
                diceLimit: newValue,
            };
        },
    });
    this.vmDiceLimit = new InputNumberSpinnerViewModel({
        id: "vmDiceLimit",
        parent: this,
        value: this._uiState.value.diceLimit,
        min: 1,
        max: 30,
        onChange: (_, newValue) => {
            this._uiState.value = {
                ...this._uiState.value,
                diceLimit: newValue,
            };
        },
    });

    this.vmObLimitSlider = new InputSliderViewModel({
        id: "vmObLimitSlider",
        parent: this,
        min: 1,
        max: 30,
        value: this._uiState.value.obLimit,
        onChange: (_, newValue) => {
            this._uiState.value = {
                ...this._uiState.value,
                obLimit: newValue,
            };
        },
    });
    this.vmObLimit = new InputNumberSpinnerViewModel({
        id: "vmObLimit",
        parent: this,
        value: this._uiState.value.obLimit,
        min: 1,
        max: 30,
        onChange: (_, newValue) => {
            this._uiState.value = {
                ...this._uiState.value,
                obLimit: newValue,
            };
        },
    });

    this.vmFacesSlider = new InputSliderViewModel({
        id: "vmFacesSlider",
        parent: this,
        min: 2,
        max: 20,
        value: this._uiState.value.dieFaces,
        onChange: (_, newValue) => {
            this._uiState.value = {
                ...this._uiState.value,
                dieFaces: newValue,
            };
        },
    });
    this.vmFaces = new InputNumberSpinnerViewModel({
        id: "vmFaces",
        parent: this,
        value: this._uiState.value.dieFaces,
        min: 2,
        max: 20,
        onChange: (_, newValue) => {
            this._uiState.value = {
                ...this._uiState.value,
                dieFaces: newValue,
            };
        },
    });

    this.vmModifierSlider = new InputSliderViewModel({
        id: "vmModifierSlider",
        parent: this,
        min: -20,
        max: 20,
        value: this._uiState.value.modifier,
        onChange: (_, newValue) => {
            this._uiState.value = {
                ...this._uiState.value,
                modifier: newValue,
            };
        },
    });
    this.vmModifier = new InputNumberSpinnerViewModel({
        id: "vmModifier",
        parent: this,
        value: this._uiState.value.modifier,
        min: -20,
        max: 20,
        onChange: (_, newValue) => {
            this._uiState.value = {
                ...this._uiState.value,
                modifier: newValue,
            };
        },
    });

    this.vmSampleSizeSlider = new InputSliderViewModel({
        id: "vmSampleSizeSlider",
        parent: this,
        min: 1,
        max: 10000,
        step: 100,
        value: this._uiState.value.sampleSize,
        onChange: (_, newValue) => {
            this._uiState.value = {
                ...this._uiState.value,
                sampleSize: newValue,
            };
        },
    });
    this.vmSampleSize = new InputNumberSpinnerViewModel({
        id: "vmSampleSize",
        parent: this,
        value: this._uiState.value.sampleSize,
        min: 1,
        onChange: (_, newValue) => {
            this._uiState.value = {
                ...this._uiState.value,
                sampleSize: newValue,
            };
        },
    });

    this._uiState.onChange((_1, _2, newValue) => {
        setElementValue(this.vmSuccessThreshold.element, newValue.successThreshold);
        setElementValue(this.vmSuccessThresholdSlider.element, newValue.successThreshold);
        this.vmSuccessThreshold.max = newValue.dieFaces;
        this.vmSuccessThresholdSlider.max = newValue.dieFaces;
        
        setElementValue(this.vmDiceLimitSlider.element, newValue.diceLimit);
        setElementValue(this.vmDiceLimit.element, newValue.diceLimit);

        setElementValue(this.vmObLimitSlider.element, newValue.obLimit);
        setElementValue(this.vmObLimit.element, newValue.obLimit);

        setElementValue(this.vmFacesSlider.element, newValue.dieFaces);
        setElementValue(this.vmFaces.element, newValue.dieFaces);

        setElementValue(this.vmModifierSlider.element, newValue.modifier);
        setElementValue(this.vmModifier.element, newValue.modifier);

        setElementValue(this.vmSampleSizeSlider.element, newValue.sampleSize);
        setElementValue(this.vmSampleSize.element, newValue.sampleSize);

        this._updateTable();
    });
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this._diceProbabilityTableElement = html.find("#predictions-table");
    this._updateTable();
  }
  
  /**
   * @private
   */
  _updateTable() {
    const columnCount = this._uiState.value.obLimit + 1;

    const gridStyle = `grid-column: span ${columnCount} / span ${columnCount}; grid-template-columns: repeat(${columnCount}, minmax(0, 1fr));`;
    let newHtmlContent = "";

    const rows = this._getTableRows();
    rows.forEach(row => {
        let rowInnerHtmlContent = "";
        row.forEach(column => {
            rowInnerHtmlContent = `${rowInnerHtmlContent}${column}`
        });
        const rowHtmlContent = `<div class="grid grid-gap-sm" style="${gridStyle}">${rowInnerHtmlContent}</div>`;
        newHtmlContent = `${newHtmlContent}${rowHtmlContent}`
    });

    $(this._diceProbabilityTableElement).html(newHtmlContent);
  }

  /**
   * @returns {Array<Array<String | Number>>}
   * 
   * @private
   */
  _getTableRows() {
    const uiState = this._uiState.value;

    // Generate first row. 
    const firstRowColumns = [
        "<span></span>"
    ];
    for (let ob = 1; ob <= uiState.obLimit; ob++) {
        firstRowColumns.push(`<span class="pad-sm"><b>Ob ${ob}</b></span>`);
    }

    const rows = [
        firstRowColumns,
    ];

    for (let numberOfDice = 1; numberOfDice <= uiState.diceLimit; numberOfDice++) {
        const columns = [
            `<span class="pad-sm"><b>${numberOfDice}D${uiState.dieFaces}</b></span>`
        ];

        for (let ob = 1; ob <= uiState.obLimit; ob++) {
            const successes = this._rollDiceAndCountSuccesses({
                faces: uiState.dieFaces, 
                ob: ob, 
                numberOfDice: numberOfDice, 
                successThreshold: uiState.successThreshold, 
                modifier: uiState.modifier, 
                sampleSize: uiState.sampleSize
            });
            const successLikelihood = Math.round((successes / uiState.sampleSize) * 100);
            const barDiagram = `<span style="width: ${successLikelihood}%; background-color: rgb(122, 122, 122); height: 1em;"></span>`;
            columns.push(`<div class="grid grid-gap-sm" style="grid-template-columns: 1fr 2fr;"><span>${successLikelihood}%</span>${barDiagram}</div>`)
        }

        rows.push(columns);
    }
    return rows;
  }

  /**
   * Rolls the given `numberOfDice` dice with `faces` number of faces and compares how often 
   * enough of the faces are at or above `successThreshold` and returns the total number 
   * of such occurrences. 
   * 
   * Adds automatic hits or misses, if `modifier` is != 0. 
   * 
   * @param {Object} args 
   * @param {Number} args.faces 
   * @param {Number} args.ob 
   * @param {Number} args.numberOfDice 
   * @param {Number} args.successThreshold 
   * @param {Number} args.modifier 
   * @param {Number} args.sampleSize 
   * * default `100`
   * 
   * @returns {Number} The amount of times enough dice were successes to meet the Ob. 
   */
  _rollDiceAndCountSuccesses(args = {}) {
    let successes = 0;

    for (let sample = 0; sample < args.sampleSize; sample++) {
        const rolledDice = new Die({ faces: args.faces, number: args.numberOfDice }).evaluate().results;
        let successesInRoll = 0;
    
        // Analyze face of every rolled die. 
        for (const rolledDie of rolledDice) {
            const face = parseInt(rolledDie.result);
            if (face >= args.successThreshold) {
                successesInRoll++;
            }
        }

        // Modifier.
        successesInRoll += args.modifier;

        if (successesInRoll >= args.ob) {
            successes++;
        }
    }

    return successes;
  }
}
