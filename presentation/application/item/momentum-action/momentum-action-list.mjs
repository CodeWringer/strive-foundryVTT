import Document from "../../../../business/model/document/document.mjs";
import MomentumActionDocument from "../../../../business/model/document/item/momentum-action-document.mjs";
import { ListItemExpansionMode } from "../../../../business/setting/list-item-expansion-modes.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import { DropDownOption } from "../../component/button-dropdown/dropdown-option.mjs";
import DynamicComponent from "../../component/dynamic-component/dynamic-component.mjs";
import ListItem from "../../component/list/list-item.mjs";
import ListViewModel from "../../component/list/list-viewmodel.mjs";
import ConfirmableModalDialog from "../../dialog/confirmable-modal-dialog/confirmable-modal-dialog.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs"
import BaseItemContentViewModel from "../base/base-item-content-viewmodel.mjs";
import MomentumActionContentViewModel from "./momentum-action-content-viewmodel.mjs";
import MomentumActionHeaderViewModel from "./momentum-action-header-viewmodel.mjs";

/**
 * Wraps the basic structure of a vertical list of items, whose content 
 * may be arbitrary. 
 * 
 * @extends ViewModel
 */
export default class MomentumActionListViewModel extends ListViewModel {
  /** @override */
  get clazz() { return MomentumActionListViewModel; }

  /** @override */
  get contextMenuOptions() {
    return [
      new DropDownOption({
        localizedValue: StringUtil.getLoca("system.item.momentumAction.add"),
        icon: "fas fa-plus",
        onClick: () => {
          const momentumActions = this.document.momentumActions;
          const newArr = momentumActions.concat([
            new MomentumActionDocument({
              parentDocument: this.document,
              index: momentumActions.length,
            }),
          ]);
          this.document.momentumActions = newArr;
        },
      }),
      new DropDownOption({
        localizedValue: StringUtil.format(
          StringUtil.getLoca("system.general.sort.sortAscendingBy"),
          StringUtil.getLoca("system.item.momentumAction.desperate.name")
        ),
        icon: "ico ico-sort-asc",
        iconCssClass: "lg",
        condition: (event) => !(event == {}).altKey ?? true,
        onClick: () => {
          const sorted = this.document.momentumActions.concat([]);
          sorted.sort((a, b) => a.desperate.name.localeCompare(b.desperate.name));
          this.document.momentumActions = sorted;
        },
      }),
      new DropDownOption({
        localizedValue: StringUtil.format(
          StringUtil.getLoca("system.general.sort.sortDescendingBy"),
          StringUtil.getLoca("system.item.momentumAction.desperate.name")
        ),
        icon: "ico ico-sort-asc",
        iconCssClass: "lg",
        condition: (event) => (event == {}).altKey ?? true,
        onClick: () => {
          const sorted = this.document.momentumActions.concat([]);
          sorted.sort((a, b) => b.desperate.name.localeCompare(a.desperate.name));
          this.document.momentumActions = sorted;
        },
      }),
      new DropDownOption({
        localizedValue: StringUtil.format(
          StringUtil.getLoca("system.general.sort.sortAscendingBy"),
          StringUtil.getLoca("system.item.momentumAction.heroic.name")
        ),
        icon: "ico ico-sort-asc",
        iconCssClass: "lg",
        condition: (event) => !(event == {}).altKey ?? true,
        onClick: () => {
          const sorted = this.document.momentumActions.concat([]);
          sorted.sort((a, b) => a.heroic.name.localeCompare(b.heroic.name));
          this.document.momentumActions = sorted;
        },
      }),
      new DropDownOption({
        localizedValue: StringUtil.format(
          StringUtil.getLoca("system.general.sort.sortDescendingBy"),
          StringUtil.getLoca("system.item.momentumAction.heroic.name")
        ),
        icon: "ico ico-sort-asc",
        iconCssClass: "lg",
        condition: (event) => (event == {}).altKey ?? true,
        onClick: () => {
          const sorted = this.document.momentumActions.concat([]);
          sorted.sort((a, b) => b.heroic.name.localeCompare(a.heroic.name));
          this.document.momentumActions = sorted;
        },
      }),
    ];
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
   * 
   * @param {Document} args.document
   * @param {ListItemExpansionMode | undefined} args.itemExpansionMode
   * @param {Boolean | undefined} args.itemsInitiallyExpanded
   * * default `false`
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.document = args.document;
    this._title = StringUtil.getLoca("system.item.momentumAction.momentumActions");
    this._items = args.document.momentumActions.map(it => this.#mapDocument(it, args.sheet));
    this._itemContextMenuOptions = [
      new DropDownOption({
        localizedValue: StringUtil.getLoca("system.item.momentumAction.delete"),
        icon: "fas fa-trash",
        onClick: async (item) => {
          const dialog = await new ConfirmableModalDialog({
            easyDismissal: true,
            title: StringUtil.getLoca("system.general.delete.confirm"),
            sections: [
              new DynamicComponent({
                html: `<p class="font-size-md">${StringUtil.format(
                  StringUtil.getLoca("system.general.delete.confirmOf"),
                  item.document.name
                )}</p>`,
              }),
            ],
          }).renderAndAwait();

          if (dialog.confirmed) {
            const arr = args.document.momentumActions.concat([]);
            const index = args.document.momentumActions.findIndex(it => it.id === item.id);
            arr.splice(index, 1);
            args.document.momentumActions = arr;
          }
        },
      }),
    ];

    // Listen for data changes and update the list accordingly.
    this._callbackId = args.document.onChange((propertyName, newValue) => {
      if (propertyName === "momentumActions") {
        this.items = newValue.map(momentumAction => this.#mapDocument(momentumAction, args.sheet));
      }
    });
  }

  /** @override */
  dispose() {
    this.document.offChange(this._callbackId);
    super.dispose();
  }

  /**
   * @param {MomentumActionDocument} document 
   * @param {ActorSheet | ItemSheet} sheet 
   * @returns {ListItem}
   * @private
   */
  #mapDocument(document, sheet) {
    return new ListItem({
      id: document.id,
      document: document,
      openSheet: async () => {
        if (ValidationUtil.isFunction(document.openSheet)) {
          return await document.openSheet(true);
        } else {
          game.strive.logger.warning("openSheet undefined");
        }
      },
      header: new DynamicComponent({
        template: MomentumActionHeaderViewModel.TEMPLATE,
        viewModelFactory: (parent) => new MomentumActionHeaderViewModel({
          id: "header",
          parent: parent,
          document: document,
          sheet: sheet,
          onNameClick: () => {
            this.toggleItemExpanded(document.id);
          },
        }),
      }),
      content: new DynamicComponent({
        template: BaseItemContentViewModel.TEMPLATE,
        viewModelFactory: (parent) => new MomentumActionContentViewModel({
          id: "content",
          parent: parent,
          document: document,
          sheet: sheet,
        }),
      }),
    });
  }
}
