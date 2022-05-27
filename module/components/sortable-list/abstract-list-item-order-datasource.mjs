/**
 * This abstract data source defines the contract to retrieve and store the orders 
 * of the list items of a {SortableList}. 
 * @abstract
 */
export class AbstractListItemOrderDataSource {

  /**
   * Returns a list of list item IDs. 
   * @returns {Array<String>}
   * @abstract
   */
  getAll() { throw new Error("NotImplementedException"); }

  /**
   * Stores a list of list item IDs. 
   * @param {Array<String>}
   * @param {Boolean | undefined} render 
   * @abstract
   */
  setAll(idList, render = true) { throw new Error("NotImplementedException"); }
}
