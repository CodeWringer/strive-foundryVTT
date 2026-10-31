import { UuidUtil } from "../../../../common/util/uuid-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import DynamicComponent from "../dynamic-component/dynamic-component.mjs";

/**
 * @property {String} id 
 * @property {Object | undefined} document 
 * @property {DynamicComponent} header 
 * @property {DynamicComponent | undefined} content 
 */
export default class ListItem {
  /**
   * @param {Object} args 
   * @param {DynamicComponent} args.header 
   * @param {Object | undefined} args.document 
   * @param {String | undefined} args.id 
   * @param {DynamicComponent | undefined} args.content 
   * @param {Function<Application> | undefined} args.openSheet When invoked, is expected to create 
   * a new Application that represents the list item, which MUST return the Application instance. 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["header"]);
    this.id = args.id ?? UuidUtil.createUuid();
    this.document = args.document;
    this.header = args.header;
    this.content = args.content;
    this.openSheet = args.openSheet;
  }
}
