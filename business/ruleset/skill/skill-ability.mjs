import { TEMPLATES } from '../../../presentation/templatePreloader.mjs';
import * as ChatUtil from '../../../presentation/chat/chat-utility.mjs';
import { validateOrThrow } from '../../util/validation-utility.mjs';
import PreparedChatData from '../../../presentation/chat/prepared-chat-data.mjs';
import SkillAbilityChatMessageViewModel from '../../../presentation/sheet/item/skill-ability/skill-ability-chat-message-viewmodel.mjs';
import { createUUID } from '../../util/uuid-utility.mjs';
import DamageAndType from './damage-and-type.mjs';
import { SOUNDS_CONSTANTS } from '../../../presentation/audio/sounds.mjs';
import { VISIBILITY_MODES } from '../../../presentation/chat/visibility-modes.mjs';
import { isObject } from '../../util/validation-utility.mjs';
import { DAMAGE_TYPES } from '../damage-types.mjs';
import { getNestedPropertyValue } from '../../util/property-utility.mjs';

/**
 * Represents a skill ability. 
 * 
 * Is **always** a child object of a skill document. 
 * 
 * @property {TransientSkill} owningDocument The owning document. I. e. a `TransientSkill`. 
 * * Read-only. 
 * @property {String} owningDocumentId UUID of the owning document. 
 * * Read-only. 
 * @property {String} type Returns the content type of this "document". 
 * * Read-only. 
 * @property {String} id UUID of this instance of a skill ability. 
 * * Read-only. 
 * @property {Boolean} isCustom If `true`, this skill ability was added by a user. 
 * @property {String} name Name of the skill ability. 
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
export default class SkillAbility {
  /**
   * Returns the data path of this skill ability on its parent. 
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
  get type() { return "skill-ability"; }

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
  get damage() { return this._damage.map(it => {
    const thiz = this;
    return {
      get damage() { return it.damage; },
      set damage(value) {
        it.damage = value;
        const damageToPersist = thiz.damage.map(it => {
          return { damage: it.damage, damageType: it.damageType.name }
        });
        thiz.owningDocument.updateByPath(`${thiz._pathOnParent}.damage`, damageToPersist);
      },

      get damageType() { return it.damageType; },
      set damageType(value) {
        if (isObject(value)) {
          it.damageType = value; 
        } else {
          it.damageType = DAMAGE_TYPES[value]; 
        }
        const damageToPersist = thiz.damage.map(it => {
          return { damage: it.damage, damageType: it.damageType.name }
        });
        thiz.owningDocument.updateByPath(`${thiz._pathOnParent}.damage`, damageToPersist);
      },
    }
  }); }
  set damage(value) {
    this._damage = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.damage`, value);
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
   * @type {AttackType | String | null}
   */
  get attackType() { return this._attackType; }
  set attackType(value) {
    this._attackType = value;
    this.owningDocument.updateByPath(`${this._pathOnParent}.attackType`, value === null ? value : (value.name ?? value));
  }
  
  /**
   * @param {Object} args 
   * @param {TransientSkill} args.owningDocument The owning document.
   * @param {String | undefined} args.id UUID of this instance of a skill ability. 
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
    validateOrThrow(args, ["owningDocument"]);
    
    this.owningDocument = args.owningDocument;
    this.owningDocumentId = args.owningDocument.id;
    
    this.id = args.id ?? createUUID();

    this._isCustom = args.isCustom ?? false;
    this._name = args.name ?? game.i18n.localize("ambersteel.character.skill.ability.newDefaultName");
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
  get chatMessageTemplate() { return TEMPLATES.SKILL_ABILITY_CHAT_MESSAGE; }
  
  /**
   * Base implementation of returning data for a chat message, based on this item. 
   * @returns {PreparedChatData}
   * @virtual
   * @async
   */
  async getChatData() {
    const actor = ((this.owningDocument ?? {}).owningDocument ?? {}).document;
    const vm = this.getChatViewModel();

    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
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
   * @param {String | undefined} overrides.id
   * @param {Boolean | undefined} overrides.isEditable
   * @param {Boolean | undefined} overrides.isSendable
   * @param {Boolean | undefined} overrides.isOwner
   * @param {Boolean | undefined} overrides.isGM
   * @param {Boolean | undefined} overrides.showParentSkill Optional. If true, will show the parent skill name and icon, if possible. 
   * * Default `true`
   * 
   * @returns {SkillAbilityChatMessageViewModel}
   * 
   * @virtual
   */
  getChatViewModel(overrides = {}) {
    const actor = (this.owningDocument.owningDocument !== undefined) ? 
      this.owningDocument.owningDocument.document : undefined;

    return new SkillAbilityChatMessageViewModel({
      id: `${this.id}-${createUUID()}`,
      isEditable: false,
      isSendable: false,
      isOwner: this.owningDocument.isOwner,
      isGM: game.user.isGM,
      ...overrides,
      skillAbility: this,
      actor: actor,
    });
  }

  /**
   * Sends this `SkillAbility` to chat. 
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
   * Deletes this `SkillAbility`. 
   * 
   * @returns {Boolean} True, if the `SkillAbility` could be removed. 
   */
  delete() {
    if (this.owningDocument === undefined) return false;

    this.owningDocument.deleteSkillAbility(this.id);

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
   * Updates a property of this SkillAbility on the parent item, identified via the given path. 
   * 
   * @param {String} propertyPath Path leading to the property to update, on the SkillAbility. 
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
   * Deletes a property on the skill ability, via the given path. 
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
   * Tries to return a match for the given reference. 
   * 
   * @param {String} reference A reference to resolve. 
   * * E. g. `"@heavy_armor"`
   * * Can contain property paths. E. g. `"a.b.c"`
   * @param {String} comparableReference A comparable version of the reference. 
   * * Comparable in the sense that underscores "_" are replaced with spaces " " 
   * or only the last piece of a property path is returned. 
   * * E. g. `"@Heavy_Armor"` -> `"@heavy armor"`
   * * E. g. `"@A.B.c"` -> `"a"`
   * @param {String | undefined} propertyPath If not undefined, a property path on 
   * the referenced object. 
   * * E. g. `"@A.B.c"` -> `"B.c"`
   * 
   * @returns {Any | undefined} The matched reference or undefined, no match was found. 
   * 
   * @virtual
   * @protected
   */
  _resolveReference(reference, comparableReference, propertyPath) {
    if (this.name.toLowerCase() !== comparableReference) {
      return undefined;
    } else if (propertyPath === undefined) {
      return this;
    }

    // Look in own properties. 
    try {
      return getNestedPropertyValue(this, propertyPath);
    } catch (error) {
      if (error.message.startsWith("Failed to get nested property value")) {
        // Such errors are expected for "bad" property paths and can be ignored safely. 
        game.ambersteel.logger.logWarn(error.message);
      } else {
        // Any other error is re-thrown. 
        throw error;
      }
    }
    return undefined;
  }
}
