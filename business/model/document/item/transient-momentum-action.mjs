import { ExtenderUtil } from "../../../../common/extender-util.mjs"
import FoundryWrapper from "../../../../foundry-interop/foundry-wrapper.mjs"
import { SOUNDS_CONSTANTS } from "../../../../presentation/audio/sounds.mjs"
import PreparedChatData from "../../../../presentation/chat/prepared-chat-data.mjs"
import MomentumActionChatMessageViewModel from "../../../../presentation/sheet/item/momentum-action/momentum-action-chat-message-viewmodel.mjs"
import TransientBaseItem from "./transient-base-item.mjs"

/**
 * @property {String} imgHeroic
 * @property {String} nameHeroic
 * @property {String} descriptionHeroic
 * @property {Number} momentumShiftHeroic
 * 
 * @property {String} imgDesperate
 * @property {String} nameDesperate
 * @property {String} descriptionDesperate
 * @property {Number} momentumShiftDesperate
 * 
 * @extends TransientBaseItem
 */
export default class TransientMomentumAction extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "systems/strive/presentation/image/momentum-action.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return MomentumActionChatMessageViewModel.TEMPLATE; }

  /**
   * @type {String}
   */
  get imgHeroic() {
    return this.document.system.imgHeroic;
  }
  set imgHeroic(value) {
    this.document.system.imgHeroic = value;
    this.updateByPath("system.imgHeroic", value);
  }
  
  /**
   * @type {String}
   */
  get nameHeroic() {
    return this.document.system.nameHeroic;
  }
  set nameHeroic(value) {
    this.document.system.nameHeroic = value;
    this.updateByPath("system.nameHeroic", value);
  }
  
  /**
   * @type {String}
   */
  get descriptionHeroic() {
    return this.document.system.descriptionHeroic;
  }
  set descriptionHeroic(value) {
    this.document.system.descriptionHeroic = value;
    this.updateByPath("system.descriptionHeroic", value);
  }
  
  /**
   * @type {Number}
   */
  get momentumShiftHeroic() {
    return parseInt(this.document.system.momentumShiftHeroic ?? 0);
  }
  set momentumShiftHeroic(value) {
    this.document.system.momentumShiftHeroic = value;
    this.updateByPath("system.momentumShiftHeroic", value);
  }
  
  /**
   * @type {String}
   */
  get imgDesperate() {
    return this.document.system.imgDesperate;
  }
  set imgDesperate(value) {
    this.document.system.imgDesperate = value;
    this.updateByPath("system.imgDesperate", value);
  }
  
  /**
   * @type {String}
   */
  get nameDesperate() {
    return this.document.system.nameDesperate;
  }
  set nameDesperate(value) {
    this.document.system.nameDesperate = value;
    this.updateByPath("system.nameDesperate", value);
  }
  
  /**
   * @type {String}
   */
  get descriptionDesperate() {
    return this.document.system.descriptionDesperate;
  }
  set descriptionDesperate(value) {
    this.document.system.descriptionDesperate = value;
    this.updateByPath("system.descriptionDesperate", value);
  }
  
  /**
   * @type {Number}
   */
  get momentumShiftDesperate() {
    return parseInt(this.document.system.momentumShiftDesperate ?? 0);
  }
  set momentumShiftDesperate(value) {
    this.document.system.momentumShiftDesperate = value;
    this.updateByPath("system.momentumShiftDesperate", value);
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
      flavor: game.i18n.localize("system.combat.momentum.action"),
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
   * @returns {MomentumActionChatMessageViewModel}
   * 
   * @override
   */
  getChatViewModel(overrides = {}) {
    return new MomentumActionChatMessageViewModel({
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
    return super.getExtenders().concat(ExtenderUtil.getExtenders(TransientMomentumAction));
  }
}
