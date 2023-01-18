import { validateOrThrow } from "../../util/validation-utility.mjs";

/**
 * Represents a grouping of asset slots of a character. 
 * 
 * @property {String} name Name of the group. 
 * @property {String | undefined} localizableName Localization key. 
 * @property {Array<CharacterAssetSlot>} slots The asset slots this group holds. 
 */
export default class CharacterAssetSlotGroup {
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