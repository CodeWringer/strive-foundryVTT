import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { AbstractListItemOrderDataSource } from "./abstract-list-item-order-datasource.mjs";

/**
 * Uses a document (actor, item, etc.) as a data source for list item ordering. 
 * 
 * @property {TransientDocument} document The document to read from and write to. 
 * @property {String} listName Name of the list whose orders are to be read/written. 
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
    return this.document.displayOrders[this.listName] ?? [];
  }

  /** @override */
  setAll(idList, render = true) {
    // Prevent trying to persist the list item orders, if the property owner doesn't exist in the 
    // items map of its parent. 
    // This handles a case whereby an item is deleted from the parent (e. g. a "skill"). In such a case, 
    // the list item orders can no longer be persisted. 
    const parent = this.document.owningDocument;
    if (parent !== null && parent !== undefined) {
      const itemOnParent = parent.items.find(it => it.id === this.document.id);
      const isMissingOnParent = itemOnParent === undefined;
      if (isMissingOnParent === true) return;
    }

    const newDisplayOrders = {
      ...this.document.displayOrders
    }
    newDisplayOrders[this.listName] = idList;

    // This cannot use the setter of the display orders, as that would always cause an 
    // immediate and unnecessary re-render. 
    // Using `updateByPath` allows optionally not re-rendering the sheet. 
    this.document.updateByPath("system.displayOrders", newDisplayOrders, render);
  }
}

