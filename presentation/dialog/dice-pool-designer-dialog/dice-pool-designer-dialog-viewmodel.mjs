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
        min: 1,
        onChange: (_, newValue) => {
            this._uiState.value = {
                ...this._uiState.value,
                dieFaces: newValue,
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
    $(this._diceProbabilityTableElement).attr("style", `grid-column: span ${columnCount} / span ${columnCount}; grid-template-columns: repeat(${columnCount}, minmax(0, 1fr));`);

    let newHtmlContent = "";

    const rows = this._getTableRows();
    rows.forEach(row => {
        let rowHtmlContent = "";
        row.forEach(column => {
            const columnHtmlContent = `<div>${column}</div>`;
            rowHtmlContent = `${rowHtmlContent}${columnHtmlContent}`
        }) 
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
        "<div></div>"
    ];
    for (let ob = 1; ob <= uiState.obLimit; ob++) {
        firstRowColumns.push(`Ob ${ob}`);
    }

    const rows = [
        firstRowColumns,
    ];

    for (let numberOfDice = 1; numberOfDice <= uiState.diceLimit; numberOfDice++) {
        const columns = [
            `${numberOfDice}D${uiState.dieFaces}`
        ];

        for (let ob = 1; ob <= uiState.obLimit; ob++) {
            const successes = this._rollDiceAndCountSuccesses(uiState.dieFaces, ob, numberOfDice, uiState.successThreshold, uiState.sampleSize);
            const successLikelihood = Math.round((successes / uiState.sampleSize) * 100);
            columns.push(`${successLikelihood}%`)
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
   * @param {Number} faces 
   * @param {Number} ob 
   * @param {Number} numberOfDice 
   * @param {Number} successThreshold 
   * @param {Number} sampleSize 
   * * default `100`
   * 
   * @returns {Number} The amount of times enough dice were successes to meet the Ob. 
   */
  _rollDiceAndCountSuccesses(faces, ob, numberOfDice, successThreshold, sampleSize = 100) {
    let successes = 0;

    for (let sample = 0; sample < sampleSize; sample++) {
        const rolledDice = new Die({ faces: faces, number: numberOfDice }).evaluate().results;
        let successesInRoll = 0;
    
        // Analyze face of every rolled die. 
        for (const rolledDie of rolledDice) {
            const face = parseInt(rolledDie.result);
            if (face >= successThreshold) {
                successesInRoll++;
            }
        }

        if (successesInRoll >= ob) {
            successes++;
        }
    }

    return successes;
  }
}
