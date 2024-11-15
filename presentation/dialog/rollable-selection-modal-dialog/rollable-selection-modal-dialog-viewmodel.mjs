import ButtonViewModel from "../../component/button/button-viewmodel.mjs";
import ViewModel from "../../view-model/view-model.mjs";

export default class RollableSelectionModalDialogViewModel extends ViewModel {

  get isRollSectionExpanded() { return this._isRollSectionExpanded; }
  set isRollSectionExpanded(value) {
    this._isRollSectionExpanded = value;
    if (value === true) {
      this.element.find(`#${this.id}-roll-section`).removeClass("hidden");
      this.element.find(`#${this.id}-roll-section-expanded`).removeClass("hidden");
      this.element.find(`#${this.id}-roll-section-collapsed`).addClass("hidden");
    } else {
      this.element.find(`#${this.id}-roll-section`).addClass("hidden");
      this.element.find(`#${this.id}-roll-section-expanded`).addClass("hidden");
      this.element.find(`#${this.id}-roll-section-collapsed`).removeClass("hidden");
    }
  }

  get isSelectSectionExpanded() { return this._isSelectSectionExpanded; }
  set isSelectSectionExpanded(value) {
    this._isSelectSectionExpanded = value;
    if (value === true) {
      this.element.find(`#${this.id}-select-section`).removeClass("hidden");
      this.element.find(`#${this.id}-select-section-expanded`).removeClass("hidden");
      this.element.find(`#${this.id}-select-section-collapsed`).addClass("hidden");
    } else {
      this.element.find(`#${this.id}-select-section`).addClass("hidden");
      this.element.find(`#${this.id}-select-section-expanded`).addClass("hidden");
      this.element.find(`#${this.id}-select-section-collapsed`).removeClass("hidden");
    }
  }

  /**
   * @param {Object} args 
   * @param {RollTable} args.rollTable 
   */
  constructor(args = {}) {
    super(args);

    this._isRollSectionExpanded = true;
    this._isSelectSectionExpanded = false;

    this.rollTable = args.rollTable;
    this.options = [];
    for (const result of this.rollTable.results.values()) {
      this.options.push({
        id: result.documentId,
        img: result.img,
        name: result.text,
        weight: result.weight,
        rangeFrom: result.range[0],
        rangeTo: result.range[1],
      });
    }

    this.vmToggleRollSection = new ButtonViewModel({
      id: "vmToggleRollSection",
      parent: this,
      localizedLabel: game.i18n.localize("system.general.input.rollForIt"),
      isEditable: true,
      onClick: () => {
        this.isRollSectionExpanded = true;
        this.isSelectSectionExpanded = false;
      },
    });
    this.vmToggleSelectSection = new ButtonViewModel({
      id: "vmToggleSelectSection",
      parent: this,
      localizedLabel: game.i18n.localize("system.general.input.selectSpecific"),
      isEditable: true,
      onClick: () => {
        this.isRollSectionExpanded = false;
        this.isSelectSectionExpanded = true;
      },
    });
  }
}
