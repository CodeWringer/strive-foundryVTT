import PreparedChatData from '../../../../presentation/chat/prepared-chat-data.mjs';
import { SOUNDS_CONSTANTS } from '../../../../presentation/audio/sounds.mjs';
import { VISIBILITY_MODES, VisibilityMode } from '../../../../presentation/chat/visibility-modes.mjs';
import TransientSkill from './transient-skill.mjs';
import AtReferencer from '../../../referencing/at-referencer.mjs';
import ViewModel from '../../../../presentation/view-model/view-model.mjs';
import { ITEM_TYPES } from '../item-types.mjs';
import { ChatUtil } from '../../../../presentation/chat/chat-utility.mjs';
import { ValidationUtil } from '../../../util/validation-utility.mjs';
import { UuidUtil } from '../../../util/uuid-utility.mjs';
import FoundryWrapper from '../../../../common/foundry-wrapper.mjs';
import MomentumActionChatMessageViewModel from '../../../../presentation/sheet/item/momentum-action/momentum-action-chat-message-viewmodel.mjs';
import { PropertyUtil } from '../../../util/property-utility.mjs';

/**
 * Represents a Momentum Action embedded in a Skill document. 
 * 
 * Is **always** a child object of a skill document. 
 * 
 * @property {TransientSkill} owningDocument The owning document. I. e. a `TransientSkill`. 
 * * Read-only. 
 * @property {String} owningDocumentId UUID of the owning document. 
 * * Read-only. 
 * @property {String} type Returns the content type of this "document". 
 * * Read-only. 
 * @property {String} id UUID
 * * Read-only. 
 * @property {Boolean} isCustom
 * @property {Number} requiredLevel
 * 
 * @property {String} imgHeroic
 * @property {String} nameHeroic
 * @property {String} descriptionHeroic
 * @property {Number} momentumShiftHeroic
 * 
 * @property {String} imgDesperate
 * @property {String} nameDesperate
 * @property {String} descriptionDesperate
 * @property {Number} momentumShiftDesperate
 */
export default class SkillMomentumAction {
  /**
   * Converts the given `dto` to a `SkillMomentumAction` instance and 
   * returns it. 
   * 
   * @param {Object} dto 
   * @param {TransientSkill} owningDocument 
   * 
   * @returns {SkillMomentumAction}
   * 
   * @static
   */
  static fromDto(dto, owningDocument) {
    return new SkillMomentumAction({
      owningDocument: owningDocument,
      id: dto.id,
      isCustom: dto.isCustom,
      requiredLevel: dto.requiredLevel,
      imgHeroic: dto.imgHeroic,
      nameHeroic: dto.nameHeroic,
      descriptionHeroic: dto.descriptionHeroic,
      momentumShiftHeroic: dto.momentumShiftHeroic,
      imgDesperate: dto.imgDesperate,
      nameDesperate: dto.nameDesperate,
      descriptionDesperate: dto.descriptionDesperate,
      momentumShiftDesperate: dto.momentumShiftDesperate,
    });
  }

  /**
   * Returns the data path of this Momentum Action on its parent. 
   * 
   * @type {String}
   * @private
   * @readonly
   */
  get _pathOnParent() { return `system.momentumActions.${this.id}`; }

  /**
   * Returns the content type of this "document". 
   * 
   * @type {String}
   * @readonly
   */
  get type() { return ITEM_TYPES.MOMENTUM_ACTION; }

  /**
   * @type {Boolean}
   */
  get isCustom() { return this._isCustom; }
  set isCustom(value) { 
    this._isCustom = value; 
    this.owningDocument.updateByPath(`${this._pathOnParent}.isCustom`, value);
  }

  /**
   * @type {Number}
   */
  get requiredLevel() { return this._requiredLevel; }
  set requiredLevel(value) { 
    this._requiredLevel = value; 
    this.owningDocument.updateByPath(`${this._pathOnParent}.requiredLevel`, value);
  }

