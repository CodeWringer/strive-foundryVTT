import { getNestedPropertyValue } from "../../utils/property-utility.mjs";
import { AbstractListItemOrderDataSource } from "./abstract-list-item-order-datasource.mjs";
import { validateOrThrow } from "../../utils/validation-utility.mjs";

/**
 * Uses a document (actor, item, etc.) as a data source for list item ordering. 
 * 
 * @property {Document} args.propertyOwner The document to read from and write to. 
 * @property {String} args.listName Name of the list whose orders are to be read/written. 
 */
export default class DocumentListItemOrderDataSource extends AbstractListItemOrderDataSource {
  get propertyPath() { return `data.data.displayOrders.${this.listName}` }

  /**
   * @param {Document} args.propertyOwner The document to read from and write to. 
   * @param {String} args.listName Name of the list whose orders are to be read/written. E. g. "skills"
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyOwner", "listName"]);

    this.propertyOwner = args.propertyOwner;
    this.listName = args.listName;
  }

  /** @override */
  getAll() {
    try {
      return getNestedPropertyValue(this.propertyOwner, this.propertyPath);
    } catch (error) {
      return [];
    }
  }

  /** @override */
  setAll(idList, render = true) {
    // Prevent trying to persist the list item orders, if the property owner doesn't exist in the 
    // items map of its parent. 
    // This handles a case whereby an item is deleted from the parent (e. g. a "skill"). In such a case, 
    // the list item orders can no longer be persisted. 
    const parent = this.propertyOwner.parent;
    if (parent !== null && parent !== undefined) {
      const existsOnParent = parent.items.get(this.propertyOwner.id) !== undefined;
      if (existsOnParent !== true) return;
    }

    this.propertyOwner.updateProperty(this.propertyPath, idList, render);
  }
}

