import { UuidUtil } from "../../util/uuid-utility.mjs";
import { ValidationUtil } from "../../util/validation-utility.mjs";
import Ruleset from "../ruleset.mjs";

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
 * @property {Number} moddedMaxBulk The modified maximum bulk of an asset to accept. 
 * * Read-only
 * @property {Number} strengthBulkBonus Returns the number of bonus bulk, based on the character's strength. 
 * * Read-only
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
  
  get moddedMaxBulk() {
    return (this._reference.maxBulk ?? 1) + this.strengthBulkBonus;
  }

  get strengthBulkBonus() {
    const ruleset = new Ruleset();
    return ruleset.getAssetSlotBonus(this._actor.document);
  }

  get asset() {
    if (this.alottedId === null) {
      return undefined;
    } else {
      return this._actor.assets.all.find(it => it.id === this.alottedId);
    }
  }

  /**
   * @param {Object} args
   * @param {CharacterAssetSlotGroup} args.group 
   * @param {String | undefined} args.id Unique ID. 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["group"]);

    this.group = args.group;
    this._actor = this.group.actor;
    this.id = args.id ?? UuidUtil.createUUID();
  }

  /**
   * Persists the given data delta to the data base. 
   * 
   * @param {Object} delta 
   * @param {String | undefined} delta.name
   * @param {Array<String> | undefined} delta.acceptedTypes
   * @param {String | undefined} delta.alottedId
   * @param {Number | undefined} delta.maxBulk
   * 
   * @async
   */
  async update(delta = {}) {
    await this._actor.updateByPath(this._path, delta);
  }

  /**
   * Deletes this asset slot from the data base. 
   * 
   * @async
   */
  async delete() {
    await this._actor.deleteByPath(this._path);
  }
}