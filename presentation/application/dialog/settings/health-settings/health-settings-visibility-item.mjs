import { common } from "../../../../../common/_module.mjs";

/**
 * Represents a visibility list item. 
 * 
 * @property {String} id Unique ID of this entry. 
 * @property {String} localizedName A localized name for display. 
 * @property {Boolean} value Gets or sets the value. 
 */
export class HealthConditionVisibilityItem {
  /**
   * @param {Object} args 
   * @param {String} args.id Unique ID of this entry. 
   * @param {String} args.localizedName A localized name for display. 
   * @param {Boolean | undefined} args.value The initial value. 
   * * Default `false`
   */
  constructor(args = {}) {
    common.util.validation.validateOrThrow(args, ["id", "localizedName"]);

    this.id = args.id;
    this.localizedName = args.localizedName;
    this.value = args.value ?? false;
  }
}
