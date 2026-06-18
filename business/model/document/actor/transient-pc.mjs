import { ExtenderUtil } from "../../../../common/util/extender-util.mjs"
import { PropertyUtil } from "../../../../common/util/property-utility.mjs"
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs"
import PcActorChatMessageViewModel from "../../../../presentation/sheet/actor/pc/pc-actor-chat-message-viewmodel.mjs"
import AtReferencer from "../../../referencing/at-referencer.mjs"
import Ruleset from "../../../ruleset/ruleset.mjs"
import { ITEM_TYPES } from "../item/item-types.mjs"
import TransientBaseCharacterActor from "./transient-base-character-actor.mjs"

/**
 * Represents the full transient data of a pc. 
 * 
 * @extends TransientBaseCharacterActor
 * 
 * @property {Object} fateSystem
 * * Read-only. 
 * @property {Array<TransientFateCard>} fateSystem.fateCards
 * * Read-only. 
 * @property {Number} fateSystem.maxFateCards The maximum number of fate cards allowed on the actor. 
 * * Read-only. 
 * @property {Number} fateSystem.remainingFateCards The remaining number of fate cards currently 
 * allowed on the actor. 
 * * Read-only. 
 * @property {Number} fateSystem.miFP
 * @property {Number} fateSystem.maFP
 * @property {Number} fateSystem.AFP
 * @property {Object} advancement
 * @property {Boolean} advancement.advancementEnabled
 * * Read-only.
 * @property {Number} advancement.xp
 */
export default class TransientPc extends TransientBaseCharacterActor {
  /**
   * Returns the Chat message template path. 
   * 
   * @type {String}
   * @virtual
   * @readonly
   */
  get chatMessageTemplate() { return PcActorChatMessageViewModel.TEMPLATE; }
  
  /**
   * @type {Object}
   * @readonly
   */
  get fateSystem() {
    const thiz = this;
    
    return {
      get fateCards() { return thiz.items.filter(it => it.type === business.model.const.ITEM_TYPES.FATE_CARD); },
      get maxFateCards() { return new Ruleset().getMaximumFateCards(); },
      get remainingFateCards() { return this.maxFateCards - this.fateCards.length; },

      get miFP() { return thiz.document.system.fateSystem.miFP; },
      set miFP(value) { thiz.updateByPath("system.fateSystem.miFP", value); },

      get maFP() { return thiz.document.system.fateSystem.maFP; },
      set maFP(value) { thiz.updateByPath("system.fateSystem.maFP", value); },

      get AFP() { return thiz.document.system.fateSystem.AFP; },
      set AFP(value) { thiz.updateByPath("system.fateSystem.AFP", value); },
    };
  }

  /**
   * @type {Object}
   * @readonly
   * @override
   */
  get advancement() {
    const thiz = this;
    return {
      /**
       * @type {Boolean}
       * @readonly
       */
      get advancementEnabled() { return true; },
      /**
       * @type {Number}
       */
      get xp() { return PropertyUtil.guaranteeObject(thiz.document.system.advancement).xp ?? 0; },
      set xp(value) { thiz.updateByPath("system.advancement.xp", value); },
    };
  }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new PcActorChatMessageViewModel({
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
   * Tries to resolve the given reference in the embedded documents of 
   * this document. 
   * 
   * Searches in: 
   * * Embedded fate-cards.
   * 
   * This method will be called implicitly, by an `AtReferencer`, when it tries 
   * to resolve a reference on *this* document. 
   * 
   * @param {String} comparableReference A comparable version of a reference. 
   * * Comparable in the sense that underscores "_" are replaced with spaces " " 
   * or only the last piece of a property path is returned. 
   * * E. g. `"@Heavy_Armor"` -> `"@heavy armor"`
   * * E. g. `"@A.B.c"` -> `"a"`
   * @param {String | undefined} propertyPath If not undefined, a property path on 
   * the referenced object. 
   * * E. g. `"@A.B.c"` -> `"B.c"`
   * 
   * @returns {Any | undefined} The matched reference or undefined, 
   * if no match was found. 
   */
  resolveReference(comparableReference, propertyPath) {
    const collectionsToSearch = [
      this.fateSystem.fateCards,
    ];
    const r = new AtReferencer().resolveReferenceInCollections(collectionsToSearch, comparableReference, propertyPath);

    if (ValidationUtil.isDefined(r)) {
      return r;
    } else {
      return super.resolveReference(comparableReference, propertyPath);
    }
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(TransientPc));
  }
}
