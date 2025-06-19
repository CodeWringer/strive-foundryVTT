import { UuidUtil } from "../../../business/util/uuid-utility.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import FoundryWrapper from "../../../common/foundry-wrapper.mjs";
import { SOUNDS_CONSTANTS } from "../../audio/sounds.mjs";
import { ChatUtil } from "../../chat/chat-utility.mjs";
import RollFormulaResolver from "../../dice/roll-formula-resolver.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * A button that allows performing a dice roll and then sending the result to the chat. 
 * 
 * @extends ViewModel
 * 
 * @property {Array<ViewModel>} formulaViewModels View model instances of formula list items. 
 * * These view models **must** expose a function named `resolveFormula`, which returns a `String`, 
 * that represents a fully resolved and rollable formula. E. g. `"5D5 + 2"`. 
 * * Read-only. 
 * @property {String} formulaListItemTemplate Template of the formula list item. 
 * @property {String} chatMessageTemplate Template of the results chat message. 
 * @property {Function} chatMessageDataProvider An async function that is queried upon rendering of the 
 * chat message template. The function must return an object that contains all parameters for the rendering. 
 * Receives arguments:
 * * `rolls: Object` See `RollFormulaResolver#evaluateFormulae()`
 */
export default class DiceRollListViewModel extends ViewModel {
  static get TEMPLATE() { return game.strive.const.TEMPLATES.DICE_ROLL_LIST; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
  */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('diceRollList', `{{> "${DiceRollListViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * @param {Array<ViewModel>} args.formulaViewModels View model instances of formula list items. 
   * * These view models **must** expose a function named `resolveFormula`, which returns a `String`, 
   * which represents a roll formula. E. g. `"5D5 + 2"` or e. g. `"@SI + 5D3"`. 
   * * These view models *should* expose:
   * * * A property named `localizedLabel`, which returns a `String`, which represents the localized label of the roll total. 
   * * * A property named `iconClass`, which returns a `String`, which is an icon class. 
   * @param {String} args.formulaListItemTemplate Template of the formula list item. 
   * @param {String} args.chatMessageTemplate Template of the results chat message. 
   * @param {Function} args.chatMessageDataProvider An async function that is queried upon rendering of the 
   * chat message template. The function must return an object that contains all parameters for the rendering. 
   * Receives arguments:
   * * `rolls: Object` See `RollFormulaResolver#evaluateFormulae()`
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["formulaViewModels", "formulaListItemTemplate", "chatMessageTemplate", "chatMessageDataProvider"]);

    this.formulaViewModels = args.formulaViewModels;
    this.formulaListItemTemplate = args.formulaListItemTemplate;
    this.chatMessageTemplate = args.chatMessageTemplate;
    this.chatMessageDataProvider = args.chatMessageDataProvider;

    this.vmBtnRoll = new ButtonViewModel({
      id: "vmBtnRoll",
      parent: this,
      isEditable: this.isEditable,
      localizedToolTip: game.i18n.localize("system.roll.doRoll"),
      iconHtml: '<i class="fas fa-dice-three"></i>',
      onClick: async () => {
        const evaluatedFormulae = await new RollFormulaResolver().evaluateFormulae(this.formulaViewModels);

        if (evaluatedFormulae === undefined) return; // User canceled. 

        // Render the results. 
        const providedData = await this.chatMessageDataProvider(evaluatedFormulae.rolls);
        const renderData = {
          id: UuidUtil.createUUID(),
          ...providedData,
        };
        const renderedContent = await new FoundryWrapper().renderTemplate(this.chatMessageTemplate, renderData);

        return ChatUtil.sendToChat({
          renderedContent: renderedContent,
          sound: SOUNDS_CONSTANTS.DICE_ROLL,
          visibilityMode: evaluatedFormulae.visibilityMode,
        });
      }
    });
  }
}
