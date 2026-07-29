import { common } from "../../../common/_module.mjs";
import DragData from "./drag-data.mjs";

/**
 * Enables drag and drop operations on arbitrary HTML elements. 
 */
export class DragDropHandler {
  /**
   * Returns the default css class that is added on drag over. 
   * 
   * @type {String}
   * @readonly
   */
  static get DEFAULT_DRAGOVER_CSS_CLASS() { return "dragover"; }

  /**
   * Global transfer property. To allow for easier data transmission from one DragDropHandler to another. 
   * 
   * @type {Object | undefined}
   * @static
   * @private
   */
  static #draggedData;

  /**
   * @type {Object}
   * @static
   * @private
   */
  static #globalListeners = {
    /**
     * Internal ID counter for registered events. 
     * @type {Number}
     */
    eventId: 0,
    /**
     * @type {Map<Number, Function<void>>}
     */
    onDragStart: new Map(),
    /**
     * @type {Map<Number, Function<void>>}
     */
    onDragEnd: new Map(),
  };

  /**
   * @param {Object} args 
   * @param {String | undefined} args.elementId ID of the element to target. 
   * If left undefined, will use the root element of the HTML passed to the `activateListeners` method. 
   * @param {DragData | undefined} args.dragData A data object that represents the element when it is dragged. This will be passed 
   * to the `onReceive` callback of a receiver. 
   * @param {Boolean | undefined} args.enableDragging If `true`, allows the element to be dragged. 
   * * default `false`
   * @param {Boolean | undefined} args.enableReceiving If `true`, allows the element to receive other, dragged elements. 
   * * default `false`
   * @param {String | undefined} args.dragOverClass CSS class to automatically add to the element 
   * when something is dragged over it. 
   * * default `"dragover"`
   * 
   * @param {Function | undefined} args.onDragStart Async callback that is invoked when the dragging of 
   * the element begins. Arguments:
   * * `event: Event`
   * * `data: DragData` - Data object given by the source handler. 
   * @param {Function | undefined} args.onDragOver Async callback that is invoked when an object is dragged 
   * over the element. Arguments:
   * * `event: Event`
   * * `data: DragData` - Data object given by the source handler. 
   * @param {Function | undefined} args.onDragLeave Async callback that is invoked when the dragged object 
   * is moved out of the element. Arguments:
   * * `event: Event`
   * * `data: DragData` - Data object given by the source handler. 
   * @param {Function | undefined} args.onReceive Async callback that is invoked when a dragged object has 
   * been dropped onto the element. Arguments:
   * * `event: Event`
   * * `data: DragData` - Data object given by the source handler. 
   */
  constructor(args = {}) {
    this.elementId = args.elementId;
    this.dragData = args.dragData;
    this.enableDragging = args.enableDragging ?? false;
    this.enableReceiving = args.enableReceiving ?? false;
    this.dragOverClass = args.dragOverClass ?? DragDropHandler.DEFAULT_DRAGOVER_CSS_CLASS;

    this.onDragStart = args.onDragStart ?? (async () => {});
    this.onDragOver = args.onDragOver ?? (async () => {});
    this.onDragLeave = args.onDragLeave ?? (async () => {});
    this.onReceive = args.onReceive ?? (async () => {});
  }

  /**
   * Registers the given `handler` function to be invoked when *any* drag operation 
   * begins, globally. 
   * @param {Function<void>} handler Invoked when any global drag event begins. Arguments:
   * * `event: Event`
   * * `data: DragData`
   * @returns {Number} An ID that may be passed to `DragDropHandler.offDragStart` 
   * to unregister the `handler` for cleanup. 
   * @static
   */
  static onDragStart(handler) {
    const newId = DragDropHandler.#globalListeners.eventId++;
    this.#globalListeners.onDragStart.set(newId, handler);
    return newId;
  }
  
  /**
   * Unregisters the drag start event with the given `id`. 
   * @param {Number} id ID of the event to unregister. 
   * @static
   */
  static offDragStart(id) {
    this.#globalListeners.onDragStart.delete(id);
  }

  /**
   * Registers the given `handler` function to be invoked when *any* drag operation 
   * ends, globally. 
   * @param {Function<void>} handler Invoked when any global drag event ends. Arguments:
   * * `event: Event`
   * @returns {Number} An ID that may be passed to `DragDropHandler.offDragEnd` 
   * to unregister the `handler` for cleanup. 
   * @static
   */
  static onDragEnd(handler) {
    const newId = DragDropHandler.#globalListeners.eventId++;
    this.#globalListeners.onDragEnd.set(newId, handler);
    return newId;
  }
  
  /**
   * Unregisters the drag end event with the given `id`. 
   * @param {Number} id ID of the event to unregister. 
   * @static
   */
  static offDragEnd(id) {
    this.#globalListeners.onDragEnd.delete(id);
  }

  /**
   * @param {JQuery} html 
   */
  activateListeners(html) {
    const element = common.util.validation.isDefined(this.elementId) ? html.find(`#${this.elementId}`) : html;

    if (!common.util.validation.isDefined(element) || element.length === 0) {
      game.strive.logger.logWarn(`Failed to find drag drop element '${this.elementId}'`);
      return;
    }

    if (this.enableDragging) {
      // Ensure HTML attribute for draggability is set. 
      element.attr("draggable", "true");
  
      element.bind("dragstart", (event) => {
        DragDropHandler.#draggedData = this.dragData;
        this.onDragStart(event, this.dragData);
        for (const [id, handler] of DragDropHandler.#globalListeners.onDragStart) {
          handler(event, this.dragData);
        }
      });
      
      element.bind("dragend", (event) => {
        DragDropHandler.#draggedData = undefined;
        for (const [id, handler] of DragDropHandler.#globalListeners.onDragEnd) {
          handler(event);
        }
      });
    }
    
    if (this.enableReceiving) {
      element.bind("dragover", (event) => {
        element.addClass(this.dragOverClass);
        this.onDragOver(event, DragDropHandler.#draggedData);
      });

      element.bind("dragleave", (event) => {
        element.removeClass(this.dragOverClass);
        this.onDragLeave(event, DragDropHandler.#draggedData);
      });

      element.bind("drop", async (event) => {
        event.preventDefault(); // Prevent effects of a normal click. 
  
        await this.onReceive(event, DragDropHandler.#draggedData);
        
        element.removeClass(this.dragOverClass);
        DragDropHandler.#draggedData = undefined;
      });
    }
  }
}
