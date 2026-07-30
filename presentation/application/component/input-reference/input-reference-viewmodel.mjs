import { DOCUMENT_COLLECTION_SOURCES } from "../../../../business/model/document/document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "../../../../business/model/document/document-fetcher/document-fetcher.mjs";
import { GENERAL_DOCUMENT_TYPES } from "../../../../business/model/document/general-document-types.mjs";
import Reference from "../../../../business/model/domain/reference.mjs";
import { Search, SEARCH_MODES, SearchItem } from "../../../../business/search/search.mjs";
import { ArrayUtil } from "../../../../common/util/array-utility.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import { DragDropHandler } from "../../../util/drag-drop/drag-drop-handler.mjs";
import { SheetUtil } from "../../../util/sheet-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * @property {Reference | null} value The current value. 
 * @property {String} placeholder A localized placeholder text to display while the input is empty. 
 * 
 * @extends InputViewModel
 */
export default class InputReferenceViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.reference; }

  /** @override */
  get clazz() { return InputReferenceViewModel; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputReference', `{{> "${InputReferenceViewModel.TEMPLATE}"}}`);
  }

  /**
   * @type {Reference | null}
   */
  get value() { return super.value; }
  /**
   * @param {Reference | null} value 
   */
  set value(value) {
    super.value = value;

    const readModeElement = this.element.find("> .read-mode");
    readModeElement.empty();

    let newContent = "";
    if (ValidationUtil.isDefined(this.value)) {
      this.#inputElement.val(this.value.name);
      newContent = `<span class="flex-grow">${value.name}</span><i class="ico ico-chain-link lg"></i>`;
    } else {
      this.#inputElement.val("");
      newContent = `<span class="flex-grow"></span><i class="ico ico-chain-link-broken lg"></i>`;
    }
    readModeElement.append(newContent);

    new Promise(async (resolve) => {
      this._referenced = await this.getReferenced();
      this._updateIcon();
      resolve();
    });
  }

  /**
   * Returns the maximum number of search results to display. 
   * @type {Number}
   * @readonly
   */
  get maxNumberOfEntries() { return 5; }

  /**
   * Initialized late - in `activateListeners`!
   * @type {JQuery}
   * @readonly
   * @private
   */
  #menuElement = undefined;

  /**
   * Initialized late - in `activateListeners`!
   * @type {JQuery}
   * @readonly
   * @private
   */
  #inputElement = undefined;

  /**
   * Initialized late - in `activateListeners`!
   * @type {JQuery}
   * @readonly
   * @private
   */
  #clearButtonElement = undefined;

  /**
   * @type {Boolean}
   * @private
   */
  #isMenuOpen = false;

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * 
   * @param {Boolean | undefined} args.suppressAnims If `true`, suppresses animations that would play when 
   * `isEditable` is changed at run-time. Useful for when this component is child to another, which 
   * instead handles the animations. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {Any}`
   * * `newValue: {Any}`
   * @param {Function | undefined} args.onInput Callback that is invoked when any input is made (by keyboard or mouse or other input device). 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   * @param {Function | undefined} args.onFocus Callback that is invoked when the input element is focused. 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   * @param {Function | undefined} args.onFocusLost Callback that is invoked when the input element is unfocused. 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   * 
   * @param {Reference | undefined} args.value
   * @param {Array<String> | undefined} args.acceptedTypes A list of accepted reference types. 
   * Only those provided will be searchable and drag-droppable. If left empty, allows all types. 
   * E. g. `[ITEM_TYPES.skill]`
   * @param {String | undefined} args.placeholder A placeholder text to display while the input is empty. 
   */
  constructor(args = {}) {
    super({
      ...args,
      autoHandleEvents: false,
    });

    this.acceptedTypes = args.acceptedTypes ?? [];
    this.dragDropHandler = new DragDropHandler({
      mayReceive: (data) => {
        if (this.acceptedTypes.length > 0 && !ArrayUtil.arrayContains(this.acceptedTypes, data.type)) return false;
        return this.isEditable;
      },
      onReceive: (event, data) => {
        this.value = new Reference({
          uuid: data.id,
          name: data.name,
        });
      },
    });
    this.placeholder = args.placeholder ?? "";
  }

  /**
   * @override
   * 
   * @throws {Error} UnknownException Thrown if the current option could not be set correctly. 
   */
  async activateListeners(html) {
    await super.activateListeners(html);

    this._referenced = await this.getReferenced();
    this._updateIcon();

    this.dragDropHandler.activateListeners(this.element);

    this.#menuElement = $(this.element).find(`menu#${this.id}-menu`);
    for (let i = 0; i < this.maxNumberOfEntries; i++) {
      this.#menuElement.append(`<li class="grid-2col hidden" style="max-width: 50rem;" data-index="${i}"></li>`);
      const menuItem = this.#menuElement.find(`li[data-index=${i}]`);
      $(menuItem).click((event) => {
        event.preventDefault();

        const id = $(menuItem).attr("data-id");
        const selected = this._searchableItems.find(it => it.id === id);

        if (this.acceptedTypes.length > 0 && !ArrayUtil.arrayContains(this.acceptedTypes, selected.type)) return;

        this.value = new Reference({
          uuid: selected.id,
          name: selected.name,
        });

        this.closeMenu();
      });
    }
    // These event handlers ensure a click on a menu item doesn't cause the menu to be closed 
    // in the "focusout" handler, which would prevent the click events from firing correctly. 
    this.#menuElement.on("mouseenter", (event) => {
      this._hoverOverMenu = true;
    });
    this.#menuElement.on("mouseleave", (event) => {
      this._hoverOverMenu = false;
    });

    this.#inputElement = $(this.element).find("input");
    this.#inputElement.on("focus", () => {
      this.openMenu();
    });
    this.#inputElement.on("focusout", (event) => {
      if (!this._hoverOverMenu) {
        this.closeMenu();
        if (!ValidationUtil.isDefined(this._referenced)) {
          // Ensures an unconfirmed reference isn't left half-completed. 
          this.value = null;
        } else {
          // Ensures the user can't leave half-completed references. 
          this.#inputElement.val(this.value.name);
        }
      }

    });
    this.#inputElement.on("input", async (event) => {
      this.updateOptions();
    });
    this.#inputElement.on("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "Enter") {
        event.preventDefault();
        this.#menuElement.find("li").first().focus();
      } else if (event.key === "Escape" || event.key === "Tab") {
        this.closeMenu();
      }
    });

    this.#clearButtonElement = $(this.element).find(`a#${this.id}-clear`);
    this.#clearButtonElement.click(() => {
      this.value = null;
      this.closeMenu();
    });
  }

  /** @override */
  dispose() {
    super.dispose();
    this.closeMenu();
    this.dragDropHandler.dispose();
  }

  /**
   * Returns the referenced document instance, if possible. 
   * @returns {Promise<Document | null>}
   * @async
   * @protected
   */
  async getReferenced() {
    if (ValidationUtil.isDefined(this.value)) {
      let id = null;

      if (ValidationUtil.isDefined(this.value.uuid)) {
        const idParts = this.value.uuid.split(".");
        id = idParts[idParts.length - 1];
      }
      
      return await new DocumentFetcher().find({
        id: id,
        name: this.value.name,
      });
    } else {
      return null;
    }
  }

  /**
   * Searches for and lists all documents whose name matches the string the user has entered. 
   * @protected
   */
  updateOptions() {
    const inputValue = this.#inputElement.val();

    if ((inputValue + "").length < 3) {
      return;
    }

    this._searchableItems = this._getAllSearchableItems();
    const searchItems = this._searchableItems.map(it => new SearchItem({
      id: it.id,
      term: it.name,
    }));
    const scores = new Search().search({
      searchItems: searchItems,
      searchTerm: this.#inputElement.val(),
      searchMode: SEARCH_MODES.FUZZY,
    });
    let top = ArrayUtil.arrayTake(scores, 0, this.maxNumberOfEntries);
    top = ArrayUtil.arrayTakeWhen(top, (it) => it.score > 0 && it.deviation < 3);
    const topMapped = top.map(it => this._searchableItems.find(searchableItem => it.id === searchableItem.id));

    const menuItems = this.#menuElement.find("> li");
    for (let i = 0; i < menuItems.length; i++) {
      const menuItem = menuItems[i];

      if (i < topMapped.length) {
        const topMappedItem = topMapped[i];
        const sourceLoca = StringUtil.format2(StringUtil.getLoca("system.general.reference.referenceFrom"), {
          type: StringUtil.getLoca(`TYPES.Item.${topMappedItem.type}`),
          pack: topMappedItem.pack,
        });
        $(menuItem).attr("data-id", topMappedItem.id);
        $(menuItem).html(`<span>${topMappedItem.name}</span><span class="font-size-sm"> (${sourceLoca})</span>`);
        $(menuItem).removeClass("hidden");
      } else {
        $(menuItem).addClass("hidden");
      }
    }
  }

  /**
   * Shows the drop-down menu, by detaching it from `this.element` and 
   * attaching it to the body element, instead. 
   * @protected
   */
  openMenu() {
    if (this.#isMenuOpen) return;

    this.#menuElement.detach();
    $("body").append(this.#menuElement);

    const rect = SheetUtil.getElementRect(this.#inputElement);
    const left = rect.left;
    const top = rect.bottom;

    this.#menuElement.attr("style", `left: ${left}px; top: ${top}px;`)
    this.#menuElement.removeClass("hidden");

    this.#isMenuOpen = true;
  }

  /**
   * Hides the drop-down menu and re-attaches it to `this.element`. 
   * @protected
   */
  closeMenu() {
    if (!this.#isMenuOpen) return;

    this.#menuElement.addClass("hidden");
    this.#menuElement.detach();
    this.element.append(this.#menuElement);

    this.#isMenuOpen = false;
  }

  /**
   * Toggles the current state. 
   * @protected
   */
  toggleMenu() {
    if (this.#isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  /**
   * @private
   */
  _updateIcon() {
    const iconElements = this.element.find("i.ico");
    if (ValidationUtil.isDefined(this._referenced)) {
      iconElements.removeClass("ico-chain-link-broken");
      iconElements.addClass("ico-chain-link");
    } else {
      iconElements.removeClass("ico-chain-link");
      iconElements.addClass("ico-chain-link-broken");
    }
  }

  /**
   * @returns {Promise<Array<Object>>}
   * @private
   */
  _getAllSearchableItems() {
    const result = [];
    for (const item of game.items) {
      if (!ArrayUtil.arrayContains(this.acceptedTypes, item.type)) continue;

      result.push(({
        id: item.uuid ?? item.id,
        name: item.name,
        source: DOCUMENT_COLLECTION_SOURCES.world,
        pack: "world.items",
        type: item.type,
      }));
    }

    for (const actor of game.actors) {
      if (!ArrayUtil.arrayContains(this.acceptedTypes, item.type)) continue;

      result.push(({
        id: actor.uuid ?? actor.id,
        name: actor.name,
        source: DOCUMENT_COLLECTION_SOURCES.world,
        pack: "world.actors",
        type: actor.type,
      }));
    }

    for (const pack of game.packs) {
      if (pack.metadata.type !== GENERAL_DOCUMENT_TYPES.ITEM) continue;

      for (const index of pack.index) {
        if (!ArrayUtil.arrayContains(this.acceptedTypes, index.type)) continue;

        result.push(({
          id: index.uuid,
          name: index.name,
          source: DOCUMENT_COLLECTION_SOURCES.allCompendia,
          pack: pack.metadata.id,
          type: index.type,
        }));
      }
    }
    return result;
  }
}
