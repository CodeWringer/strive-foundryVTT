import { ExtenderUtil } from "../../../../common/util/extender-util.mjs"
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs"
import FoundryWrapper from "../../../../foundry-interop/foundry-wrapper.mjs"
import { SOUNDS_CONSTANTS } from "../../../../presentation/audio/sounds.mjs"
import PreparedChatData from "../../../../presentation/chat/prepared-chat-data.mjs"
import ProjectChatMessageViewModel from "../../../../presentation/sheet/item/project/project-chat-message-viewmodel.mjs"
import TransientBaseItem from "./transient-base-item.mjs"

/**
 * @property {Array<String> | null} complications
 * @property {Number} progress
 * @property {Number} progressIncrement
 * @property {String | null} projectSkill
 * @property {Number} pushes
 * @property {Number} quality
 * @property {String} timeIncrement
 * @property {Number} totalProgress
 * 
 * @extends TransientBaseItem
 */
export default class TransientProject extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/book.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return ProjectChatMessageViewModel.TEMPLATE; }

  /**
   * @type {Array<String> | null}
   */
  get complications() {
    return this.document.system.complications;
  }
  set complications(value) {
    const newValue = (ValidationUtil.isDefined(value) && value.length > 0) ? value : null;
    this.document.system.complications = newValue;
    this.updateByPath("system.complications", newValue);
  }

  /**
   * @type {Number}
   */
  get progress() {
    return parseInt(this.document.system.progress);
  }
  set progress(value) {
    this.document.system.progress = value;
    this.updateByPath("system.progress", value);
  }
  
  /**
   * @type {Number}
   */
  get progressIncrement() {
    return parseInt(this.document.system.progressIncrement);
  }
  set progressIncrement(value) {
    this.document.system.progressIncrement = value;
    this.updateByPath("system.progressIncrement", value);
  }
  
  /**
   * @type {String | null}
  */
 get projectSkill() {
   return this.document.system.projectSkill;
  }
  set projectSkill(value) {
    const newValue = (ValidationUtil.isDefined(value) && value.length > 0) ? value : null;
    this.document.system.projectSkill = newValue;
    this.updateByPath("system.projectSkill", newValue);
  }
  
  /**
   * @type {Number}
   */
  get pushes() {
    return parseInt(this.document.system.pushes);
  }
  set pushes(value) {
    this.document.system.pushes = value;
    this.updateByPath("system.pushes", value);
  }
  
  /**
   * @type {Number}
   */
  get quality() {
    return parseInt(this.document.system.quality);
  }
  set quality(value) {
    this.document.system.quality = value;
    this.updateByPath("system.quality", value);
  }
  
  /**
   * @type {String}
  */
 get timeIncrement() {
   return this.document.system.timeIncrement;
  }
  set timeIncrement(value) {
    this.document.system.timeIncrement = value;
    this.updateByPath("system.timeIncrement", value);
  }
  
  /**
   * @type {Number}
   */
  get totalProgress() {
    return parseInt(this.document.system.totalProgress);
  }
  set totalProgress(value) {
    this.document.system.totalProgress = value;
    this.updateByPath("system.totalProgress", value);
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
      flavor: game.i18n.localize("system.project.project"),
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
   * @returns {ProjectChatMessageViewModel}
   * 
   * @override
   */
  getChatViewModel(overrides = {}) {
    return new ProjectChatMessageViewModel({
      id: overrides.id,
      parent: overrides.parent,
      isEditable: overrides.isEditable ?? false,
      isSendable: overrides.isSendable ?? false,
      isOwner: this.isOwner,
      isGM: game.user.isGM,
      document: this,
    });
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(TransientProject));
  }
}