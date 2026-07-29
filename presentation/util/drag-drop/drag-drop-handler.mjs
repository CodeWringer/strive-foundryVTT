import { DOCUMENT_COLLECTION_SOURCES } from "../../../business/model/document/document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "../../../business/model/document/document-fetcher/document-fetcher.mjs";
import { common } from "../../../common/_module.mjs";
import { ArrayUtil } from "../../../common/util/array-utility.mjs";
import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import FoundryWrapper from "../../../foundry-interop/foundry-wrapper.mjs";
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
     * The object is expected to have the properties:
     * * `handler: Function<void>`
     * * `acceptedTypes: Array<String>`
     * @type {Map<Number, Object>}
     */
    onDragStart: new Map(),
    /**
     * The object is expected to have the properties:
     * * `handler: Function<void>`
     * * `acceptedTypes: Array<String>`
     * @type {Map<Number, Object>}
     */
    onDragEnd: new Map(),
  };

  /**
   * Registers the given `handler` function to be invoked when *any* drag operation 
   * begins, globally. 
   * @param {Function<void>} handler Invoked when any global drag event begins. Arguments:
   * * `event: Event`
   * * `data: DragData`
   * @param {Array<String>} acceptedTypes A list of accepted reference types. 
   * Only those provided will receive events. If left empty, allows all types. 
   * E. g. `[ITEM_TYPES.skill]` 
   * @returns {Number} An ID that may be passed to `DragDropHandler.offDragStart` 
   * to unregister the `handler` for cleanup. 
   * @static
   */
  static onDragStart(handler, acceptedTypes = []) {
    const newId = DragDropHandler.#globalListeners.eventId++;
    this.#globalListeners.onDragStart.set(newId, {
      handler: handler,
      acceptedTypes: acceptedTypes,
    });
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
   * @param {Array<String>} acceptedTypes A list of accepted reference types. 
   * Only those provided will receive events. If left empty, allows all types. 
   * E. g. `[ITEM_TYPES.skill]` 
   * @returns {Number} An ID that may be passed to `DragDropHandler.offDragEnd` 
   * to unregister the `handler` for cleanup. 
   * @static
   */
  static onDragEnd(handler, acceptedTypes = []) {
    const newId = DragDropHandler.#globalListeners.eventId++;
    this.#globalListeners.onDragEnd.set(newId, {
      handler: handler,
      acceptedTypes: acceptedTypes,
    });
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

          for (const [id, obj] of DragDropHandler.#globalListeners.onDragStart) {
            if (obj.acceptedTypes.length > 0 && !ArrayUtil.arrayContains(obj.acceptedTypes, (DragDropHandler.#draggedData ?? {}).type)) continue;

            obj.handler(event, DragDropHandler.#draggedData);
          }
        },
        dragend: (event) => {
          for (const [id, obj] of DragDropHandler.#globalListeners.onDragEnd) {
            if (obj.acceptedTypes.length > 0 && !ArrayUtil.arrayContains(obj.acceptedTypes, (DragDropHandler.#draggedData ?? {}).type)) continue;

            obj.handler(event);
          }
          DragDropHandler.#draggedData = null;
        }
      },
    });
    foundryDragDrop.bind($("body")[0]);
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.elementId ID of the element to target. 
   * If left undefined, will use the root element of the HTML passed to the `activateListeners` method. 
   * @param {DragData | undefined} args.dragData A data object that represents the element when it is dragged. This will be passed 
   * to the `onReceive` callback of a receiver.
   * @param {Array<String> | undefined} args.acceptedTypes A list of accepted reference types. 
   * Only those provided will receive events. If left empty, allows all types. 
   * E. g. `[ITEM_TYPES.skill]` 
   * @param {String | undefined} args.dragOverClass CSS class to automatically add to the element 
   * when something is dragged over it. 
   * * default `"dragover"`
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
    this.elementId = args.elementId;
    this.dragData = args.dragData;
    this.acceptedTypes = args.acceptedTypes ?? [];
    this.dragOverClass = args.dragOverClass ?? DragDropHandler.DEFAULT_DRAGOVER_CSS_CLASS;

    this.mayReceive = args.mayApply ?? (() => true);
    this.onDragStart = args.onDragStart ?? null;
    this.onDragOver = args.onDragOver ?? null;
    this.onDragLeave = args.onDragLeave ?? null;
    this.onReceive = args.onReceive ?? null;
  }

  /**
   * @param {JQuery} html 
   */
  activateListeners(html) {
    const element = common.util.validation.isDefined(this.elementId) ? $(html).find(`#${this.elementId}`) : html;

    if (!common.util.validation.isDefined(element) || element.length === 0) {
      game.strive.logger.logWarn(`Failed to find drag drop element '${this.elementId}'`);
      return;
    }

    // Events for when the element is a drag source.

    if (ValidationUtil.isDefined(this.onDragStart)) {
      // Ensure HTML attribute for draggability is set. 
      element.attr("draggable", "true");
      element.bind("dragstart", (event) => {
        DragDropHandler.#draggedData = this.dragData;
        this.onDragStart(event, this.dragData);
        for (const [id, handler] of DragDropHandler.#globalListeners.onDragStart) {
          handler(event, this.dragData);
        }
      });
    }

    if (ValidationUtil.isDefined(this.onDragEnd)) {
      element.bind("dragend", (event) => {
        for (const [id, handler] of DragDropHandler.#globalListeners.onDragEnd) {
          handler(event);
        }
        DragDropHandler.#draggedData = null;
      });
    }

    // Events for when the element is a drag target/receiver.

    if (ValidationUtil.isDefined(this.onDragOver)) {
      element.bind("dragover", (event) => {
        if (this.acceptedTypes.length > 0 && !ArrayUtil.arrayContains(this.acceptedTypes, (DragDropHandler.#draggedData ?? {}).type)) return;
        if (!this.mayReceive(DragDropHandler.#draggedData)) return;

        element.addClass(this.dragOverClass);
        this.onDragOver(event, DragDropHandler.#draggedData);
      });
    }

    if (ValidationUtil.isDefined(this.onDragLeave)) {
      element.bind("dragleave", (event) => {
        if (this.acceptedTypes.length > 0 && !ArrayUtil.arrayContains(this.acceptedTypes, (DragDropHandler.#draggedData ?? {}).type)) return;
        if (!this.mayReceive(DragDropHandler.#draggedData)) return;

        element.removeClass(this.dragOverClass);
        this.onDragLeave(event, DragDropHandler.#draggedData);
      });
    }

    if (ValidationUtil.isDefined(this.onReceive)) {
      element.bind("drop", async (event) => {
        event.preventDefault(); // Prevent effects of a normal click. 
        if (this.acceptedTypes.length > 0 && !ArrayUtil.arrayContains(this.acceptedTypes, (DragDropHandler.#draggedData ?? {}).type)) return;
        if (!this.mayReceive(DragDropHandler.#draggedData)) return;

        await this.onReceive(event, DragDropHandler.#draggedData);

        element.removeClass(this.dragOverClass);
        DragDropHandler.#draggedData = null;
      });
    }

    // React to global drag start and end. 

    this._onDragStartId = DragDropHandler.onDragStart((event, data) => {
      if (!this.mayReceive(data)) return;

      element.addClass("drag-accept");
    }, this.acceptedTypes);
    this._onDragEndId = DragDropHandler.onDragEnd((event) => {
      element.removeClass("drag-accept");
    }, this.acceptedTypes);
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
