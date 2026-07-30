import { DOCUMENT_COLLECTION_SOURCES } from "../../../business/model/document/document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "../../../business/model/document/document-fetcher/document-fetcher.mjs";
import { StringUtil } from "../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import FoundryWrapper from "../../../foundry-interop/foundry-wrapper.mjs";
import { SheetUtil } from "../sheet-utility.mjs";
import DragData from "./drag-data.mjs";

/**
 * Enables drag and drop operations on arbitrary HTML elements. 
 * 
 * On a receiver element, it automatically adds an overlay element with the CSS class 
 * "drag-accept". The receiver element also receives the CSS class "dragover". 
 * If you want to override the styling, you can do so by targeting 
 * `".dragover .drag-accept"` in your CSS. 
 */
export class DragDropHandler {
  /**
   * Returns the default css class that is added on drag over. 
   * 
   * @type {String}
   * @readonly
   */
  static get DRAGOVER_CSS_CLASS() { return "dragover"; }

  /**
   * Global transfer property. To allow for easier data transmission from one DragDropHandler to another. 
   * 
   * @type {Object | null}
   * @static
   * @private
   */
  static #draggedData = null;

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
     * @type {Map<Number, Function<Boolean>>}
     */
    onDragStart: new Map(),
    /**
     * @type {Map<Number, Function<Boolean>>}
     */
    onDragEnd: new Map(),
  };

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
   * To be invoked **once**, by the system during the "ready" phase of system setup. 
   * Handles setting up global event listeners. 
   * @static
   */
  static ready() {
    // world & compendium actors
    DragDropHandler.#registerGlobalListener(".directory-actor");
    // world & compendium items
    DragDropHandler.#registerGlobalListener(".directory-item");
  }

  /**
   * Registers a global dragstart and dragend listener for the given `dragSelector`. 
   * @param {String} dragSelector A CSS selector. E. g. `".directory-item"`
   * @static
   * @private
   */
  static #registerGlobalListener(dragSelector) {
    const foundryDragDrop = new FoundryWrapper.DragDrop({
      dragSelector: dragSelector,
      callbacks: {
        dragstart: async (event) => {
          const sourceElement = $(event.srcElement);
          const id = sourceElement.attr("data-entry-id");
          const document = await new DocumentFetcher().find({
            id: id,
            source: DOCUMENT_COLLECTION_SOURCES.world,
          });
          DragDropHandler.#draggedData = new DragData({
            id: id,
            name: document.name,
            type: document.type,
          });

          for (const [id, handler] of DragDropHandler.#globalListeners.onDragStart) {
            handler(event, DragDropHandler.#draggedData);
          }
        },
        dragend: (event) => {
          for (const [id, handler] of DragDropHandler.#globalListeners.onDragEnd) {
            handler(event);
          }
          DragDropHandler.#draggedData = null;
        }
      },
    });
    foundryDragDrop.bind($("body")[0]);
  }

  /**
   * @param {Object} args 
   * @param {DragData | undefined} args.dragData A data object that represents the element when it is dragged. This will be passed 
   * to the `onReceive` callback of a receiver.
   * 
   * @param {Function | undefined} args.mayReceive Invoked to determine whether the currently dragged data 
   * is applicable. Must return a boolean value. Arguments: 
   * * `data: DragData`
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
    this.dragData = args.dragData;

    this.mayReceive = args.mayReceive ?? (() => true);
    this.onDragStart = args.onDragStart ?? null;
    this.onDragOver = args.onDragOver ?? null;
    this.onDragLeave = args.onDragLeave ?? null;
    this.onReceive = args.onReceive ?? null;
  }

  /**
   * @param {JQuery} element The element for which drag and drop handling is to be registered. 
   */
  activateListeners(element) {
    const jElement = $(element);

    if (!ValidationUtil.isDefined(jElement) || jElement.length === 0) {
      game.strive.logger.logWarn("element must not be null");
      return;
    }

    // Events for when the element is a drag source.

    if (ValidationUtil.isDefined(this.onDragStart)) {
      // Ensure HTML attribute for draggability is set. 
      jElement.attr("draggable", "true");
      jElement.bind("dragstart", (event) => {
        DragDropHandler.#draggedData = this.dragData;

        this.onDragStart(event, this.dragData);

        for (const [id, handler] of DragDropHandler.#globalListeners.onDragStart) {
          handler(event, this.dragData);
        }
      });
    }

    if (ValidationUtil.isDefined(this.onDragEnd)) {
      jElement.bind("dragend", (event) => {
        for (const [id, handler] of DragDropHandler.#globalListeners.onDragEnd) {
          handler(event);
        }
        DragDropHandler.#draggedData = null;
      });
    }

    // Events for when the element is a drag target/receiver.

    if (ValidationUtil.isDefined(this.onDragOver)) {
      jElement.bind("dragover", (event) => {
        if (!this.mayReceive(DragDropHandler.#draggedData)) return;

        jElement.addClass(DragDropHandler.DRAGOVER_CSS_CLASS);
        this.onDragOver(event, DragDropHandler.#draggedData);
      });
    }

    if (ValidationUtil.isDefined(this.onDragLeave)) {
      jElement.bind("dragleave", (event) => {
        if (!this.mayReceive(DragDropHandler.#draggedData)) return;

        jElement.removeClass(DragDropHandler.DRAGOVER_CSS_CLASS);
        this.onDragLeave(event, DragDropHandler.#draggedData);
      });
    }

    if (ValidationUtil.isDefined(this.onReceive)) {
      jElement.bind("drop", async (event) => {
        event.preventDefault(); // Prevent effects of a normal click. 
        if (!this.mayReceive(DragDropHandler.#draggedData)) return;

        await this.onReceive(event, DragDropHandler.#draggedData);

        jElement.removeClass(DragDropHandler.DRAGOVER_CSS_CLASS);
        DragDropHandler.#draggedData = null;
      });
    }

    // React to global drag start and end. 

    this._onDragStartId = DragDropHandler.onDragStart((event, data) => {
      if (!this.mayReceive(data)) return;

      const rect = SheetUtil.getElementRect(jElement);
      const padding = 8;
      jElement.append(`<div class="drag-accept flex flex-center font-size-md" style="width: ${rect.width + padding}px; height: ${rect.height + padding}px;">${StringUtil.getLoca("system.general.dragDrop.accept")}</div>`)
    });
    this._onDragEndId = DragDropHandler.onDragEnd((event) => {
      jElement.find(".drag-accept").remove();
    });
  }

  /**
   * Disposes of any working data.
   * 
   * This is a clean-up operation that should only be called when the instance of this class is no longer needed!
   */
  dispose() {
    DragDropHandler.offDragStart(this._onDragStartId);
    DragDropHandler.offDragEnd(this._onDragEndId);
  }
}