  /**
   * @type {String}
   */
  get imgHeroic() { return this._imgHeroic; }
  set imgHeroic(value) {
    this._imgHeroic = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.imgHeroic`, value);
  }

  /**
   * @type {String}
   */
  get nameHeroic() { return this._nameHeroic; }
  set nameHeroic(value) {
    this._nameHeroic = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.nameHeroic`, value);
  }

  /**
   * @type {String}
   */
  get descriptionHeroic() { return this._descriptionHeroic; }
  set descriptionHeroic(value) {
    this._descriptionHeroic = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.descriptionHeroic`, value);
  }

  /**
   * @type {Number}
   */
  get momentumShiftHeroic() { return this._momentumShiftHeroic; }
  set momentumShiftHeroic(value) {
    this._momentumShiftHeroic = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.momentumShiftHeroic`, value);
  }

  /**
   * @type {String}
   */
  get imgDesperate() { return this._imgDesperate; }
  set imgDesperate(value) {
    this._imgDesperate = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.imgDesperate`, value);
  }

  /**
   * @type {String}
   */
  get nameDesperate() { return this._nameDesperate; }
  set nameDesperate(value) {
    this._nameDesperate = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.nameDesperate`, value);
  }

  /**
   * @type {String}
   */
  get descriptionDesperate() { return this._descriptionDesperate; }
  set descriptionDesperate(value) {
    this._descriptionDesperate = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.descriptionDesperate`, value);
  }

  /**
   * @type {Number}
   */
  get momentumShiftDesperate() { return this._momentumShiftDesperate; }
  set momentumShiftDesperate(value) {
    this._momentumShiftDesperate = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.momentumShiftDesperate`, value);
  }

  /**
   * @param {Object} args 
   * @param {TransientSkill} args.owningDocument The owning document.
   * @param {String | undefined} args.id UUID
   * @param {Boolean | undefined} args.isCustom 
   * @param {Number | undefined} args.requiredLevel 
   * 
   * @param {String | undefined} args.imgHeroic
   * @param {String | undefined} args.nameHeroic
   * @param {String | undefined} args.descriptionHeroic
   * @param {Number | undefined} args.momentumShiftHeroic
   * 
   * @param {String | undefined} args.imgDesperate
   * @param {String | undefined} args.nameDesperate
   * @param {String | undefined} args.descriptionDesperate
   * @param {Number | undefined} args.momentumShiftDesperate
   * 
   * @throws {Error} Thrown, if `owningDocument` is undefined. 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["owningDocument"]);
    
    this.owningDocument = args.owningDocument;
    this.owningDocumentId = args.owningDocument.id;
    
    this.id = args.id ?? UuidUtil.createUUID();
    
    this._isCustom = args.isCustom ?? false;
    this._requiredLevel = args.requiredLevel ?? 0;

    this._imgHeroic = args.imgHeroic ?? "";
    this._nameHeroic = args.nameHeroic ?? game.i18n.localize("system.combat.momentum.nameHeroic");
    this._descriptionHeroic = args.descriptionHeroic ?? "";
    this._momentumShiftHeroic = args.momentumShiftHeroic ?? 0;

    this._imgDesperate = args.imgDesperate ?? "";
    this._nameDesperate = args.nameDesperate ?? game.i18n.localize("system.combat.momentum.nameDesperate");
    this._descriptionDesperate = args.descriptionDesperate ?? "";
    this._momentumShiftDesperate = args.momentumShiftDesperate ?? 0;
  }

  /**
   * Chat message template path. 
   * @type {String}
   * @readonly
   */
  get chatMessageTemplate() { return MomentumActionChatMessageViewModel.TEMPLATE; }
  
  /**
   * Base implementation of returning data for a chat message, based on this item. 
   * @returns {PreparedChatData}
   * @virtual
   * @async
   */
  async getChatData() {
    const actor = ((this.owningDocument ?? {}).owningDocument ?? {}).document;
    const vm = this.getChatViewModel();

    const renderedContent = await new FoundryWrapper().renderTemplate(this.chatMessageTemplate, {
      viewModel: vm,
    });

    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: actor, 
      sound: SOUNDS_CONSTANTS.NOTIFY,
      viewModel: vm,
    });
  }

  /**
   * Returns an instance of a view model for use in a chat message. 
   * 
   * @param {Object | undefined} overrides Optional. An object that allows overriding any of the view model properties. 
   * @param {ViewModel | undefined} overrides.parent A parent view model instance. 
   * In case this is an embedded document, this value must be supplied 
   * for proper function. 
   * @param {String | undefined} overrides.id
   * * default is a new UUID.
   * @param {Boolean | undefined} overrides.isEditable
   * * default `false`
   * @param {Boolean | undefined} overrides.isSendable
   * * default `false`
   * @param {Boolean | undefined} overrides.showParentSkill Optional. If true, will show the parent skill name and icon, if possible. 
   * * default `true`
   * 
   * @returns {MomentumActionChatMessageViewModel}
   * 
   * @override
   */
  getChatViewModel(overrides = {}) {
    const actor = (this.owningDocument.owningDocument !== undefined) 
      ? this.owningDocument.owningDocument.document 
      : undefined;

    return new MomentumActionChatMessageViewModel({
      id: overrides.id,
      parent: overrides.parent,
      isEditable: overrides.isEditable ?? false,
      isSendable: overrides.isSendable ?? false,
      showParentSkill: overrides.showParentSkill ?? true,
      isOwner: this.owningDocument.isOwner,
      isGM: game.user.isGM,
      document: this,
      actor: actor,
    });
  }

  /**
   * Sends this instance to chat. 
   * 
   * @param {VisibilityMode} visibilityMode Determines the visibility of the chat message. 
   * 
   * @async
   * @virtual
   */
  async sendToChat(visibilityMode = VISIBILITY_MODES.public) {
    const chatData = await this.getChatData();
    ChatUtil.sendToChat({
      visibilityMode: visibilityMode,
      ...chatData
    });
  }

  /**
   * Deletes this instance. 
   * 
   * @returns {Boolean} True, if the instance could be removed. 
   * 
   * @async
   */
  async delete() {
    if (this.owningDocument === undefined) return false;

    const toRemove = PropertyUtil.getNestedPropertyValue(this._pathOnParent);

    if (ValidationUtil.isDefined(toRemove)) {
      await this.owningDocument.deleteByPath(this._pathOnParent);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Updates the properties of this object, based on the given delta object. 
   * 
   * @param {Object} delta An object containing the properties of this object to update. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   */
  async update(delta, render = true) {
    const dto = {
      system: {
        momentumActions: {
          [this.id]: {}
        }
      }
    };

    for (const propertyName in delta) {
      if (delta.hasOwnProperty(propertyName) !== true) continue;

      dto.system.momentumActions[this.id][propertyName] = delta[propertyName];
    }

    this.owningDocument.update(dto, render);
  }

  /**
   * Updates a property of this instance on the parent item, identified via the given path. 
   * 
   * @param {String} propertyPath Path leading to the property to update. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "system.attributes[0].level"
   * @param {any} newValue The value to assign to the property. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   */
  async updateByPath(propertyPath, newValue, render = true) {
    if (propertyPath.startsWith(this._pathOnParent)) {
      this.owningDocument.updateByPath(propertyPath, newValue, render);
    } else {
      const newPath = `${this._pathOnParent}.${propertyPath}`;
      this.owningDocument.updateByPath(newPath, newValue, render);
    }
  }

  /**
   * Deletes a property, via the given path. 
   * 
   * @param {String} propertyPath Path leading to the property to delete, on the given document entity. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "system.attributes[0].level" 
   *        E.g.: "system.attributes[4]" 
   *        E.g.: "system.attributes" 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   */
  async deleteByPath(propertyPath, render = true) {
    if (propertyPath.startsWith(this._pathOnParent)) {
      this.owningDocument.deleteByPath(propertyPath, render);
    } else {
      const newPath = `${this._pathOnParent}.${propertyPath}`;
      this.owningDocument.deleteByPath(newPath, render);
    }
  }

  /**
   * Returns a data transfer object version of this instance. 
   * 
   * IMPORTANT: To avoid problems with recursion, the `owningDocument` field 
   * **is not and must not** be included!
   * 
   * @returns {Object}
   */
  toDto() {
    return {
      id: this.id,
      owningDocumentId: this.owningDocumentId,
      isCustom: this.isCustom,
      requiredLevel: this.requiredLevel,
      imgHeroic: this.imgHeroic,
      nameHeroic: this.nameHeroic,
      descriptionHeroic: this.descriptionHeroic,
      momentumShiftHeroic: this.momentumShiftHeroic,
      imgDesperate: this.imgDesperate,
      nameDesperate: this.nameDesperate,
      descriptionDesperate: this.descriptionDesperate,
      momentumShiftDesperate: this.momentumShiftDesperate,
    };
  }

  /**
   * Returns the property values identified by the `@`-denoted references in the given string, 
   * from this instance. 
   * 
   * @param {String} str A string containing `@`-denoted references. 
   * * E. g. `"@strength"` or localized and capitalized `"@Stärke"`. 
   * * Abbreviated attribute names are permitted, e. g. `"@wis"` instead of `"@wisdom"`. 
   * * If a reference's name contains spaces, they must be replaced with underscores. 
   * E. g. `"@Heavy_Armor"`, instead of `"@Heavy Armor"`
   * * *Can* contain property paths! E. g. `@a_fate_card.cost.miFP`. 
   * 
   * @returns {Map<String, Any | undefined>} A map of the reference key, including the `@`-symbol, to its resolved reference. 
   * * Only contains unique entries. No reference is included more than once. 
   */
  resolveReferences(str) {
    return new AtReferencer().resolveReferences(str, this);
  }
  
  /**
   * Compares the raw required level of this instance with a given instance and returns a numeric comparison result. 
   * 
   * @param {TransientSkill} other Another instance to compare with. 
   * 
   * @returns {Number} `-1` | `0` | `1`
   * 
   * `-1` means that this entity is less than / smaller than `other`, while `0` means equality and `1` means it 
   * is more than / greater than `other`. 
   */
  compareRequiredLevel(other) {
    if (this.requiredLevel < other.requiredLevel) {
      return -1;
    } else if (this.requiredLevel > other.requiredLevel) {
      return 1;
    } else {
      return 0;
    }
  }
}
