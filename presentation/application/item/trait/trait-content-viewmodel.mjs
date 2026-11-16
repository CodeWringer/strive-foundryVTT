import GameSystemSettings from "../../../../business/setting/game-system-settings.mjs";
import { GameSystemUserSettings } from "../../../../business/setting/game-system-user-settings.mjs";
import { LIST_ITEM_EXPANSION_MODES } from "../../../../business/setting/list-item-expansion-modes.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import VisibilityRule from "../../../model/visibility-rule.mjs";
import InputRichTextViewModel from "../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import BaseItemContentViewModel from "../base/base-item-content-viewmodel.mjs";
import MomentumActionListViewModel from "../momentum-action/momentum-action-list.mjs";

export default class TraitContentViewModel extends BaseItemContentViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.trait.content; }

  /** @override */
  get clazz() { return TraitContentViewModel; }

  /** @override */
  get visibilityRules() {
    return super.visibilityRules.concat([
      new VisibilityRule({
        selector: "> .momentum-actions",
        shouldBeHidden: () => !this.isEditable && this.document.momentumActions.length === 0,
      }),
    ]);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * 
   * @param {TraitDocument} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super(args);

    this.vmDescription = new InputRichTextViewModel({
      id: "vmDescription",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.general.description"),
      }),
      value: this.document.description,
      onChange: (newValue) => {
        this.document.description = newValue;
      },
    });

    let itemsInitiallyExpanded = false;
    const itemExpansionModeRaw = GameSystemSettings.get(GameSystemUserSettings.KEY_LIST_ITEM_EXPANSION_MODE);
    let itemExpansionMode = LIST_ITEM_EXPANSION_MODES.asArray().find(it => it.name === itemExpansionModeRaw) ?? LIST_ITEM_EXPANSION_MODES.window;
    if (!this.isEmbedded && itemExpansionModeRaw === LIST_ITEM_EXPANSION_MODES.inline.name) {
      itemExpansionMode = LIST_ITEM_EXPANSION_MODES.inline_locked;
      itemsInitiallyExpanded = true;
    }

    this.vmMomentumActions = new MomentumActionListViewModel({
      id: "vmMomentumActions",
      parent: this,
      itemExpansionMode: itemExpansionMode,
      itemsInitiallyExpanded: itemsInitiallyExpanded,
      document: this.document,
    });
  }
}
