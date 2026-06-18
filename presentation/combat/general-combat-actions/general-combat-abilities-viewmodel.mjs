import ViewModel from "../../view-model/view-model.mjs";
import { ExtenderUtil } from "../../../common/util/extender-util.mjs";
import FoundryWrapper from "../../../foundry-interop/foundry-wrapper.mjs";
import { ChatUtil } from "../../chat/chat-utility.mjs";
import { VISIBILITY_MODES, VisibilityMode } from "../../chat/visibility-modes.mjs";

/**
 * @property {ViewModel} vmChild
 */
export default class GeneralCombatAbilitiesViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.GENERAL_COMBAT_ABILITIES_CHAT_MESSAGE; }

  /**
   * Renders an instance of this view model's template and sends it to chat. 
   * 
   * @param {VisibilityMode | undefined} visibilityMode Chat visibility. 
   * * default `VISIBILITY_MODES.public` 
   * 
   * @async
   * @static
   */
  static async sendToChat(visibilityMode) {
    const viewModel = new GeneralCombatAbilitiesViewModel({});
    const rendered = await new FoundryWrapper().renderTemplate(GeneralCombatAbilitiesViewModel.TEMPLATE, {
      viewModel: viewModel,
    });
    await ChatUtil.sendToChat({
      renderedContent: rendered,
      visibilityMode: visibilityMode ?? VISIBILITY_MODES.public,
    });
  }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   */
  constructor(args = {}) {
    super(args);

    this.reminders = [
      new Reminder({
        id: "actionPointsReminder",
        localizableLabel: "system.character.abilities.general.actionPoints.label",
        viewModel: new ViewModel({
          id: "vmActionPoints",
          parent: this,
          localizedToolTip: game.i18n.localize("system.character.abilities.general.actionPoints.tooltip"),
        }),
      }),
      new Reminder({
        id: "actionPointSavingReminder",
        localizableLabel: "system.character.abilities.general.actionPointSaving.label",
        viewModel: new ViewModel({
          id: "vmActionPointSaving",
          parent: this,
          localizedToolTip: game.i18n.localize("system.character.abilities.general.actionPointSaving.tooltip"),
        }),
      }),
      new Reminder({
        id: "combatMovementReminder",
        localizableLabel: "system.character.abilities.general.combatMovement.label",
        viewModel: new ViewModel({
          id: "vmCombatMovement",
          parent: this,
          localizedToolTip: game.i18n.localize("system.character.abilities.general.combatMovement.tooltip"),
        }),
      }),
      new Reminder({
        id: "disengageReminder",
        localizableLabel: "system.character.abilities.general.disengage.label",
        viewModel: new ViewModel({
          id: "vmDisengage",
          parent: this,
          localizedToolTip: game.i18n.localize("system.character.abilities.general.disengage.tooltip"),
        }),
      }),
      new Reminder({
        id: "fleeCombatReminder",
        localizableLabel: "system.character.abilities.general.fleeCombat.label",
        viewModel: new ViewModel({
          id: "vmFleeCombat",
          parent: this,
          localizedToolTip: game.i18n.localize("system.character.abilities.general.fleeCombat.tooltip"),
        }),
      }),
      new Reminder({
        id: "pushThroughReminder",
        localizableLabel: "system.character.abilities.general.pushThrough.label",
        viewModel: new ViewModel({
          id: "vmPushThrough",
          parent: this,
          localizedToolTip: game.i18n.localize("system.character.abilities.general.pushThrough.tooltip"),
        }),
      }),
      new Reminder({
        id: "swapOutReminder",
        localizableLabel: "system.character.abilities.general.swapOut.label",
        viewModel: new ViewModel({
          id: "vmSwapOut",
          parent: this,
          localizedToolTip: game.i18n.localize("system.character.abilities.general.swapOut.tooltip"),
        }),
      }),
      new Reminder({
        id: "attacksOfOpportunityReminder",
        localizableLabel: "system.character.abilities.general.attacksOfOpportunity.label",
        viewModel: new ViewModel({
          id: "vmAttacksOfOpportunity",
          parent: this,
          localizedToolTip: game.i18n.localize("system.character.abilities.general.attacksOfOpportunity.tooltip"),
        }),
      }),
      new Reminder({
        id: "flankingReminder",
        localizableLabel: "system.character.abilities.general.flanking.label",
        viewModel: new ViewModel({
          id: "vmFlanking",
          parent: this,
          localizedToolTip: game.i18n.localize("system.character.abilities.general.flanking.tooltip"),
        }),
      }),
      new Reminder({
        id: "defenseStuntsReminder",
        localizableLabel: "system.character.abilities.general.defenseStunts.label",
        viewModel: new ViewModel({
          id: "vmDefenseStunts",
          parent: this,
          localizedToolTip: game.i18n.localize("system.character.abilities.general.defenseStunts.tooltip"),
        }),
      }),
    ];
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(GeneralCombatAbilitiesViewModel));
  }

}

/**
 * Represents a rules reminder. 
 */
class Reminder {
  /**
   * @param {Object} args 
   * @param {String} args.id 
   * @param {String} args.localizableLabel 
   * @param {ViewModel} args.viewModel 
   */
  constructor(args = {}) {
    this.id = args.id;
    this.localizableLabel = args.localizableLabel;
    this.viewModel = args.viewModel;
  }
}
