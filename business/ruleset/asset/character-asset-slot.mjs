import { createUUID } from "../../util/uuid-utility.mjs";
import { validateOrThrow } from "../../util/validation-utility.mjs";

/**
 * Represents an asset slot of a character. 
 * 
 * @property {TransientBaseCharacterActor} _actor The underlying actor. 
 * * Read-only. 
 * * Private. 
 * @property {CharacterAssetSlotGroup} group The group this slot belongs to. 
 * * Read-only. 
 * @property {String} id Unique ID. 
 * * Read-only. 
 * @property {String | undefined} name A user-definable name. 
 * @property {Array<String>} acceptedTypes An array of asset type names that this 
 * slot may hold. E. g. `["clothing"]`
 * @property {String | null} alottedId If not null, the ID of an asset document 
 * that has been alotted to this slot. 
 * @property {Number} maxBulk The maximum bulk of an asset to accept. 
 * * Default `1`. 
 * @property {TransientAsset | undefined} asset
 */
export default class CharacterAssetSlot {
  get _reference() { return this._actor.document.system.assets.equipment[this.group.id].slots[this.id]; }
  get _path() { return `system.assets.equipment.${this.group.id}.slots.${this.id}`; }

  get name() { return this._reference.name; }
  set name(value) { this._actor.updateByPath(`${this._path}.name`, value); }
  
  get acceptedTypes() { return this._reference.acceptedTypes ?? []; }
  set acceptedTypes(value) { this._actor.updateByPath(`${this._path}.acceptedTypes`, value); }
  
  get alottedId() { return this._reference.alottedId ?? null; }
  set alottedId(value) { this._actor.updateByPath(`${this._path}.alottedId`, value); }
  
  get maxBulk() { return this._reference.maxBulk ?? 1; }
  set maxBulk(value) { this._actor.updateByPath(`${this._path}.maxBulk`, value); }

  get asset() {
    if (this.alottedId === null) {
      return undefined;
    } else {
      return this._actor.assets.equipment.find(it => it.id === this.alottedId);
    }
  }

  /**
   * @param {Object} args
   * @param {CharacterAssetSlotGroup} args.group 
   * @param {String | undefined} args.id Unique ID. 
   */
  constructor(args = {}) {
    validateOrThrow(args, ["group"]);

    this.group = args.group;
    this._actor = this.group.actor;
    this.id = args.id ?? createUUID();
  }
}