import { ITEM_TYPES } from "../../../../../../business/document/item/item-types.mjs";
import SystemHealthConditionBroker from "../../../../../../business/ruleset/health/system-health-condition-broker.mjs";
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

    const systemHealthConditions = SystemHealthConditionBroker.conditions;
    const characterHealthConditions = this.document.health.conditions;
    this.conditionViewModels = [];

    // Iterating instances of `HealthCondition`s - system-defined Health Conditions. 
    for (const condition of systemHealthConditions) {
      if (this._isHiddenBySettings(condition.name)) continue;

      const characterHealthCondition = characterHealthConditions.find(it => it.name === condition.name);
      const isOnCharacter = ValidationUtil.isDefined(characterHealthCondition);
      const hasIntensity = isOnCharacter ? characterHealthCondition.current > 0 : false;

      const vm = new HealthConditionListItemViewModel({
        id: condition.name,
        parent: this,
        current: isOnCharacter ? characterHealthCondition.current : 0,
        limit: condition.limit,
        localizedName: condition.name,
        localizedToolTip: condition.description,
        img: condition.img,
        visible: hasIntensity || this.isExpanded,
        onChange: async (_, newValue) => {
          if (newValue > 0) {
            // Update or create
            if (isOnCharacter) {
              // Update
              characterHealthCondition.current = newValue;
            } else {
              // Create
              await Item.create({
                name: condition.name,
                img: condition.img,
                type: ITEM_TYPES.HEALTH_CONDITION,
                system: {
                  current: 1,
                  limit: condition.limit,
                  description: condition.description,
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

    // Iterating instances of `TransientHealthCondition`s - instances of system-defined 
    // **and** custom Health Conditions (but actually, only custom ones will be worked with here).
    for (const condition of characterHealthConditions) {
      if (this._isHiddenBySettings(condition.name)) continue;
      // Exclude system-defined Conditions.
      if (ValidationUtil.isDefined((systemHealthConditions.find(it => it.name === condition.name)))) continue;

      const localizedName = condition.name;
      const hasDescription = ValidationUtil.isDefined(condition.description) && condition.description.length > 0;
      const hasGmNotes = ValidationUtil.isDefined(condition.gmNotes) && condition.gmNotes.length > 0;
      let localizedToolTip;
      if (hasDescription || hasGmNotes) {
        localizedToolTip = (this.isGM && hasGmNotes) 
        ? `${condition.description}<div class="border-solid-t-sm">${condition.gmNotes}</div>` 
        : condition.description
      }
      const vm = new HealthConditionListItemViewModel({
        id: condition.name,
        parent: this,
        current: condition.current,
        limit: condition.limit,
        localizedName: localizedName,
        localizedToolTip: localizedToolTip,
        img: condition.img,
        visible: true, // Assumed to always be true, as a custom-defined Condition shouldn't have a `current` value of 0. 
        onChange: async (_, newValue) => {
          if (newValue > 0) {
            // Update
            condition.current = newValue;
          } else {
            // Delete
            condition.delete();
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
