import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import FoundryWrapper from "../../../common/foundry-wrapper.mjs";
import ObservableField from "../../../common/observables/observable-field.mjs";
import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputSliderViewModel from "../../component/input-slider/input-slider-viewmodel.mjs";
import { setElementValue } from "../../sheet/sheet-utility.mjs";
import ViewModel from "../../view-model/view-model.mjs";

export default class DicePoolDesignerDialogViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.DIALOG_DICE_POOL_DESIGNER; }

  /**
   * @static
   * @readonly
   * @type {String}
   */
  static get ID_TABLE_ELEMENT() { return "predictions-table"; }

  /**
   * Observable ui state. 
   * 
   * @example
   * To update, copy the entire value object and adjust its fields: 
   * ```JS
   * this._uiState.value = {
   *   ...this._uiState.value,
   *   hitThreshold: newValue,
   * };
   * ```
   * 
   * @property {Object} value 
   * @property {Number} value.dieFaces The number of faces on a die. 
   * * default `6`
   * @property {Number} value.hitThreshold Sets the lower bound of faces that are considered 
   * hits. Any face turning up this number and numbers above, are considered hits. 
   * * default `5`
   * @property {Number} value.obLimit 
   * @property {Number} value.diceLimit 
   * @property {Number} value.sampleSize 
   * @property {Number} value.modifier Number of automatic hits/misses. 
   * @property {Number} value.compensationPoints The number of faces that misses will be turned 
   * to the next higher face, until they score a hit. 
   * 
   * @type {Object}
   * @private
   */
  _uiState = new ObservableField({
    value: {
      dieFaces: 6,
      hitThreshold: 5,
      obLimit: 10,
      diceLimit: 20,
      sampleSize: 1000,
      modifier: 0,
      compensationPoints: 0,
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

    this.vmHitThresholdSlider = new InputSliderViewModel({
      id: "vmHitThresholdSlider",
      parent: this,
      min: 1,
      max: this._uiState.value.dieFaces,
      value: this._uiState.value.hitThreshold,
      onChange: (_, newValue) => {
        this._uiState.value = {
          ...this._uiState.value,
          hitThreshold: newValue,
        };
      },
    });
    this.vmHitThreshold = new InputNumberSpinnerViewModel({
      id: "vmHitThreshold",
      parent: this,
      min: 1,
      max: this._uiState.value.dieFaces,
      value: this._uiState.value.hitThreshold,
      onChange: (_, newValue) => {
        this._uiState.value = {
          ...this._uiState.value,
          hitThreshold: newValue,
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
      max: 10000,
      step: 100,
      onChange: (_, newValue) => {
        this._uiState.value = {
          ...this._uiState.value,
          sampleSize: newValue,
        };
      },
    });

    this.vmCompensationPointsSlider = new InputSliderViewModel({
      id: "vmCompensationPointsSlider",
      parent: this,
      min: 0,
      max: 20,
      value: this._uiState.value.compensationPoints,
      onChange: (_, newValue) => {
        this._uiState.value = {
          ...this._uiState.value,
          compensationPoints: newValue,
        };
      },
    });
    this.vmCompensationPoints = new InputNumberSpinnerViewModel({
      id: "vmCompensationPoints",
      parent: this,
      value: this._uiState.value.compensationPoints,
      min: 0,
      max: 20,
      onChange: (_, newValue) => {
        this._uiState.value = {
          ...this._uiState.value,
          compensationPoints: newValue,
        };
      },
    });

    this._uiState.onChange(async (_1, _2, newValue) => {
      setElementValue(this.vmHitThreshold.element, newValue.hitThreshold);
      setElementValue(this.vmHitThresholdSlider.element, newValue.hitThreshold);
      this.vmHitThreshold.max = newValue.dieFaces;
      this.vmHitThresholdSlider.max = newValue.dieFaces;

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

      setElementValue(this.vmCompensationPointsSlider.element, newValue.compensationPoints);
      setElementValue(this.vmCompensationPoints.element, newValue.compensationPoints);

      await this._updateTable();
    });
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this._diceProbabilityTableElement = html.find(`#${DicePoolDesignerDialogViewModel.ID_TABLE_ELEMENT}`);
    await this._updateTable();
  }

  /**
   * @private
   * 
   * @async
   */
  async _updateTable() {
    const columnCount = this._uiState.value.obLimit + 1;

    const gridStyle = `grid-column: span ${columnCount} / span ${columnCount}; grid-template-columns: repeat(${columnCount}, minmax(0, 1fr));`;
    let newHtmlContent = "";

    const rows = await this._getTableRows();
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
   * 
   * @async
   */
  async _getTableRows() {
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

      const totalRolledFaces = [];
      for (let sample = 0; sample < uiState.sampleSize; sample++) {
        const rolledFaces = await new FoundryWrapper().getEvaluatedDice(uiState.dieFaces, numberOfDice);
        rolledFaces.sort().reverse();
        totalRolledFaces.push(rolledFaces);
      }

      for (let ob = 1; ob <= uiState.obLimit; ob++) {
        const diceResults = await this._analyzeDice({
          totalRolledFaces: totalRolledFaces,
          ob: ob,
          hitThreshold: uiState.hitThreshold,
          modifier: uiState.modifier,
          compensationPoints: uiState.compensationPoints,
        });
        const successLikelihoodHtml = `<span>${diceResults.successLikelihood}%</span>`;

        const averageHits = diceResults.averageHits;
        const averageHitsHtml = `<span>~${averageHits}</span>`;

        const barDiagram = `<span style="width: ${diceResults.successLikelihood}%; background-color: rgb(122, 122, 122); height: 1em;"></span>`;
        const barDiagramHtml = `<span class="flex flex-middle">${barDiagram}</span>`;

        columns.push(`<div class="grid grid-gap-sm" style="grid-template-columns: 2.5em 1.5em 3fr;">${successLikelihoodHtml}${averageHitsHtml}${barDiagramHtml}</div>`)
      }

      rows.push(columns);
    }
    return rows;
  }

  /**
   * Rolls the given `numberOfDice` dice with `faces` number of faces and returns statistics about 
   * the results. 
   * 
   * Adds automatic hits or misses, if `modifier` is != 0. 
   * 
   * @param {Object} args 
   * @param {Number} args.ob 
   * @param {Array<Array<Number>>} args.totalRolledFaces 
   * @param {Number} args.hitThreshold 
   * @param {Number} args.modifier 
   * @param {Number} args.compensationPoints 
   * * default `0`
   * 
   * @returns {Object} 
   * 
   * @async
   */
  async _analyzeDice(args = {}) {
    let totalSuccesses = 0;
    let totalHits = 0;

    for (let sample = 0; sample < args.totalRolledFaces.length; sample++) {
      const rolledFaces = args.totalRolledFaces[sample];

      let hitsInRoll = 0;
      let remainingCompensationPoints = args.compensationPoints ?? 0;
      for (let i = 0; i < rolledFaces.length; i++) {
        const face = rolledFaces[i];
        if (face >= args.hitThreshold) {
          hitsInRoll++;
        } else if (remainingCompensationPoints > 0) {
          const delta = args.hitThreshold - face;
          const compensationDelta = remainingCompensationPoints - delta;
          if (compensationDelta < 0) {
            break;
          } else {
            hitsInRoll++;
            remainingCompensationPoints = compensationDelta;
          }
        } else {
          break;
        }
      }

      // Add modifier.
      hitsInRoll += args.modifier;

      // Increment counters. 
      totalHits += hitsInRoll;

      if (hitsInRoll >= args.ob) {
        totalSuccesses++;
      }
    }

    return {
      totalSuccesses: totalSuccesses,
      successLikelihood: Math.round((totalSuccesses / args.totalRolledFaces.length) * 100),
      totalHits: totalHits,
      averageHits: Math.round(totalHits / args.totalRolledFaces.length),
    };
  }
}
