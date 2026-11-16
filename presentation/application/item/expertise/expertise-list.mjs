import Document from "../../../../business/model/document/document.mjs";
import ExpertiseDocument from "../../../../business/model/document/item/expertise-document.mjs";
import { ListItemExpansionMode } from "../../../../business/setting/list-item-expansion-modes.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import { DropDownOption } from "../../component/button-dropdown/dropdown-option.mjs";
import DynamicComponent from "../../component/dynamic-component/dynamic-component.mjs";
import ListItem from "../../component/list/list-item.mjs";
import ListSeparator from "../../component/list/list-separator.mjs";
import ListViewModel from "../../component/list/list-viewmodel.mjs";
import ConfirmableModalDialog from "../../dialog/confirmable-modal-dialog/confirmable-modal-dialog.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs"
import BaseItemContentViewModel from "../base/base-item-content-viewmodel.mjs";
import BaseItemHeaderViewModel from "../base/base-item-header-viewmodel.mjs";
import ExpertiseContentViewModel from "./expertise-content-viewmodel.mjs";
import ExpertiseHeaderViewModel from "./expertise-header-viewmodel.mjs";

/**
 * Wraps the basic structure of a vertical list of items, whose content 
 * may be arbitrary. 
 * 
 * @extends ViewModel
 */
export default class ExpertiseListViewModel extends ListViewModel {
  /** @override */
  get clazz() { return ExpertiseListViewModel; }

  /** @override */
  get contextMenuOptions() {
    return [
      new DropDownOption({
        localizedValue: StringUtil.getLoca("system.item.expertise.add"),
        icon: "fas fa-plus",
        onClick: () => {
          const expertises = this.document.expertises;
          const newExpertises = expertises.concat([
            new ExpertiseDocument({
              parentDocument: this.document,
              index: expertises.length,
              isBufferMode: this.document.isBufferMode,
            }),
          ]);
          this.document.expertises = newExpertises;
        },
      }),
      new DropDownOption({
        localizedValue: StringUtil.format(
          StringUtil.getLoca("system.general.sort.sortAscendingBy"),
          StringUtil.getLoca("system.item.expertise.name")
        ),
        icon: "ico ico-sort-asc",
        iconCssClass: "lg",
        condition: (event) => !(event == {}).altKey ?? true,
        onClick: () => {
          const newExpertises = this.document.expertises.concat([]);
          newExpertises.sort((a, b) => a.name.localeCompare(b.name));
          this.document.expertises = newExpertises;
        },
      }),
      new DropDownOption({
        localizedValue: StringUtil.format(
          StringUtil.getLoca("system.general.sort.sortDescendingBy"),
          StringUtil.getLoca("system.item.expertise.name")
        ),
        icon: "ico ico-sort-desc",
        iconCssClass: "lg",
        condition: (event) => (event == {}).altKey ?? true,
        onClick: () => {
          const newExpertises = this.document.expertises.concat([]);
          newExpertises.sort((a, b) => b.name.localeCompare(a.name));
          this.document.expertises = newExpertises;
        },
      }),
      new DropDownOption({
        localizedValue: StringUtil.format(
          StringUtil.getLoca("system.general.sort.sortAscendingBy"),
          StringUtil.getLoca("system.item.expertise.level")
        ),
        icon: "ico ico-sort-asc",
        iconCssClass: "lg",
        condition: (event) => !(event == {}).altKey ?? true,
        onClick: () => {
          const newExpertises = this.document.expertises.concat([]);
          newExpertises.sort((a, b) => a.requiredLevel - b.requiredLevel);
          this.document.expertises = newExpertises;
        },
      }),
      new DropDownOption({
        localizedValue: StringUtil.format(
          StringUtil.getLoca("system.general.sort.sortDescendingBy"),
          StringUtil.getLoca("system.item.expertise.level")
        ),
        icon: "ico ico-sort-desc",
        iconCssClass: "lg",
        condition: (event) => (event == {}).altKey ?? true,
        onClick: () => {
          const newExpertises = this.document.expertises.concat([]);
          newExpertises.sort((a, b) => b.requiredLevel - a.requiredLevel);
          this.document.expertises = newExpertises;
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
    this._title = StringUtil.getLoca("system.item.expertise.expertises");
    this._items = args.document.expertises.map(it => this.#mapDocument(it, args.sheet)),
      this._separators = [
        new ListSeparator({
          getIndex: () => {
            return this.#getSeparatorIndex(args.document);
          },
          separatorContent: new DynamicComponent({
            template: TEMPLATES.application.component.separator.horizontalLockedSeparator,
          }),
          tooltip: new ViewModelToolTipDefinition({
            localized: StringUtil.getLoca("system.item.expertise.lockedHint"),
          }),
          condition: () => this.#getSeparatorIndex(args.document) > -1,
        }),
      ];

    this._itemContextMenuOptions = [
      new DropDownOption({
        localizedValue: StringUtil.getLoca("system.item.expertise.delete"),
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
            const newExpertises = this.document.expertises.concat([]);
            const index = this.document.expertises.findIndex(it => it.id === item.id);
            newExpertises.splice(index, 1);
            this.document.expertises = newExpertises;
          }
        },
      }),
    ];

    // Listen for data changes and update the list accordingly.
    this._callbackId = args.document.onChange((propertyName, newValue) => {
      if (propertyName === "expertises") {
        this.items = newValue.map(expertise => this.#mapDocument(expertise, args.sheet));
      }
    });
  }

  /** @override */
  dispose() {
    this.document.offChange(this._callbackId);
    super.dispose();
  }

  /**
   * @param {ExpertiseDocument} document 
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
        template: BaseItemHeaderViewModel.TEMPLATE,
        viewModelFactory: (parent) => new ExpertiseHeaderViewModel({
          id: "header",
          parent: parent,
          document: document,
          sheet: sheet,
          onNameClick: () => {
            this.toggleItemExpanded(expertise.id);
          },
        }),
      }),
      content: new DynamicComponent({
        template: BaseItemContentViewModel.TEMPLATE,
        viewModelFactory: (parent) => new ExpertiseContentViewModel({
          id: "content",
          parent: parent,
          document: document,
          sheet: sheet,
        }),
      }),
    });
  }

  /**
   * @param {Document} document 
   * @returns {Number}
   * @private
   */
  #getSeparatorIndex(document) {
    for (let i = 0; i < document.expertises.length; i++) {
      const expertise = document.expertises[i];
      if (expertise.requiredLevel > document.level) {
        return i;
      };
    }
    return -1;
  };
}
