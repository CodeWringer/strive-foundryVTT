import { validateOrThrow } from "../util/validation-utility.mjs";

/**
 * Represents a known system-specific setting. 
 * 
 * @property {String} key An internal name by which to identify the setting. 
 * @property {String} name A localized name of the setting to display to a user. 
 * @property {SettingScopes} scope The scope that defines where the setting will be stored. 
 * @property {Boolean} config Whether the setting is shown in the configuration menu and 
 * can thus be changed by a user. 
 * @property {String} hint A localized hint to display to the user. 
 * @property {String | Boolean | Number | Object} type The data type of the setting. 
 * @property {String | Boolean | Number | Object} default The default value of the setting. 
 * @property {FormApplication | undefined} menu A `FormApplication` subclass, 
 * which is invoked for displaying and editing of the represented setting. 
 * * If not `undefined`, expects `type` to be of value `Object`!
 * @property {String | undefined} icon A Font Awesome icon. 
 * * E. g. `"fas fa-bars"`. 
 * @property {Boolean} restricted If `true`, only a GM may open the `menu`. 
 */
export default class AmbersteelSetting {
  /**
   * @param {Object} args 
   * @param {String} key An internal name by which to identify the setting. 
   * @param {String} name A localized name of the setting to display to a user. 
   * @param {SettingScopes} scope The scope that defines where the setting will be stored. 
   * @param {Boolean | undefined} config Whether the setting is shown in the configuration menu and 
   * can thus be changed by a user. 
   * * Default `false`. 
   * @param {String | undefined} hint A localized hint to display to the user. 
   * @param {String | Boolean | Number | Object | undefined} type The data type of the setting. 
   * * Default `String`. 
   * @param {String | Boolean | Number | Object | undefined} default The default value of the setting. 
   * @param {FormApplication | undefined} menu A `FormApplication` subclass, 
   * which is invoked for displaying and editing of the represented setting. 
   * * If not `undefined`, expects `type` to be of value `Object`!
   * @param {String | undefined} icon A Font Awesome icon. 
   * * E. g. `"fas fa-bars"`. 
   * @param {Boolean} restricted If `true`, only a GM may open the `menu`. 
   * * Default `false`;
   */
  constructor(args = {}) {
    validateOrThrow(args, ["key", "name", "scope"]);

    this.key = args.key;
    this.name = args.name;
    this.scope = args.scope;
    this.hint = args.hint ?? "";
    this.config = args.config ?? false;
    this.default = args.default;
    this.type = args.type ?? String;
    this.menu = args.menu;
    this.icon = args.icon;
    this.restricted = args.restricted ?? false;
  }
}
