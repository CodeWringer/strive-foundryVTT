import ViewModel from "../../../../view-model/view-model.mjs";
import TransientBaseCharacterActor from "../../../../../business/document/actor/transient-base-character-actor.mjs";
import { ExtenderUtil } from "../../../../../common/extender-util.mjs";
import { ValidationUtil } from "../../../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../../../component/button/button-viewmodel.mjs";

/**
 * @property {ViewModel} vmChild
 */
export default class ActorGeneralCombatAbilitiesViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_GENERAL_COMBAT_ABILITIES; }

  /**
   * @type {Boolean}
   * @private
   */
  _isExpanded = false;
  /**
   * Returns the current expansion state. 
   * 
   * @type {Boolean}
   */
  get isExpanded() { return this._isExpanded; }
  /**
   * Sets the current expansion state. 
   * 
   * @param {Boolean} value If `true`, will be expanded, else collapsed. 
   */
  set isExpanded(value) {
    this._isExpanded = value;
    this.writeViewState();

    const contentElement = this.element.find(`#${this.id}-content`);
    const expansionUpIndicatorElement = this.element.find(`#${this.id}-expansion-indicator-up`);
    const expansionDownIndicatorElement = this.element.find(`#${this.id}-expansion-indicator-down`);
    if (value === true) {
      contentElement.removeClass("hidden");
      contentElement.animate({
        height: "100%"
      }, 300, () => {
      });
      expansionUpIndicatorElement.removeClass("hidden");
      expansionDownIndicatorElement.addClass("hidden");
    } else {
      contentElement.animate({
        height: "0%"
      }, 300, () => {
        contentElement.addClass("hidden");
      });
      expansionUpIndicatorElement.addClass("hidden");
      expansionDownIndicatorElement.removeClass("hidden");
    }
  }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientBaseCharacterActor} args.document
   * @param {Boolean | undefined} args.isExpanded If `true`, will initially render in expanded state. 
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    // Own properties.
    this.document = args.document;
    this.registerViewStateProperty("_isExpanded");
    this._isExpanded = args.isExpanded ?? false;

    this.vmHeaderButton = new ButtonViewModel({
      id: "vmHeaderButton",
      parent: this,
      localizedLabel: this.title,
      onClick: () => {
        this.isExpanded = !this.isExpanded;
      },
      isEditable: true, // Even those without editing right should be able to see nested content. 
    });

    this.reminders = [
      new Reminder({
        id: "actionPointsReminder",
        localizableLabel: "system.character.abilities.general.actionPoints.label",
        viewModel: new ViewModel({
          id: "vmActionPoints",
          parent: this,
          localizedToolTip: game.i18n.localize("system.character.abilities.general.actionPoints.tooltip"),
        })
      }),
      new Reminder({
        id: "actionPointSavingReminder",
        localizableLabel: "system.character.abilities.general.actionPointSaving.label",
        viewModel: new ViewModel({
          id: "vmActionPointSaving",
          parent: this,
          localizedToolTip: game.i18n.localize("system.character.abilities.general.actionPointSaving.tooltip"),
        })
      }),
      new Reminder({
        id: "combatMovementReminder",
        localizableLabel: "system.character.abilities.general.combatMovement.label",
        viewModel: new ViewModel({
          id: "vmCombatMovement",
          parent: this,
          localizedToolTip: game.i18n.localize("system.character.abilities.general.combatMovement.tooltip"),
        })
      }),
      new Reminder({
        id: "disengageReminder",
        localizableLabel: "system.character.abilities.general.disengage.label",
        viewModel: new ViewModel({
          id: "vmDisengage",
          parent: this,
          localizedToolTip: game.i18n.localize("system.character.abilities.general.disengage.tooltip"),
        })
      }),
      new Reminder({
        id: "fleeCombatReminder",
        localizableLabel: "system.character.abilities.general.fleeCombat.label",
        viewModel: new ViewModel({
          id: "vmFleeCombat",
          parent: this,
          localizedToolTip: game.i18n.localize("system.character.abilities.general.fleeCombat.tooltip"),
        })
      }),
      new Reminder({
        id: "pushThroughReminder",
        localizableLabel: "system.character.abilities.general.pushThrough.label",
        viewModel: new ViewModel({
          id: "vmPushThrough",
          parent: this,
          localizedToolTip: game.i18n.localize("system.character.abilities.general.pushThrough.tooltip"),
        })
      }),
      new Reminder({
        id: "swapOutReminder",
        localizableLabel: "system.character.abilities.general.swapOut.label",
        viewModel: new ViewModel({
          id: "vmSwapOut",
          parent: this,
          localizedToolTip: game.i18n.localize("system.character.abilities.general.swapOut.tooltip"),
        })
      }),
    ];
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(ActorGeneralCombatAbilitiesViewModel));
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
