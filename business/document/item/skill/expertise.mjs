import PreparedChatData from '../../../../presentation/chat/prepared-chat-data.mjs';
import ExpertiseChatMessageViewModel from '../../../../presentation/sheet/item/expertise/expertise-chat-message-viewmodel.mjs';
import DamageAndType from '../../../ruleset/skill/damage-and-type.mjs';
import { SOUNDS_CONSTANTS } from '../../../../presentation/audio/sounds.mjs';
import { VISIBILITY_MODES } from '../../../../presentation/chat/visibility-modes.mjs';
import { ATTACK_TYPES, AttackType } from '../../../ruleset/skill/attack-types.mjs';
import TransientSkill from './transient-skill.mjs';
import AtReferencer from '../../../referencing/at-referencer.mjs';
import ViewModel from '../../../../presentation/view-model/view-model.mjs';
import { ITEM_TYPES } from '../item-types.mjs';
import { ChatUtil } from '../../../../presentation/chat/chat-utility.mjs';
import { ValidationUtil } from '../../../util/validation-utility.mjs';
import { UuidUtil } from '../../../util/uuid-utility.mjs';
import FoundryWrapper from '../../../../common/foundry-wrapper.mjs';

/**
 * Represents an expertise. 
 * 
 * Is **always** a child object of a skill document. 
 * 
 * @property {TransientSkill} owningDocument The owning document. I. e. a `TransientSkill`. 
 * * Read-only. 
 * @property {String} owningDocumentId UUID of the owning document. 
 * * Read-only. 
 * @property {String} type Returns the content type of this "document". 
 * * Read-only. 
 * @property {String} id UUID of this instance of an expertise. 
 * * Read-only. 
 * @property {Boolean} isCustom If `true`, this expertise was added by a user. 
 * @property {String} name Name of the expertise. 
 * @property {String} img A relative url to an image resource on the server. 
 * @property {String} description 
 * @property {Number} requiredLevel 
 * @property {Number} apCost 
 * @property {Array<DamageAndType>} damage
 * @property {String | Null} condition 
 * @property {Number | Null} distance 
 * @property {String | Null} obstacle 
 * @property {String | Null} opposedBy 
 * @property {AttackType | Null} attackType 
 */
export default class Expertise {
  /**
   * Converts the given `dto` to a `Expertise` instance and 
   * returns it. 
   * 
   * @param {Object} dto 
   * @param {TransientSkill} owningDocument 
   * 
   * @returns {Expertise}
   * 
   * @static
   */
  static fromDto(dto, owningDocument) {
    return new Expertise({
      owningDocument: owningDocument,
      id: dto.id,
      isCustom: dto.isCustom,
      name: dto.name,
      img: dto.img,
      description: dto.description,
      requiredLevel: dto.requiredLevel,
      apCost: dto.apCost,
      damage: dto.damage.map(it => DamageAndType.fromDto(it)),
      condition: dto.condition,
      distance: dto.distance,
      obstacle: dto.obstacle,
      opposedBy: dto.opposedBy,
      attackType: dto.attackType === undefined ? undefined : ATTACK_TYPES[dto.attackType],
    });
  }

  /**
   * Returns the data path of this expertise on its parent. 
   * 
   * @type {String}
   * @private
   * @readonly
   */
  get _pathOnParent() { return `system.abilities.${this.id}`; }

  /**
   * Returns the content type of this "document". 
   * 
   * @type {String}
   * @readonly
   */
  get type() { return ITEM_TYPES.EXPERTISE; }

  /**
   * @type {Boolean}
   */
  get isCustom() { return this._isCustom; }
  set isCustom(value) { 
    this._isCustom = value; 
    this.owningDocument.updateByPath(`${this._pathOnParent}.isCustom`, value);
  }

