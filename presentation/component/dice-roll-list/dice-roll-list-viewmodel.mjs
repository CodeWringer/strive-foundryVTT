import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { SOUNDS_CONSTANTS } from "../../audio/sounds.mjs";
import * as ChatUtil from "../../chat/chat-utility.mjs";
import VisibilitySingleChoiceDialog from "../../dialog/visibility-single-choice-dialog/visibility-single-choice-dialog.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
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
 * @property {String | undefined} chatTitle Title to display above the chat message. 
 */
export default class DiceRollListViewModel extends ViewModel {
  static get TEMPLATE() { return TEMPLATES.DICE_ROLL_LIST; }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * @param {Array<ViewModel>} args.formulaViewModels View model instances of formula list items. 
   * * These view models **must** expose a function named `resolveFormula`, which returns a `String`, 
   * which represents a fully resolved and rollable formula. E. g. `"5D5 + 2"`. 
   * * These view models *should* expose a property named `localizedLabel`, which returns a `String`,
   * which represents the localized label of the roll total. 
   * @param {String} args.formulaListItemTemplate Template of the formula list item. 
   * @param {String} args.chatMessageTemplate Template of the results chat message. 
   * @param {String | undefined} args.chatTitle Title to display above the chat message. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["formulaViewModels", "formulaListItemTemplate", "chatMessageTemplate"]);

    this.formulaViewModels = args.formulaViewModels;
    this.formulaListItemTemplate = args.formulaListItemTemplate;
    this.chatMessageTemplate = args.chatMessageTemplate;
    this.chatTitle = args.chatTitle;

    const thiz = this;
    
    this.vmBtnRoll = new ButtonViewModel({
      id: "vmBtnRoll",
      parent: thiz,
      isEditable: thiz.isEditable,
      localizableTitle: "ambersteel.roll.doRoll",
      onClick: async (html, isOwner, isEditable) => {
        const dialog = await new VisibilitySingleChoiceDialog().renderAndAwait(true);
        if (dialog.confirmed !== true) return;

        const rolls = [];
        for (const viewModel of thiz.formulaViewModels) {
          const resolvedFormula = viewModel.resolveFormula();
          const formulaRollResult = new Roll(resolvedFormula);
          await formulaRollResult.evaluate({ async: true });

          // Get an array of each dice term. 
          const diceResults = [];
          for (const term of formulaRollResult.terms) {
            if (term.values !== undefined) {
              for (const value of term.values) {
                diceResults.push({
                  value: value,
                  isDiceResult: true,
                });
              }
            } else {
              diceResults.push({
                value: term.total,
                isDiceResult: false,
              });
            }
          }

          const obj = {
            formula: resolvedFormula,
            rollTotal: formulaRollResult.total,
            diceResults: diceResults,
            localizedLabel: viewModel.localizedLabel,
          };
          rolls.push(obj);
        }

        // Render the results. 
        const renderedContent = await renderTemplate(thiz.chatMessageTemplate, {
          title: thiz.chatTitle,
          rolls: rolls,
        });

        return ChatUtil.sendToChat({
          renderedContent: renderedContent,
          sound: SOUNDS_CONSTANTS.DICE_ROLL,
          visibilityMode: dialog.visibilityMode,
        });
      },
    });
  }
}

Handlebars.registerPartial('diceRollList', `{{> "${DiceRollListViewModel.TEMPLATE}"}}`);
