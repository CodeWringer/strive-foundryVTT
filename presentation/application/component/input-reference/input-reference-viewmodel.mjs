import { DOCUMENT_COLLECTION_SOURCES } from "../../../../business/model/document/document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "../../../../business/model/document/document-fetcher/document-fetcher.mjs";
import { GENERAL_DOCUMENT_TYPES } from "../../../../business/model/document/general-document-types.mjs";
import TransientDocument from "../../../../business/model/document/transient-document.mjs";
import Reference from "../../../../business/model/domain/reference.mjs";
import { Search, SEARCH_MODES, SearchItem } from "../../../../business/search/search.mjs";
import { ArrayUtil } from "../../../../common/util/array-utility.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import { SheetUtil } from "../../../util/sheet-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
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
    
    this.#inputElement.empty();
    
    const readModeElement = this.element.find("> .read-mode");
    readModeElement.empty();
    
    if (ValidationUtil.isDefined(this.value)) {
      this.#inputElement.val(this.value.name);
      readModeElement.append(`<span class="flex-grow">${value.name}</span><i class="ico ico-chain-link lg"></i>`);
    } else {
      readModeElement.append(`<span class="flex-grow"></span><i class="ico ico-chain-link-broken lg"></i>`);
    }
  }

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
   */
  constructor(args = {}) {
    super({
      ...args,
      autoHandleEvents: false,
    });
  }

  /**
   * @override
   * 
   * @throws {Error} UnknownException Thrown if the current option could not be set correctly. 
   */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.#menuElement = $(this.element).find(`menu#${this.id}-menu`);
    this.#inputElement = $(this.element).find("input");
    this.#inputElement.on("focus", () => {
      this.openMenu();
    });
    this.#inputElement.on("focusout", () => {
      this.closeMenu();
    });
    this.#inputElement.on("input", async (event) => {
      this.updateOptions();
    });
    this.#inputElement.on("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.#menuElement.find("li").first().focus();
      } else if (event.key === "Escape" || event.key === "Tab") {
        this.closeMenu();
      }
    });

    this._referenced = await this.getReferenced();
    this._updateIcon();
  }

  /** @override */
  dispose() {
    this.closeMenu();
    super.dispose();
  }

  /**
   * Searches for and lists all documents whose name matches the string the user has entered. 
   * @protected
   */
  updateOptions() {
    const inputValue = this.#inputElement.val();

    this.#menuElement.empty();
    if ((inputValue + "").length < 3) {
      return;
    }
    this.#menuElement.append('<li class="flex flex-center"><i class="fas fa-spinner anim-spin font-size-lg"></i></li>');

    const searchableItems = this._getAllSearchableItems();
    const searchItems = searchableItems.map(it => new SearchItem({
      id: it.id,
      term: it.name,
    }));
    const scores = new Search().search({
      searchItems: searchItems,
      searchTerm: this.#inputElement.val(),
      searchMode: SEARCH_MODES.FUZZY,
    });
    let topFive = ArrayUtil.arrayTake(scores, 0, 5);
    topFive = ArrayUtil.arrayTakeWhen(topFive, (it) => it.score > 0 && it.deviation < 3);
    const topFiveMapped = topFive.map(it => searchableItems.find(searchableItem => it.id === searchableItem.id));

    this.#menuElement.empty();

    for (const element of topFiveMapped) {
      const sourceLoca = StringUtil.format2(StringUtil.getLoca("system.general.reference.referenceFrom"), {
        contentType: StringUtil.getLoca(`TYPES.Item.${element.contentType}`),
        pack: element.pack,
      })
      this.#menuElement.append(`<li class="grid-2col" style="max-width: 50rem;" data-id="${element.id}"><span>${element.name}</span><span class="font-size-sm"> (${sourceLoca})</span></li>`);
    }

    const menuItems = this.#menuElement.find("li");
    for (const menuItem of menuItems) {
      menuItem.click(() => {
        const id = $(menuItem).attr("data-id");
        const selected = allDocuments.find(it => it.id === id);
        this.closeMenu();
        this.value = new Reference({
          uuid: selected.id,
          name: selected.name,
        });
      });
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
   * Returns the referenced document instance, if possible. 
   * @returns {Promise<Document | null>}
   * @async
   * @protected
   */
  async getReferenced() {
    if (ValidationUtil.isDefined(this.value)) {
      return await new DocumentFetcher().find({
        id: this.value.id,
        name: this.value.name,
      });
    } else {
      return null;
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
      result.push(({
        id: item.uuid ?? item.id,
        name: item.name,
        source: DOCUMENT_COLLECTION_SOURCES.world,
        pack: "world.items",
        contentType: item.type,
      }));
    }
    for (const pack of game.packs) {
      if (pack.metadata.type !== GENERAL_DOCUMENT_TYPES.ITEM) continue;

      for (const index of pack.index) {
        result.push(({
          id: index.uuid,
          name: index.name,
          source: DOCUMENT_COLLECTION_SOURCES.allCompendia,
          pack: pack.metadata.id,
          contentType: index.type,
        }));
      }
    }
    return result;
  }
}
