import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import FoundryWrapper from "../../../common/foundry-wrapper.mjs";
import { SOUNDS_CONSTANTS } from "../../audio/sounds.mjs";
import ButtonViewModel from "../../component/button/button-viewmodel.mjs";
import ChoiceOption from "../../component/input-choice/choice-option.mjs";
import InputDropDownViewModel from "../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import ViewModel from "../../view-model/view-model.mjs";

export default class RollableSelectionModalDialogViewModel extends ViewModel {

  get isRollSectionExpanded() { return this._isRollSectionExpanded; }
  set isRollSectionExpanded(value) {
    this._isRollSectionExpanded = value;
    if (value === true) {
      this.element.find(`#${this.id}-roll-section`).removeClass("hidden");
      this.element.find(`#${this.id}-roll-section-expanded`).removeClass("hidden");
      this.element.find(`#${this.id}-roll-section-collapsed`).addClass("hidden");
      this.element.find(`#${this.id}-header-roll-section`).addClass("active");
      this._setSelected(this._rolledId);
    } else {
      this.element.find(`#${this.id}-roll-section`).addClass("hidden");
      this.element.find(`#${this.id}-roll-section-expanded`).addClass("hidden");
      this.element.find(`#${this.id}-roll-section-collapsed`).removeClass("hidden");
      this.element.find(`#${this.id}-header-roll-section`).removeClass("active");
    }
  }
  
  get isSelectSectionExpanded() { return this._isSelectSectionExpanded; }
  set isSelectSectionExpanded(value) {
    this._isSelectSectionExpanded = value;
    if (value === true) {
      this.element.find(`#${this.id}-select-section`).removeClass("hidden");
      this.element.find(`#${this.id}-select-section-expanded`).removeClass("hidden");
      this.element.find(`#${this.id}-select-section-collapsed`).addClass("hidden");
      this.element.find(`#${this.id}-header-select-section`).addClass("active");
      this._setSelected(this._selectedId);
    } else {
      this.element.find(`#${this.id}-select-section`).addClass("hidden");
      this.element.find(`#${this.id}-select-section-expanded`).addClass("hidden");
      this.element.find(`#${this.id}-select-section-collapsed`).removeClass("hidden");
      this.element.find(`#${this.id}-header-select-section`).removeClass("active");
    }
  }

  /**
   * @param {Object} args 
   * @param {RollTable} args.rollTable 
   * @param {String | undefined} args.localizedSelectionType 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["rollTable"]);

    this._isRollSectionExpanded = true;
    this._isSelectSectionExpanded = false;
    this.localizedSelectionType = args.localizedSelectionType;

    this.rollTable = args.rollTable;
    this.options = [];
    for (const result of this.rollTable.results.values()) {
      this.options.push({
        id: result.documentId,
        img: result.img,
        name: result.text,
        weight: result.weight,
        collection: result.documentCollection,
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
    this.vmRoll = new ButtonViewModel({
      id: "vmRoll",
      parent: this,
      iconHtml: '<i class="fas fa-dice-three"></i>',
      isEditable: true,
      onClick: async () => {
        const roll = await this.rollTable.roll();
        const rollResultId = roll.results[0].documentId;
        this._setRolledResult(rollResultId);
        await new FoundryWrapper().playSound(SOUNDS_CONSTANTS.DICE_ROLL)
      },
    });

    this._choices = this.options.map(it => new ChoiceOption({
      value: it.id,
      icon: it.img,
      localizedValue: it.name,
    }));
    this._selectedId = this._choices[0].value;
    this.vmSelect = new InputDropDownViewModel({
      id: "vmSelect",
      parent: this,
      isEditable: true,
      options: this._choices,
      value: this._choices[0],
      onChange: (_, newValue) => {
        this._setSelected(newValue.value);
        this._selectedId = newValue.value;
      },
    });
  }

  /** @override */
  async activateListeners(html) {
    super.activateListeners(html);

    // Pre-roll an initial value.
    const roll = await this.rollTable.roll();
    const rollResultId = roll.results[0].documentId;
    this._setRolledResult(rollResultId);
  }

  /**
   * @param {String} id 
   * 
   * @private
   */
  _setRolledResult(id) {
    const selectedOption = this.options.find(it => it.id === id);
    const resultElement = this.element.find(`#${this.id}-roll-result`);
        
    resultElement.find("img").attr("src", selectedOption.img); 
    resultElement.find("span").text(selectedOption.name); 
    resultElement.removeClass("hidden");

    this._setSelected(selectedOption.id);
    this._rolledId = selectedOption.id;
  }

  /**
   * @param {String} id 
   * 
   * @private
   */
  _setSelected(id) {
    const obj = this.options.find(it => it.id === id);

    this.selected = {
      id: id,
      name: obj.name,
      img: obj.img,
      collection: obj.collection,
    };
  }
}
