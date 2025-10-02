import { ExtenderUtil } from "../../../../common/extender-util.mjs";
import InputImageViewModel from "../../../component/input-image/input-image-viewmodel.mjs";
import InputRichTextViewModel from "../../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import LazyLoadViewModel from "../../../component/lazy-load/lazy-load-viewmodel.mjs";
import GmNotesViewModel from "../../../component/section-gm-notes/section-gm-notes-viewmodel.mjs";
import Tooltip from "../../../component/tooltip/tooltip.mjs";
import BaseSheetViewModel from "../../../view-model/base-sheet-viewmodel.mjs";

export default class PlainActorSheetViewModel extends BaseSheetViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_PLAIN_SHEET; }

  /**
   * Returns true, if the navigation is to be shown. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get showNavigation() { return this.isGM === true }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {TransientBaseActor} args.document The represented transient document instance. 
   * @param {ActorSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super(args);

    // Aggressively clear out any lingering ToolTips. 
    Tooltip.removeAllToolTipElements();

    this.vmName = new InputTextFieldViewModel({
      parent: this,
      id: "vmName",
      value: this.document.name,
      onChange: (_, newValue) => {
        this.document.name = newValue;
      },
      placeholder: game.i18n.localize("system.general.name.label"),
    });
    this.vmImg = new InputImageViewModel({
      parent: this,
      id: "vmImg",
      value: this.document.img,
      onChange: (_, newValue) => {
        this.document.img = newValue;
      },
    });
    this.vmRtDescription = new InputRichTextViewModel({
      id: "vmRtDescription",
      parent: this,
      value: this.document.description,
      onChange: (_, newValue) => {
        this.document.description = newValue;
      },
    });
    
    if (this.isGM === true) {
      this.gmNotesViewModel = new LazyLoadViewModel({
        id: "lazyGmNotes",
        parent: this,
        template: GmNotesViewModel.TEMPLATE,
        viewModelFactoryFunction: (args) => { return new GmNotesViewModel(args); },
        viewModelArgs: {
          ...args, 
          id: "gmNotes", 
          document: this.document, 
        },
      });
    }
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    const thiz = this;
    const tabs = html.find("nav.sheet-tabs > a");
    tabs.on("click", function(e) {
      const tab = $(e.currentTarget).data("tab");
      thiz._renderLazyTab(tab);
    });

    await this._renderActiveTab(html);
  }

  /** @override */
  dispose() {
    super.dispose();

    // An extremely aggressive band-aid solution. But, this ensures lingering tool tip elements 
    // with (at least partially) dynamic IDs are always cleared properly. 
    Tooltip.removeAllToolTipElements();
  }

  /**
   * Renders the contents of the active tab. 
   * 
   * @param {JQuery} html 
   * 
   * @private
   * @async
   */
  async _renderActiveTab(html) {
    const activeTab = html.find("nav.sheet-tabs > a.active");
    const tab = activeTab.data("tab");
    await this._renderLazyTab(tab);
    this.restoreScrollPosition();
  }

  /**
   * Renders the contents of the tab with the given "tab" dataset attribute. 
   * 
   * @param {String} tab The value of the "tab" dataset attribute 
   * of the tab to render. E. g. `"skills"`. 
   * 
   * @private
   * @async
   */
  async _renderLazyTab(tab) {
    if (tab === "gm-notes") {
      await this.gmNotesViewModel.render();
    }
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(PlainActorSheetViewModel));
  }

}
