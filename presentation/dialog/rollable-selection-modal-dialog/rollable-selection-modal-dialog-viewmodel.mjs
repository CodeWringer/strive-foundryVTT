import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import FoundryWrapper from "../../../common/foundry-wrapper.mjs";
import { SOUNDS_CONSTANTS } from "../../audio/sounds.mjs";
import ButtonSendToChatViewModel from "../../component/button-send-to-chat/button-send-to-chat-viewmodel.mjs";
import ButtonViewModel from "../../component/button/button-viewmodel.mjs";
import ChoiceOption from "../../component/input-choice/choice-option.mjs";
import InputDropDownViewModel from "../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import ViewModel from "../../view-model/view-model.mjs";

/**
 * @property {RollTable} selectedRollTable
 * 
 * @extends ViewModel
 */
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
   * Returns `true`, if more than one RollTable is available, so the user must choose the one to use. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get allowChoosingRollTable() { return this.rollTables.length > 1; }

  /**
   * @param {Object} args 
   * @param {Application} args.ui The dialog that contains this view model. 
   * @param {Array<RollTable>} args.rollTables A list of RollTables that the user can 
   * choose from. At least one **must** be provided! 
   * @param {String | undefined} args.selectedRollTable Name of the pre-selected RollTable. 
   * * default is the first of the given RollTables. 
   * @param {String | undefined} args.localizedSelectionType The localized type of document 
   * that is rollable. E. g. `"Injury"`. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["ui", "rollTables"]);

    this.ui = args.ui;

    this.rollTables = args.rollTables;
    if (args.rollTables.length < 1) {
      throw new Error("Must provide at least one RollTable name");
    }

    this._isRollSectionExpanded = true;
    this._isSelectSectionExpanded = false;
    this.localizedSelectionType = args.localizedSelectionType;

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

    if (this.allowChoosingRollTable) {
      this.rollTableOptions = this.rollTables.map(it => new ChoiceOption({
        value: it.id,
        localizedValue: it.name,
        icon: it.img,
      }));
      this.vmSelectRollTable1 = new InputDropDownViewModel({
        id: "vmSelectRollTable1",
        parent: this,
        isEditable: true,
        options: this.rollTableOptions,
        onChange: (_, newValue) => {
          this._setRollTable(newValue.value);
          this.vmSelectRollTable2._value = newValue;
        },
      });
      this.vmSelectRollTable2 = new InputDropDownViewModel({
        id: "vmSelectRollTable2",
        parent: this,
        isEditable: true,
        options: this.rollTableOptions,
        onChange: (_, newValue) => {
          this._setRollTable(newValue.value);
          this.vmSelectRollTable1._value = newValue;
        },
      });
    }

    this.selectedRollTable = args.selectedRollTable ? (this.rollTables.find(it => it.name === args.selectedRollTable)) : this.rollTables[0];
    this.options = [];
    for (const result of this.selectedRollTable.results.values()) {
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
    
    this.vmRoll = new ButtonViewModel({
      id: "vmRoll",
      parent: this,
      iconHtml: '<i class="fas fa-dice-three"></i>',
      isEditable: true,
      onClick: async () => {
        const roll = await this.selectedRollTable.roll();
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

    this.vmSendToChat1 = new ButtonSendToChatViewModel({
      id: "vmSendToChat1",
      parent: this,
      isEditable: true,
      target: this,
    });
    this.vmSendToChat2 = new ButtonSendToChatViewModel({
      id: "vmSendToChat2",
      parent: this,
      isEditable: true,
      target: this,
    });
  }

  /** @override */
  async activateListeners(html) {
    super.activateListeners(html);

    // Pre-roll an initial value.
    const roll = await this.selectedRollTable.roll();
    const rollResultId = roll.results[0].documentId;
    this._setRolledResult(rollResultId);
  }

  /**
   * Sends the currently selected document to chat. 
   * 
   * @param {VisibilityMode} visibilityMode Determines the visibility of the chat message. 
   * 
   * @async
   */
  async sendToChat(visibilityMode) {
    const id = (this._isRollSectionExpanded === true) ? this._rolledId : this._selectedId;

    const document = await new DocumentFetcher().find({
      id: id,
      includeLocked: true,
    });
    await document.getTransientObject().sendToChat(visibilityMode);
  }

  /**
   * @param {String} id 
   * 
   * @private
   */
  _setRollTable(id) {
    const rollTable = this.rollTables.find(it => it.id === id);
    this.selectedRollTable = rollTable;

    this.options = [];
    for (const result of this.selectedRollTable.results.values()) {
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

    this._choices = this.options.map(it => new ChoiceOption({
      value: it.id,
      icon: it.img,
      localizedValue: it.name,
    }));
    this._selectedId = this._choices[0].value;
    this.vmSelect.options = this._choices;
    this.vmSelect.value = this._choices[0],

    this.ui.render(true);
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
