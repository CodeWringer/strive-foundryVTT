import { common } from "../../common/_module.mjs";

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
  static _draggedData;

  /**
   * @param {Object} args 
   * @param {String | undefined} args.elementId ID of the element to target. 
   * If left undefined, will use the root element of the HTML passed to the `activateListeners` method. 
   * @param {Object | undefined} args.dragData A data object that represents the element when it is dragged. This will be passed 
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
   * * `data: Object` - Arbitrary data object given by the source handler. 
   * @param {Function | undefined} args.onDragOver Async callback that is invoked when an object is dragged 
   * over the element. Arguments:
   * * `data: Object` - Arbitrary data object given by the source handler. 
   * @param {Function | undefined} args.onDragLeave Async callback that is invoked when the dragged object 
   * is moved out of the element. Arguments:
   * * `data: Object` - Arbitrary data object given by the source handler. 
   * @param {Function | undefined} args.onReceive Async callback that is invoked when a dragged object has 
   * been dropped onto the element. Arguments:
   * * `data: Object` - Arbitrary data object given by the source handler. 
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
        DragDropHandler._draggedData = this.dragData;
        this.onDragStart(this.dragData);
      });
      
      element.bind("dragend", (event) => {
        DragDropHandler._draggedData = undefined;
      });
    }
    
    if (this.enableReceiving) {
      element.bind("dragover", (event) => {
        element.addClass(this.dragOverClass);
        this.onDragOver(DragDropHandler._draggedData);
      });

      element.bind("dragleave", (event) => {
        element.removeClass(this.dragOverClass);
        this.onDragLeave(DragDropHandler._draggedData);
      });

      element.bind("drop", async (event) => {
        event.preventDefault(); // Prevent effects of a normal click. 
  
        await this.onReceive(DragDropHandler._draggedData);
        
        element.removeClass(this.dragOverClass);
        DragDropHandler._draggedData = undefined;
      });
    }
  }
}
