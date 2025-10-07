import InjuryChatMessageViewModel from "../../../presentation/sheet/item/injury/injury-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import TransientBaseItem from "./transient-base-item.mjs";
import { INJURY_STATES } from "../../ruleset/health/injury-states.mjs";
import { ExtenderUtil } from "../../../common/extender-util.mjs";
import FoundryWrapper from "../../../common/foundry-wrapper.mjs";
import { ValidationUtil } from "../../util/validation-utility.mjs";

/**
 * Represents the full transient data of an injury. 
 * 
 * @extends TransientBaseItem
 * 
 * @property {String} lastTreatmentTime 
 * @property {String} obstacleTreatment 
 * @property {String} requiredSupplies 
 * @property {String | null} scar 
 * @property {INJURY_STATES} state 
 * @property {Number} timeToHeal Total time to heal, in days. 
 * @property {Number} timeToHealElapsed Elapsed healing days. 
 * @property {String} treatmentSkill Name of the treatment Skill. 
 */
export default class TransientInjury extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/bones.svg"; }

  /** @override */
  get chatMessageTemplate() { return game.strive.const.TEMPLATES.INJURY_CHAT_MESSAGE; }

  /**
   * @type {String}
   */
  get lastTreatmentTime() {
    return this.document.system.lastTreatmentTime;
  }
  set lastTreatmentTime(value) {
    this.document.system.lastTreatmentTime = value;
    this.updateByPath("system.lastTreatmentTime", value);
  }

  /**
   * @type {String}
   */
  get requiredSupplies() {
    return this.document.system.requiredSupplies;
  }
  set requiredSupplies(value) {
    this.document.system.requiredSupplies = value;
    this.updateByPath("system.requiredSupplies", value);
  }

  /**
   * @type {String}
   */
  get obstacleTreatment() {
    return this.document.system.obstacleTreatment;
  }
  set obstacleTreatment(value) {
    this.document.system.obstacleTreatment = value;
    this.updateByPath("system.obstacleTreatment", value);
  }

  /**
   * @type {String | null}
   */
  get scar() {
    const value = this.document.system.scar;
    return ValidationUtil.isDefined(value) ? value : null;
  }
  set scar(value) {
    this.document.system.scar = value;
    this.updateByPath("system.scar", value);
  }

  /**
   * @type {INJURY_STATES}
   */
  get state() {
    return INJURY_STATES[this.document.system.state] ?? INJURY_STATES.active;
  }
  set state(value) {
    this.document.system.state = value;
    this.updateByPath("system.state", value.name);
  }

  /**
   * @type {Number}
   */
  get timeToHeal() {
    return parseInt(this.document.system.timeToHeal ?? 0);
  }
  set timeToHeal(value) {
    this.document.system.timeToHeal = value;
    this.updateByPath("system.timeToHeal", value);
  }

  /**
   * @type {Number}
   */
  get timeToHealElapsed() {
    return parseInt(this.document.system.timeToHealElapsed ?? 0);
  }
  set timeToHealElapsed(value) {
    this.document.system.timeToHealElapsed = value;
    this.updateByPath("system.timeToHealElapsed", value);
  }

  /**
   * @type {String}
   */
  get treatmentSkill() {
    return this.document.system.treatmentSkill;
  }
  /**
   * @param {String} value
   */
  set treatmentSkill(value) {
    this.document.system.treatmentSkill = value;
    this.updateByPath("system.treatmentSkill", value);
  }

  /** @override */
  async getChatData() {
    const vm = this.getChatViewModel();

    const renderedContent = await new FoundryWrapper().renderTemplate(this.chatMessageTemplate, {
      viewModel: vm,
    });

    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: (this.owningDocument ?? {}).document,
      sound: SOUNDS_CONSTANTS.NOTIFY,
      viewModel: vm,
      flavor: game.i18n.localize("system.character.health.injury.singular"),
    });
  }

  /**
   * Returns an instance of a view model for use in a chat message. 
   * 
   * @param {Object | undefined} overrides Optional. An object that allows overriding any of the view model properties. 
   * @param {ViewModel | undefined} overrides.parent A parent view model instance. 
   * In case this is an embedded document, such as an expertise, this value must be supplied 
   * for proper function. 
   * @param {String | undefined} overrides.id
   * * default is a new UUID.
   * @param {Boolean | undefined} overrides.isEditable
   * * default `false`
   * @param {Boolean | undefined} overrides.isSendable
   * * default `false`
   * 
   * @returns {InjuryChatMessageViewModel}
   * 
   * @override
   */
  getChatViewModel(overrides = {}) {
    return new InjuryChatMessageViewModel({
      id: overrides.id,
      parent: overrides.parent,
      isEditable: overrides.isEditable ?? false,
      isSendable: overrides.isSendable ?? false,
      isOwner: this.isOwner,
      isGM: game.user.isGM,
      document: this,
    });
  }

  /**
   * Compares the treatment state of this instance with a given instance and returns a numeric comparison result. 
   * 
   * @param {TransientInjury} other Another instance to compare with. 
   * 
   * @returns {Number} `-1` | `0` | `1`
   * 
   * `-1` means that this entity is less than / smaller than `other`, while `0` means equality and `1` means it 
   * is more than / greater than `other`. 
   */
  compareTreatment(other) {
    if (this.state == INJURY_STATES.active && other.state != INJURY_STATES.active) {
      return -1;
    } else if (this.state == INJURY_STATES.treated && other.state != INJURY_STATES.treated) {
      return 1;
    } else {
      return 0;
    }
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(TransientInjury));
  }
}
