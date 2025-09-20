import { ITEM_TYPES } from "../../../../../../business/document/item/item-types.mjs";
import { HEALTH_CONDITIONS } from "../../../../../../business/ruleset/health/health-conditions.mjs";
import GameSystemWorldSettings from "../../../../../../business/setting/game-system-world-settings.mjs";
import { ValidationUtil } from "../../../../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../../../../component/button/button-viewmodel.mjs";
import ViewModel from "../../../../../view-model/view-model.mjs";
import HealthConditionListItemViewModel from "../../../../item/health-condition/health-condition-list-item-viewmodel.mjs";

/**
 * @property {TransientBaseCharacterActor} document An actor document on which to set the states. 
 * @property {String} listItemTemplate
 * * Read-only
 * 
 * @extends ViewModel
 */
export default class ActorHealthConditionsViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_HEALTH_CONDITIONS; }

  /**
   * @type {String}
   * @readonly
   */
  get conditionTemplate() { return HealthConditionListItemViewModel.TEMPLATE; }

  /**
   * @type {Boolean}
   * @private
   */
  _isExpanded = false;
  /**
   * @type {Boolean}
   */
  get isExpanded() {
    return this._isExpanded;
  }
  set isExpanded(value) {
    this._isExpanded = value;

    if (value) {
      this.conditionViewModels.forEach(vm => {
        vm.visible = true;
      });
      this.element.find("#expansion-indicator-expanded").removeClass("hidden");
      this.element.find("#expansion-indicator-collapsed").addClass("hidden");
    } else {
      this.conditionViewModels.forEach(vm => {
        vm.visible = vm.current > 0;
      });
      this.element.find("#expansion-indicator-expanded").addClass("hidden");
      this.element.find("#expansion-indicator-collapsed").removeClass("hidden");
    }
    
    // Immediately write view state. 
    this.writeViewState();
  }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientBaseCharacterActor} args.document An actor document on which to set the state. 
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.document = args.document;

    this.registerViewStateProperty("_isExpanded");
    this.readViewState();

    const systemHealthConditions = HEALTH_CONDITIONS.asArray();
    const characterHealthConditions = this.document.health.conditions;
    this.conditionViewModels = [];

    for (const condition of systemHealthConditions) {
      const isHiddenBySetting = this._isHiddenBySettings(condition.name);
      if (isHiddenBySetting) continue;

      const characterHealthCondition = characterHealthConditions.find(it => it.internalName === condition.name);
      const isOnCharacter = ValidationUtil.isDefined(characterHealthCondition);
      const hasIntensity = isOnCharacter ? characterHealthCondition.current > 0 : false;

      const localizedName = game.i18n.localize(condition.localizableName);
      const localizedToolTip = game.i18n.localize(condition.localizableToolTip);
      const vm = new HealthConditionListItemViewModel({
        id: condition.name,
        internalName: condition.name,
        parent: this,
        current: isOnCharacter ? characterHealthCondition.current : 0,
        limit: condition.limit,
        localizedName: localizedName,
        localizedToolTip: localizedToolTip,
        img: condition.img,
        visible: hasIntensity || this.isExpanded,
        onChange: async (oldValue, newValue) => {
          if (newValue > 0) {
            // Update or create
            if (isOnCharacter) {
              // Update
              characterHealthCondition.current = newValue;
            } else {
              // Create
              await Item.create({
                name: localizedName,
                img: condition.img,
                type: ITEM_TYPES.HEALTH_CONDITION,
                system: {
                  internalName: condition.name,
                  current: 1,
                  limit: condition.limit,
                  description: localizedToolTip,
                }
              }, { parent: this.document.document });
            }
          } else {
            // Delete
            if (isOnCharacter) {
              characterHealthCondition.delete();
            }
          }
        },
      });
      this.conditionViewModels.push(vm);
    }

    this.vmHeaderButton = new ButtonViewModel({
      id: "vmHeaderButton",
      parent: this,
      isEditable: true, // Even those without editing right should be able to see nested content. 
      onClick: async () => {
        this.isExpanded = !this.isExpanded;
      },
    });
  }

  /**
   * Returns `true`, if the health condition with the given name has been hidden via game settings. 
   * 
   * @param {String} name 
   * @returns {Boolean}
   */
  _isHiddenBySettings(name) {
    const hiddenHealthConditions = new GameSystemWorldSettings().get(GameSystemWorldSettings.KEY_HEALTH_SETTINGS).hidden;
    return ValidationUtil.isDefined(hiddenHealthConditions.find(it => it === name));
  }
}
