import { DerivedAttributeRollData, DerivedAttributeRollSchema } from "../../../../../business/dice/ability-roll/derived-attribute-roll-schema.mjs"
import TransientBaseCharacterActor from "../../../../../business/document/actor/transient-base-character-actor.mjs"
import RulesetExplainer from "../../../../../business/ruleset/ruleset-explainer.mjs"
import { ValidationUtil } from "../../../../../business/util/validation-utility.mjs"
import { ExtenderUtil } from "../../../../../common/extender-util.mjs"
import ButtonRollViewModel from "../../../../component/button-roll/button-roll-viewmodel.mjs"
import InputNumberSpinnerViewModel from "../../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import ReadOnlyValueViewModel from "../../../../component/read-only-value/read-only-value.mjs"
import ViewModel from "../../../../view-model/view-model.mjs"
import ActorAttributesViewModel from "./attribute/actor-attributes-viewmodel.mjs"
import ActorSkillsViewModel from "./actor-skills-viewmodel.mjs"
import ActorTraitsViewModel from "./actor-traits-viewmodel.mjs"
import ActorMomentumViewModel from "./momentum/actor-momentum-viewmodel.mjs"

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
  get momentumActionsTemplate() { return ActorMomentumViewModel.TEMPLATE; }

  /**
   * @type {String}
   * @readonly
   */
  get traitsTemplate() { return ActorTraitsViewModel.TEMPLATE; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isInCombat() { return this.document.document.inCombat; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get showGeneralCombatReminders() { return this.isInCombat && this.showReminders; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get advancementEnabled() { return this.document.advancement.advancementEnabled; }
  
  /**
   * Returns true, if at least one Momentum Action exists on the character. 
   * @type {Boolean}
   * @readonly
   */
  get showMomentum() { return this.document.momentum.actions.length > 0; }
  
  /**
   * Returns true, if at least one Trait exists on the character. 
   * @type {Boolean}
   * @readonly
   */
  get showTraits() { return this.document.traits.length > 0; }

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
    if (this.showMomentum) {
      this.vmMomentumActions = new ActorMomentumViewModel({
        id: "vmMomentumActions",
        parent: this,
        document: this.document,
      });
    }
    if (this.showTraits) {
      this.vmTraits = new ActorTraitsViewModel({
        id: "vmTraits",
        parent: this,
        document: this.document,
      });
    }

    this.vmBaseInitiativeIcon = new ViewModel({
      id: "vmBaseInitiativeIcon",
      parent: this,
      localizedToolTip: game.i18n.localize("system.character.attribute.initiative.baseInitiative"),
    });
    this.vmBaseInitiative = new ReadOnlyValueViewModel({
      id: "vmBaseInitiative",
      parent: this,
      value: this.document.baseInitiative,
      localizedToolTip: new RulesetExplainer().getExplanationForBaseInitiative(this.document),
    });
    
    this.vmSprintingSpeedIcon = new ViewModel({
      id: "vmSprintingSpeedIcon",
      parent: this,
      localizedToolTip: game.i18n.localize("system.character.attribute.sprintingSpeed.label"),
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

    this.vmStabilityIcon = new ViewModel({
      id: "vmStabilityIcon",
      parent: this,
      localizedToolTip: game.i18n.localize("system.character.stability.stability"),
    }); 
    this.vmStability = new ReadOnlyValueViewModel({
      id: "vmStability",
      parent: this,
      value: this.document.stability,
      localizedToolTip: new RulesetExplainer().getExplanationForStability(this.document),
    });

    if (this.advancementEnabled) {
      this.vmExperiencePointsSymbol = new ViewModel({
        id: "vmExperiencePointsSymbol",
        parent: this,
        localizedToolTip: game.i18n.localize("system.character.advancement.experiencePoint.experiencePoints"),
      });
      this.vmExperiencePoints = new InputNumberSpinnerViewModel({
        id: "vmExperiencePoints",
        parent: this,
        value: this.document.advancement.xp,
        min: 0,
        onChange: (_, newValue) => {
          this.document.advancement.xp = newValue;
        },
      });
    }
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
