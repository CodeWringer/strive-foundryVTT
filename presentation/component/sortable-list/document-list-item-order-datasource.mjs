import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { AbstractListItemOrderDataSource } from "./abstract-list-item-order-datasource.mjs";

/**
 * Uses a document (actor, item, etc.) as a data source for list item ordering. 
 * 
 * @property {TransientDocument} args.document The document to read from and write to. 
 * @property {String} args.listName Name of the list whose orders are to be read/written. 
 */
export default class DocumentListItemOrderDataSource extends AbstractListItemOrderDataSource {
  /**
   * @param {TransientDocument} args.document The document to read from and write to. 
   * @param {String} args.listName Name of the list whose orders are to be read/written. E. g. "skills"
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document", "listName"]);

    this.document = args.document;
    this.listName = args.listName;
  }

  /** @override */
  getAll() {
    try {
      return this.document.displayOrders[listName];
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
    const parent = this.document.owningDocument;
    if (parent !== null && parent !== undefined) {
      const existsOnParent = parent.items.find(it => it === this.document.id) !== undefined;
      if (existsOnParent !== true) return;
    }

    const newDisplayOrders = {
      ...this.document.displayOrders
    }
    newDisplayOrders[listName] = idList;

    this.document.displayOrders = newDisplayOrders;
  }
}

