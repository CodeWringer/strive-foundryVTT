import { validateOrThrow } from "../../util/validation-utility.mjs";

/**
 * Represents a grouping of asset slots of a character. 
 * 
 * @property {String} name Name of the group. 
 * @property {String | undefined} localizableName Localization key. 
 * @property {Array<CharacterAssetSlot>} slots The asset slots this group holds. 
 * @property {Number} maxBulk The maximum bulk that all the slots within this 
 * group can hold, in total. 
 * * Read-only. 
 * @property {Number} currentBulk The bulk that all the slots within this group 
 * are currently holding, in total. 
 * * Read-only. 
 */
export default class CharacterAssetSlotGroup {
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
   * @param {String} args.name Name of the group. 
   * @param {String | undefined} args.localizableName Localization key. 
   * @param {Array<CharacterAssetSlot> | undefined} args.slots The asset slots this group holds. 
   */
  constructor(args = {}) {
    validateOrThrow(args, ["name"]);

    this.name = args.name;
    this.localizableName = args.localizableName;
    this.slots = args.slots ?? [];
  }
}