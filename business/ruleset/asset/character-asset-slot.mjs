import { createUUID } from "../../util/uuid-utility.mjs";
import { validateOrThrow } from "../../util/validation-utility.mjs";

/**
 * Represents an asset slot of a character. 
 * 
 * @property {AmbersteelActor} actor The underlying actor. 
 * * Read-only. 
 * @property {String} id Unique ID. 
 * * Read-only. 
 * @property {String | undefined} name A user-definable name. 
 * @property {String | undefined} localizableName Localization key. 
 * @property {Array<String>} acceptedTypes An array of asset type names that this 
 * slot may hold. E. g. `["clothing"]`
 * @property {String | null} alottedId If not null, the ID of an asset document 
 * that has been alotted to this slot. 
 * @property {Number} maxBulk The maximum bulk of an asset to accept. 
 * * Default `1`. 
 * @property {TransientAsset | undefined} asset
 */
export default class CharacterAssetSlot {
  get name() { return this._actor.system.assets.equipped[this.id].name; }
  set name(value) { this._actor.updateByPath(`system.assets.equipped.${this.id}.name`, value); }
  
  get localizableName() { return this._actor.system.assets.equipped[this.id].localizableName; }
  set localizableName(value) { this._actor.updateByPath(`system.assets.equipped.${this.id}.localizableName`, value); }
  
  get acceptedTypes() { return this._actor.system.assets.equipped[this.id].acceptedTypes; }
  set acceptedTypes(value) { this._actor.updateByPath(`system.assets.equipped.${this.id}.acceptedTypes`, value); }
  
  get alottedId() { return this._actor.system.assets.equipped[this.id].alottedId ?? null; }
  set alottedId(value) { this._actor.updateByPath(`system.assets.equipped.${this.id}.alottedId`, value); }
  
  get maxBulk() { return this._actor.system.assets.equipped[this.id].maxBulk ?? 1; }
  set maxBulk(value) { this._actor.updateByPath(`system.assets.equipped.${this.id}.maxBulk`, value); }

  get actor() { return this._actor; }

  get asset() {
    if (this.alottedId === null) {
      return undefined;
    } else {
      return this.actor.getTransientObject().assets.equipped.find(it => it.id === this.alottedId);
    }
  }

  /**
   * @param {Object} args
   * @param {AmbersteelActor} actor 
   * @param {String | undefined} args.id Unique ID. 
   */
  constructor(args = {}) {
    validateOrThrow(args, ["actor"]);

    this._actor = args.actor;
    this.id = args.id ?? createUUID();
  }
}