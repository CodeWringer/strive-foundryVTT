import { ValidationUtil } from "../../../common/util/validation-utility.mjs";

/**
 * Data object for drag and drop operations. 
 */
export default class DragData {
  /**
   * @param {Object} args 
   * @param {String} args.type Type of dragged data. Crucial for handlers to 
   * properly make use of the data. 
   * @param {String | undefined} args.id ID of the dragged entity. 
   * @param {String | undefined} args.name Name of the dragged entity. 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["type"]);

    this.type = args.type;
    this.id = args.id;
    this.name = args.name;
  }
}
