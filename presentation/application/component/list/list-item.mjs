import { UuidUtil } from "../../../../common/util/uuid-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import DynamicComponent from "../dynamic-component/dynamic-component.mjs";

/**
 * @property {DynamicComponent} header 
 * @property {String} id 
 * @property {DynamicComponent | undefined} content 
 */
export default class ListItem {
  /**
   * @param {Object} args 
   * @param {DynamicComponent} args.header 
   * @param {String | undefined} args.id 
   * @param {DynamicComponent | undefined} args.content 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["header"]);
    this.id = args.id ?? UuidUtil.createUuid();
    this.header = args.header;
    this.content = args.content;
  }
}
