import { LIST_ITEM_EXPANSION_MODES, ListItemExpansionMode } from "../../../../business/setting/list-item-expansion-modes.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import { ScaleVInAnim } from "../../../animation/scale-v-in-anim.mjs";
import { ScaleVOutAnim } from "../../../animation/scale-v-out-anim.mjs";
import { SlideInFromTopAnim } from "../../../animation/slide-in-from-top-anim.mjs";
import { SlideOutToTopAnim } from "../../../animation/slide-out-to-top-anim.mjs";
import VisibilityRule from "../../../model/visibility-rule.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonDropDownViewModel from "../button-dropdown/button-dropdown-viewmodel.mjs";
import { DropDownOption } from "../button-dropdown/dropdown-option.mjs";
import ListItem from "./list-item.mjs";

export default class ListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.list.item; }

  /** @override */
  get clazz() { return ListItemViewModel; }

  /** @override */
  get visibilityRules() {
    return super.visibilityRules.concat([
      new VisibilityRule({
        selector: "> .header > .context-menu",
        shouldBeHidden: () => !this.isEditable || this.contextMenuOptions.length === 0,
        hoverTriggerElementSelector: `#${this.id}`,
      }),
    ]);
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hasContent() { return ValidationUtil.isDefined(this.item.content); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hasHeaderViewModel() { return ValidationUtil.isDefined(this.vmHeader); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hasContentViewModel() { return ValidationUtil.isDefined(this.vmContent); }

  /**
   * @type {Boolean}
   * @private
   */
  #isExpanded = false;
  /**
   * @type {Boolean}
   */
  get isExpanded() { return this.#isExpanded; }
  /**
   * @param {Boolean} value
   */
  set isExpanded(value) {
    if (this.expansionMode.name === LIST_ITEM_EXPANSION_MODES.inline_locked.name) return;

    this.#isExpanded = value;
    this.viewState.write();
    if (this.expansionMode.name === LIST_ITEM_EXPANSION_MODES.inline.name) {
      new Promise(async (resolve) => {
        if (!ValidationUtil.isDefined(this.vmContent)) {
          await this.#renderContentInline();
        }
        
        const contentElm = this.element.find("> .content");

        if (value) {
          contentElm.removeClass("hidden");
          await new SlideInFromTopAnim({
            elm: contentElm,
          }).execute();
        } else {
          await new SlideOutToTopAnim({
            elm: contentElm,
            onComplete: () => {
              contentElm.addClass("hidden");
            },
          }).execute();
        }
        resolve();
      });
    } else if (this.expansionMode.name === LIST_ITEM_EXPANSION_MODES.window.name) {
      if (value) {
        this._sheet = this.item.openSheet();
      } else if (ValidationUtil.isDefined(this._sheet)) {
        this._sheet.close();
        this._sheet = undefined;
      }
    } else {
      game.strive.logger.warning(`Unkown expansionMode '${this.expansionMode.name}'`);
    }
  }

  /**
   * @param {Object} args The arguments object. 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * 
   * If no value is provided, a shortened UUID will be generated for it. 
   * 
   * This string may not contain any special characters! Alphanumeric symbols, as well as hyphen ('-') and 
   * underscore ('_') are permitted, but no dots, brackets, braces, slashes, equal sign, and so on. Failing to comply to this 
   * naming restriction may result in DOM elements not being properly detected by the `activateListeners` method. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * Default `false`. 
   * @param {Boolean | undefined} args.visible
   * * default `true`
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * @param {Boolean | undefined} args.showSecrets `true`, if GM or user-specific secrets contained by this 
   * view model are to be shown. 
   * * default `false`
   * 
   * @param {ListItem} args.item
   * @param {Array<DropDownOption> | undefined} args.contextMenuOptions
   * @param {ListItemExpansionMode | undefined} args.expansionMode
   * @param {Boolean | undefined} args.isExpanded Sets the initial expansion state. 
   * * default `false`
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["item"]);

    this.item = args.item;
    this.contextMenuOptions = args.contextMenuOptions ?? [];
    this.expansionMode = args.expansionMode ?? LIST_ITEM_EXPANSION_MODES.window;
    this.#isExpanded = args.isExpanded ?? false;

    this.viewState.register("isExpanded");
    this.viewState.read();

    this.vmContextMenu = new ButtonDropDownViewModel({
      id: "context-menu",
      parent: this,
      options: this.contextMenuOptions,
      isEditable: true,
      visible: true,
      onClickContextData: args.item,
    });
    if (ValidationUtil.isDefined(this.item.header.viewModelFactory)) {
      this.vmHeader = this.item.header.viewModelFactory(this);
    }
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    if (this.isExpanded
      && (this.expansionMode.name === LIST_ITEM_EXPANSION_MODES.inline.name
        || this.expansionMode.name === LIST_ITEM_EXPANSION_MODES.inline_locked.name)
    ) {
      await this.#renderContentInline();
      const contentElm = this.element.find("> .content");
      contentElm.removeClass("hidden");
    }
  }

  /**
   * @returns {Promise<void>}
   * @private
   */
  async #renderContentInline() {
    if (ValidationUtil.isDefined(this.item.content) && ValidationUtil.isDefined(this.item.content.viewModelFactory)) {
      const renderResult = await this.item.content.render(this);
      this.vmContent = renderResult.viewModel;
      const html = renderResult.rendered;
      const contentElm = this.element.find("> .content");
      contentElm.empty();
      contentElm.append(html);
      await this.vmContent.activateListeners(contentElm);
    }
  }
}
