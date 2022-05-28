import ViewModel from "../../../module/components/viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";

// For some reason, extending from SheetViewModel, which would be the correct parent type here, 
// causes a circular reference error. This is where the interpreter gives up and claims that SheetViewModel is 
// being used, before it is initialized. 
export default class SkillAbilityChatMessageViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_ABILITY_CHAT_MESSAGE; }

  /**
   * @type {Item}
   */
  item = undefined;

  /**
   * @type {SkillAbility}
   */
  skillAbility = undefined;
  
  /** @override */
  get entityId() { return this.skillAbility.id; }

  /**
   * @type {Actor}
   */
  actor = undefined;

  /**
   * @type {Number}
   * @readonly
   */
  index = -1;

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideObstacle() { return this.skillAbility.obstacle === undefined; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideOpposedBy() { return this.skillAbility.opposedBy === undefined; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hideCondition() { return this.skillAbility.condition === undefined; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hideDistance() { return this.skillAbility.distance === undefined; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hideAttackType() { return this.skillAbility.attackType === undefined; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hideDamage() { return this.skillAbility.damage.length <= 0; }

  /**
   * @type {String}
   * @readonly
   */
  get localizedAttackType() {
    if (this.skillAbility.attackType === undefined) return "";

    const localizableName = this._getConfigValue(game.ambersteel.config.attackTypes, this.skillAbility.attackType).localizableName;
    return game.i18n.localize(localizableName);
  };

  get description() { return TextEditor.enrichHTML(this.skillAbility.description); }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * 
   * @param {Item} args.item
   * @param {SkillAbility} args.skillAbility
   * @param {Actor} args.actor
   * @param {Number} args.index
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["item", "skillAbility"]);

    this._isEditable = args.isEditable ?? false;
    this._isSendable = args.isSendable ?? false;
    this._isOwner = args.isOwner ?? false;
    this._isGM = args.isGM ?? false;
    this._contextTemplate = args.contextTemplate;

    this.item = args.item;
    this.skillAbility = args.skillAbility;
    this.actor = args.actor;
    this.index = args.index;
  }

  /**
   * Returns the config object whose name matches the given value. Or, if the given value is an object, 
   * simply returns the object. 
   * @param {Object} configOptions 
   * @param {String} value 
   * @private
   */
  _getConfigValue(configOptions, value) {
    for (const configOptionName in configOptions) {
      const configOption = configOptions[configOptionName];

      if (configOption.name === value) {
        return configOption;
      }
    }

    return undefined;
  }

  /**
   * @param {String} damageTypeName 
   * @returns {String}
   * @private
   */
  getLocalizedDamageType(damageTypeName) {
    const configItem = game.ambersteel.getConfigItem(game.ambersteel.config.damageTypes, damageTypeName);
    return game.i18n.localize(configItem.localizableName);
  }
}
