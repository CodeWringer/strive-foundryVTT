import { common } from "../../common/_module.mjs";

/**
 * Represents a known system-specific setting dialog entry. 
 * 
 * @property {String} key An internal name by which to identify the setting. 
 * @property {String} name A localized name of the setting to display to a user. 
 * @property {SETTING_SCOPES} scope The scope that defines where the setting will be stored. 
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
export default class GameSystemSettingDeclaration {
  /**
   * @param {Object} args 
   * @param {String} args.key An internal name by which to identify the setting. 
   * @param {String} args.name A localized name of the setting to display to a user. 
   * @param {SETTING_SCOPES} args.scope The scope that defines where the setting will be stored. 
   * @param {Boolean | undefined} args.config Whether the setting is shown in the configuration menu and 
   * can thus be changed by a user. 
   * * Default `false`. 
   * @param {String | undefined} args.hint A localized hint to display to the user. 
   * @param {String | Boolean | Number | Object | undefined} args.type The data type of the setting. 
   * * Default `String`. 
   * @param {String | Boolean | Number | Object | undefined} args.default The default value of the setting. 
   * @param {FormApplication | undefined} args.menu A `FormApplication` subclass, 
   * which is invoked for displaying and editing of the represented setting. 
   * * If not `undefined`, expects `type` to be of value `Object`!
   * @param {String | undefined} args.icon A Font Awesome icon. 
   * * E. g. `"fas fa-bars"`. 
   * @param {Boolean} args.restricted If `true`, only a GM may open the `menu`. 
   * * Default `false`;
   */
  constructor(args = {}) {
    common.util.validation.validateOrThrow(args, ["key", "name", "scope"]);

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
