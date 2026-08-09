import ChoiceOption from "../../../model/choice-option.mjs";

/**
 * Represents a `ButtonDropDownViewModel` entry. 
 * 
 * @extends ChoiceOption
 * 
 * @property {String} value The actual value. 
 * @property {String | undefined} localizedValue The text that represents the value, to display to the user. 
 * @property {String | undefined} iconLightMode A (relative) icon file path or a FontAwesome icon class. 
 * * E.g. `"systems/strive/presentation/image/texture.svg"`
 * * E.g. `"fas fa-plus"`
 * @property {String | undefined} iconDarkMode A (relative) icon file path or a FontAwesome icon class. 
 * * E.g. `"systems/strive/presentation/image/texture.svg"`
 * * E.g. `"fas fa-plus"`
 * @property {String} iconHtml Returns an HTML representing string containing the 
 * light and dark mode icons, neatly wrapped in a div to be easily inserted into the DOM. 
 * * Read-only
 * @property {String | undefined} iconCssClass Additional CSS classes to add to the icon. 
 * @method onClick Invoked when this option is clicked. 
 * @method condition Invoked to determine visibility of the option. Must return `true` to make the 
 * option visible. 
 */
export class DropDownOption extends ChoiceOption {
  /**
   * @param {Object} args 
   * @param {String} args.value The actual value. 
   * @param {String | undefined} args.localizedValue The text that represents the value, 
   * to display to the user. 
   * @param {String | undefined} args.icon A theming-agnostic icon. Can be a CSS class or 
   * relative file path. 
   * Takes precedence over `iconLightMode` and `iconDarkMode`.
   * * E.g. `"systems/strive/presentation/image/texture.svg"`
   * * E.g. `"ico ico-skill"`
   * * E.g. `"fas fa-plus"`
   * @param {String | undefined} args.iconCssClass Additional CSS classes to add to the icon. 
   * @param {String | undefined} args.iconLightMode An icon for the light mode.
   * A (relative) icon file path or a FontAwesome icon class. 
   * * E.g. `"systems/strive/presentation/image/texture.svg"`
   * * E.g. `"fas fa-plus"`
   * @param {String | undefined} args.iconDarkMode An icon for the dark mode.
   * A (relative) icon file path or a FontAwesome icon class. 
   * * E.g. `"systems/strive/presentation/image/texture.svg"`
   * * E.g. `"fas fa-plus"`
   * 
   * @param {Function | undefined} args.onClick A callback function to trigger when 
   * the entry of the menu is clicked
   * @param {Function | undefined} args.condition Invoked to determine visibility of the option. 
   * Must return `true` to make the option visible. 
   */
  constructor(args = {}) {
    super(args);

    this.onClick = args.onClick ?? (() => {});
    this.condition = args.condition ?? (() => true);
  }
}
