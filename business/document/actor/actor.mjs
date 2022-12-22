import { ACTOR_SUBTYPE } from './actor-subtype.mjs';
import TransientNpc from "./transient-npc.mjs";
import TransientPc from "./transient-pc.mjs";
import TransientPlainActor from "./transient-plain-actor.mjs";

/**
 * @summary
 * This class represents FoundryVTT's `Actor` document type. 
 * 
 * @description
 * In truth, this class only serves as a "data source" and should never be worked with 
 * directly. Instead, an instance of `TransientBaseActor` should be fetched via the 
 * `getTransientObject`-method and used instead. 
 * 
 * @see TransientBaseActor
 */
export class AmbersteelActor extends Actor {
  /**
   * Returns the default icon image path for this type of actor. 
   * @type {String}
   * @virtual
   * @readonly
   */
  get defaultImg() { return this.getTransientObject().defaultImg; }

  /**
   * Chat message template path. 
   * @type {String}
   * @readonly
   */
  get chatMessageTemplate() { return this.getTransientObject().chatMessageTemplate; }

  /** @override */
  prepareData() {
    super.prepareData();

    this.getTransientObject().prepareData(this);
  }

  /**
   * Returns an instance of a specific type of transient object for this actor. 
   * 
   * @returns {TransientBaseActor}
   */
  getTransientObject() {
    if (this._transientObject === undefined) {
      const factoryFunction = ACTOR_SUBTYPE.get(this.type);
      
      if (factoryFunction === undefined) {
        throw new Error(`InvalidTypeException: Actor subtype ${this.type} is unrecognized!`);
      }

      this._transientObject = factoryFunction(this);
    }
    return this._transientObject;
  }
}