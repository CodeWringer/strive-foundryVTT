import { DerivedAttributeRollData, DerivedAttributeRollSchema } from "../../../../../business/dice/ability-roll/derived-attribute-roll-schema.mjs"
import TransientBaseCharacterActor from "../../../../../business/document/actor/transient-base-character-actor.mjs"
import RulesetExplainer from "../../../../../business/ruleset/ruleset-explainer.mjs"
import GameSystemUserSettings from "../../../../../business/setting/game-system-user-settings.mjs"
import { ValidationUtil } from "../../../../../business/util/validation-utility.mjs"
import { ExtenderUtil } from "../../../../../common/extender-util.mjs"
import ButtonRollViewModel from "../../../../component/button-roll/button-roll-viewmodel.mjs"
import ReadOnlyValueViewModel from "../../../../component/read-only-value/read-only-value.mjs"
import ViewModel from "../../../../view-model/view-model.mjs"
import ActorAttributesViewModel from "./actor-attributes-viewmodel.mjs"
import ActorGeneralCombatAbilitiesViewModel from "./actor-general-combat-abilities-viewmodel.mjs"
import ActorSkillsViewModel from "./actor-skills-viewmodel.mjs"

/**
 * @extends ViewModel
 */
export default class ActorAbilitiesViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_ABILITIES; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {String}
   * @readonly
   */
  get attributesTemplate() { return ActorAttributesViewModel.TEMPLATE; }

  /**
   * @type {String}
   * @readonly
   */
  get skillsTemplate() { return ActorSkillsViewModel.TEMPLATE; }

  /**
   * @type {String}
   * @readonly
   */
  get generalCombatAbilitiesTemplate() { return ActorGeneralCombatAbilitiesViewModel.TEMPLATE; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get isInCombat() { return this.document.document.inCombat; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get showReminders() { return new GameSystemUserSettings().get(GameSystemUserSettings.KEY_TOGGLE_REMINDERS); }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get showGeneralCombatReminders() { return this.isInCombat && this.showReminders; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientBaseCharacterActor} args.document
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.document = args.document;

    if (this.isInCombat) {
      this.vmGeneralCombatAbilities = new ActorGeneralCombatAbilitiesViewModel({
        id: "vmGeneralCombatAbilities",
        parent: this,
        document: this.document,
      });
    }
    this.vmAttributes = new ActorAttributesViewModel({
      id: "vmAttributes",
      parent: this,
      document: this.document,
    });
    this.vmSkills = new ActorSkillsViewModel({
      id: "vmSkills",
      parent: this,
      document: this.document,
    });

    this.vmBaseInitiative = new ReadOnlyValueViewModel({
      id: "vmBaseInitiative",
      parent: this,
      value: this.document.baseInitiative,
      localizedToolTip: new RulesetExplainer().getExplanationForBaseInitiative(this.document),
    });
    this.vmRollSprintingSpeed = new ButtonRollViewModel({
      id: "vmRollSprintingSpeed",
      parent: this,
      actor: this.document,
      target: new DerivedAttributeRollData({
        derivedAttributeValue: this.document.sprintingSpeed,
        internalName: "sprintingSpeed",
        localizableName: "system.character.attribute.sprintingSpeed.label",
      }),
      rollSchema: new DerivedAttributeRollSchema({
        dieFaces: 6,
        hitThreshold: 5,
      }),
    });
    this.vmSprintingSpeed = new ReadOnlyValueViewModel({
      id: "vmSprintingSpeed",
      parent: this,
      value: this.document.sprintingSpeed,
      localizedToolTip: new RulesetExplainer().getExplanationForSprintingSpeed(this.document),
    });
  }

  /**
   * Updates the data of this view model. 
   * 
   * @param {Object} args 
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document.
   * * Default `false`. 
   * 
   * @override
   */
  update(args = {}) {
    super.update(args);
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(ActorAbilitiesViewModel));
  }

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    return updates;
  }
}
