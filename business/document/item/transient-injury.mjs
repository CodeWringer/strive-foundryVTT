import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import InjuryChatMessageViewModel from "../../../presentation/sheet/item/injury/injury-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";
import { createUUID } from "../../util/uuid-utility.mjs";

/**
 * Represents the full transient data of an injury. 
 * 
 * @extends TransientBaseItem
 * 
 * @property {String} state
 * @property {String} timeToHeal
 * @property {String} timeToHealTreated
 * @property {String} limit 
 * @property {String} scar 
 * @property {String} selfPatchUp 
 * @property {String} treatmentSkill 
 * @property {String} requiredSupplies 
 * @property {String} obstaclePatchUp 
 * @property {String} obstacleTreatment 
 */
export default class TransientInjury extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/bones.svg"; }

  /** @override */
  get chatMessageTemplate() { return TEMPLATES.INJURY_CHAT_MESSAGE; }

  /**
   * @type {String}
   */
  get state() {
    return this.document.system.state;
  }
  set state(value) {
    this.document.system.state = value;
    this.updateByPath("system.state", value);
  }
  
  /**
   * @type {String}
   */
  get timeToHeal() {
    return this.document.system.timeToHeal;
  }
  set timeToHeal(value) {
    this.document.system.timeToHeal = value;
    this.updateByPath("system.timeToHeal", value);
  }
  
  /**
   * @type {String}
   */
  get limit() {
    return this.document.system.limit;
  }
  /**
   * @param {String} value
   */
  set limit(value) {
    this.document.system.limit = value;
    this.updateByPath("system.limit", value);
  }
  
  /**
   * @type {String}
   */
  get scar() {
    return this.document.system.scar;
  }
  /**
   * @param {String} value
   */
  set scar(value) {
    this.document.system.scar = value;
    this.updateByPath("system.scar", value);
  }
  
  /**
   * @type {String}
   */
  get timeToHealTreated() {
    return this.document.system.timeToHealTreated;
  }
  /**
   * @param {String} value
   */
  set timeToHealTreated(value) {
    this.document.system.timeToHealTreated = value;
    this.updateByPath("system.timeToHealTreated", value);
  }
  
  /**
   * @type {String}
   */
  get selfPatchUp() {
    return this.document.system.selfPatchUp;
  }
  /**
   * @param {String} value
   */
  set selfPatchUp(value) {
    this.document.system.selfPatchUp = value;
    this.updateByPath("system.selfPatchUp", value);
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
  
  /**
   * @type {String}
   */
  get requiredSupplies() {
    return this.document.system.requiredSupplies;
  }
  /**
   * @param {String} value
   */
  set requiredSupplies(value) {
    this.document.system.requiredSupplies = value;
    this.updateByPath("system.requiredSupplies", value);
  }
  
  /**
   * @type {String}
   */
  get obstaclePatchUp() {
    return this.document.system.obstaclePatchUp;
  }
  /**
   * @param {String} value
   */
  set obstaclePatchUp(value) {
    this.document.system.obstaclePatchUp = value;
    this.updateByPath("system.obstaclePatchUp", value);
  }
  
  /**
   * @type {String}
   */
  get obstacleTreatment() {
    return this.document.system.obstacleTreatment;
  }
  /**
   * @param {String} value
   */
  set obstacleTreatment(value) {
    this.document.system.obstacleTreatment = value;
    this.updateByPath("system.obstacleTreatment", value);
  }
  
  /** @override */
  async getChatData() {
    const vm = this.getChatViewModel();

    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      viewModel: vm,
    });

    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: (this.owningDocument ?? {}).document, 
      sound: SOUNDS_CONSTANTS.NOTIFY,
      viewModel: vm,
      flavor: game.i18n.localize("ambersteel.character.health.injury.singular"),
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
}

ITEM_SUBTYPE.set("injury", (document) => { return new TransientInjury(document) });
