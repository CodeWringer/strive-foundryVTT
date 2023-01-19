import { createUUID } from "../../util/uuid-utility.mjs";
import { validateOrThrow } from "../../util/validation-utility.mjs";
import CharacterAssetSlot from "./character-asset-slot.mjs";

/**
 * Represents a grouping of asset slots of a character. 
 * 
 * @property {TransientBaseCharacterActor} actor The underlying actor. 
 * * Read-only. 
 * @property {String} id Unique ID. 
 * * Read-only. 
 * @property {String | undefined} name Name of the group. 
 * @property {Array<CharacterAssetSlot>} slots The asset slots this group holds. 
 * @property {Number} maxBulk The maximum bulk that all the slots within this 
 * group can hold, in total. 
 * * Read-only. 
 * @property {Number} currentBulk The bulk that all the slots within this group 
 * are currently holding, in total. 
 * * Read-only. 
 */
export default class CharacterAssetSlotGroup {
  get _reference() { return this.actor.document.system.assets.equipment[this.id]; }
  get _path() { return `system.assets.equipment.${this.id}`; }

  get name() { return this._reference.name; }
  set name(value) { this.actor.updateByPath(`${this._path}.name`, value); }

  get slots() {
    const slots = this._reference.slots;
    const result = [];
    for (const slotId in slots) {
      if (slots.hasOwnProperty(slotId) !== true) continue;

      result.push(new CharacterAssetSlot({
        id: slotId,
        group: this,
      }));
    }
    return result;
  }
  set slots(value) {
    const delta = {};
    for (const slot of value) {
      delta[slot.id] = {
        name: slot.name,
        acceptedTypes: slot.acceptedTypes,
        alottedId: slot.alottedId,
        maxBulk: slot.maxBulk,
      };
    }

    this.actor.updateByPath(`${this._path}.slots`, delta);
  }

  get maxBulk() {
    let result = 0;
    for (const slot of this.slots) {
      result += slot.maxBulk;
    }
    return result;
  }

  get currentBulk() {
    let result = 0;
    for (const slot of this.slots) {
      if (slot.asset !== undefined) {
        result += slot.asset.bulk;
      }
    }
    return result;
  }

  /**
   * @param {Object} args
   * @param {TransientBaseCharacterActor} args.actor 
   * @param {String | undefined} args.id Unique ID. 
   */
  constructor(args = {}) {
    validateOrThrow(args, ["actor"]);

    this.actor = args.actor;
    this.id = args.id ?? createUUID();
  }
}