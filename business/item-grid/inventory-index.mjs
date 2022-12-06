/**
 * Represents an item (asset/possession) of an actor, with its 
 * position and size on the grid. 
 * @property {Number} x
 * @property {Number} y
 * @property {Number} w
 * @property {Number} h
 * @property {String} id Id of the item, on the actor. 
 * @property {CONFIG.itemOrientations} Determines rotation of the item. 
 */
export default class InventoryIndex {
  constructor(args = {}) {
    this.x = args.x ?? -1;
    this.y = args.y ?? -1;
    this.w = args.w ?? -1;
    this.h = args.h ?? -1;
    this.id = args.id;
    this.orientation = args.orientation ?? ambersteel.itemOrientations.vertical;
  }
}