  /**
   * @type {String}
   */
  get name() { return this._name; }
  set name(value) {
    this._name = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.name`, value);
  }

  /**
   * @type {String}
   */
  get img() { return this._img; }
  set img(value) {
    this._img = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.img`, value);
  }
  
  /**
   * @type {String}
   */
  get description() { return this._description; }
  set description(value) {
    this._description = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.description`, value);
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
   * @type {Number}
   */
  get apCost() { return this._apCost; }
  set apCost(value) {
    this._apCost = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.apCost`, value);
  }
  
  /**
   * @type {Array<DamageAndType>} 
   */
  get damage() { return this._damage; }
  set damage(value) {
    this._damage = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.damage`, value.map(it => it.toDto()));
  }
  
  /**
   * @type {String | null}
   */
  get condition() { return this._condition; }
  set condition(value) {
    this._condition = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.condition`, value);
  }
  
  /**
   * @type {Number | null}
   */
  get distance() { return this._distance; }
  set distance(value) {
    this._distance = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.distance`, value);
  }
  
  /**
   * @type {String | null}
   */
  get obstacle() { return this._obstacle; }
  set obstacle(value) {
    this._obstacle = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.obstacle`, value);
  }
  
  /**
   * @type {String | null}
   */
  get opposedBy() { return this._opposedBy; }
  set opposedBy(value) {
    this._opposedBy = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.opposedBy`, value);
  }
  
  /**
   * @type {AttackType | null}
   */
  get attackType() { return this._attackType; }
  set attackType(value) {
    this._attackType = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.attackType`, value === null ? null : value.name);
  }
  
  /**
   * @param {Object} args 
   * @param {TransientSkill} args.owningDocument The owning document.
   * @param {String | undefined} args.id UUID of this instance of an expertise. 
   * @param {Boolean | undefined} args.isCustom 
   * @param {String | undefined} args.name 
   * @param {String | undefined} args.img 
   * @param {String | undefined} args.description 
   * @param {Number | undefined} args.requiredLevel 
   * @param {Number | undefined} args.apCost 
   * @param {Array<DamageAndType> | undefined} args.damage 
   * @param {String | undefined} args.condition 
   * @param {Number | undefined} args.distance 
   * @param {String | undefined} args.obstacle 
   * @param {String | undefined} args.opposedBy 
   * @param {AttackType | undefined} args.attackType 
   * 
   * @throws {Error} Thrown, if `owningDocument` is undefined. 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["owningDocument"]);
    
    this.owningDocument = args.owningDocument;
    this.owningDocumentId = args.owningDocument.id;
    
    this.id = args.id ?? UuidUtil.createUUID();

    this._isCustom = args.isCustom ?? false;
    this._name = args.name ?? game.i18n.localize("system.character.skill.expertise.newDefaultName");
    this._img = args.img ?? "icons/svg/book.svg";
    this._description = args.description ?? "";
    this._requiredLevel = args.requiredLevel ?? 0;
    this._apCost = args.apCost ?? 0;
    this._damage = args.damage ?? [];
    this._condition = args.condition ?? null;
    this._distance = args.distance ?? null;
    this._obstacle = args.obstacle ?? null;
    this._opposedBy = args.opposedBy ?? null;
    this._attackType = args.attackType ?? null;
  }

  /**
   * Chat message template path. 
   * @type {String}
   * @readonly
   */
  get chatMessageTemplate() { return game.strive.const.TEMPLATES.EXPERTISE_CHAT_MESSAGE; }
  
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
   * In case this is an embedded document, such as an expertise, this value must be supplied 
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
   * @returns {ExpertiseChatMessageViewModel}
   * 
   * @override
   */
  getChatViewModel(overrides = {}) {
    const actor = (this.owningDocument.owningDocument !== undefined) ? 
      this.owningDocument.owningDocument.document : undefined;

    return new ExpertiseChatMessageViewModel({
      id: overrides.id,
      parent: overrides.parent,
      isEditable: overrides.isEditable ?? false,
      isSendable: overrides.isSendable ?? false,
      showParentSkill: overrides.showParentSkill ?? true,
      isOwner: this.owningDocument.isOwner,
      isGM: game.user.isGM,
      expertise: this,
      actor: actor,
    });
  }

  /**
   * Sends this `Expertise` to chat. 
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
   * Deletes this `Expertise`. 
   * 
   * @returns {Boolean} True, if the `Expertise` could be removed. 
   */
  delete() {
    if (this.owningDocument === undefined) return false;

    this.owningDocument.deleteExpertise(this.id);

    return true;
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
        abilities: {
          [this.id]: {}
        }
      }
    };

    for (const propertyName in delta) {
      if (delta.hasOwnProperty(propertyName) !== true) continue;

      dto.system.abilities[this.id][propertyName] = delta[propertyName];
    }

    this.owningDocument.update(dto, render);
  }

  /**
   * Updates a property of this Expertise on the parent item, identified via the given path. 
   * 
   * @param {String} propertyPath Path leading to the property to update, on the Expertise. 
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
   * Deletes a property on the expertise, via the given path. 
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
      index: this.index,
      isCustom: this.isCustom,
      name: this.name,
      img: this.img,
      description: this.description,
      requiredLevel: this.requiredLevel,
      apCost: this.apCost,
      damage: this.damage.map(it => {
        return { damage: it.damage, damageType: it.damageType.name }
      }),
      condition: this.condition,
      distance: this.distance,
      obstacle: this.obstacle,
      attackType: (this.attackType ?? {}).name,
      opposedBy: this.opposedBy,
    };
  }

  /**
   * Returns the property values identified by the `@`-denoted references in the given string, 
   * from this `Expertise`. 
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
