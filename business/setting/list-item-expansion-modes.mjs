import { ValidationUtil } from "../../common/util/validation-utility.mjs";

export class ListItemExpansionMode {
  /**
   * @param {Object} args
   * @param {String} args.name Internal name. 
   * @param {String} args.localizableName Localization key. 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["name", "localizableName"]);

    this.name = args.name;
    this.localizableName = args.localizableName;
  }
}

export const LIST_ITEM_EXPANSION_MODES = {
  /** Expand into a separate window. */
  window: new ListItemExpansionMode({
    name: "window",
    localizableName: "system.settings.listItemExpansionMode.window",
  }),
  /** Expand into its parent sheet. Effectively turns the list item into an 'accordion' control. */
  inline: new ListItemExpansionMode({
    name: "inline",
    localizableName: "system.settings.listItemExpansionMode.inline",
  }),
  /** Expand into its parent sheet. Effectively turns the list item into an 'accordion' control. */
  inline_locked: new ListItemExpansionMode({
    name: "inline_locked",
    localizableName: "system.settings.listItemExpansionMode.inline_locked",
  }),
}
