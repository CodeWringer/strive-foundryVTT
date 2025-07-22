import { CharacterHealthCondition } from "../../../../../../business/ruleset/health/character-health-state.mjs";
import { HEALTH_CONDITIONS, HealthCondition } from "../../../../../../business/ruleset/health/health-states.mjs";
import GameSystemWorldSettings from "../../../../../../business/setting/game-system-world-settings.mjs";
import { ValidationUtil } from "../../../../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../../../../component/button/button-viewmodel.mjs";
import ViewModel from "../../../../../view-model/view-model.mjs";
import ActorHealthConditionsListItemViewModel from "./actor-health-conditions-list-item-viewmodel.mjs";

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
  get conditionTemplate() { return ActorHealthConditionsListItemViewModel.TEMPLATE; }

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
        const isHiddenBySetting = this._isHiddenBySettings(vm.stateName);
        vm.visible = isHiddenBySetting ? false : true;
      });
      this.element.find("#expansion-indicator-expanded").removeClass("hidden");
      this.element.find("#expansion-indicator-collapsed").addClass("hidden");
    } else {
      this.conditionViewModels.forEach(vm => {
        const isHiddenBySetting = this._isHiddenBySettings(vm.stateName);
        vm.visible = isHiddenBySetting ? false : (vm.stateIntensity.value > 0);
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

    const sortedHealthConditions = this._getSortedHealthConditions();
    const characterHealthConditions = this.document.health.states;

    this.conditionViewModels = [];
    for (const condition of sortedHealthConditions) {
      const isHiddenBySetting = this._isHiddenBySettings(condition.name);

      const conditionOnCharacter = characterHealthConditions.find(it => it.name === condition.name);
      const intensity = ValidationUtil.isDefined(conditionOnCharacter) ? conditionOnCharacter.intensity : undefined;
      const hasIntensity = ValidationUtil.isDefined(conditionOnCharacter) ? conditionOnCharacter.intensity > 0 : false;

      const vm = new ActorHealthConditionsListItemViewModel({
        id: condition.name,
        parent: this,
        document: this.document,
        localizedLabel: game.i18n.localize(condition.localizableName) ?? condition.name,
        localizedToolTip: this.showReminders ? game.i18n.localize(condition.localizableToolTip) : undefined,
        iconHtml: condition.iconHtml,
        stateName: condition.name,
        stateIntensity: intensity,
        stateLimit: condition.limit,
        visible: !isHiddenBySetting && (hasIntensity || this.isExpanded),
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
   * Returns all health condition definitions (custom and from the system) and sorted alphabetically. 
   * 
   * @returns {Array<HealthCondition>}
   * 
   * @private
   */
  _getSortedHealthConditions() {
    const customHealthConditions = new GameSystemWorldSettings().get(GameSystemWorldSettings.KEY_CUSTOM_HEALTH_CONDITIONS).custom
      .map(it => new HealthCondition({
        name: it.name,
        limit: it.limit,
        iconHtml: ValidationUtil.isDefined(it.iconPath) ? `<img class="custom-system-edit custom-icon-sm" src="${it.iconPath}" style="border: none; filter: brightness(0.25);"></img>` : undefined,
      }));
    const systemHealthConditions = HEALTH_CONDITIONS.asArray();
    const allHealthConditions = customHealthConditions.concat(systemHealthConditions);
    // Sort alphabetically. 
    allHealthConditions.sort((a, b) => {
      const lowerA = a.name.toLowerCase();
      const lowerB = b.name.toLowerCase();

      if (lowerA > lowerB) {
        return 1;
      } else if (lowerA < lowerB) {
        return -1;
      } else {
        return 0;
      }
    });

    return allHealthConditions;
  }

  /**
   * Returns `true`, if the health condition with the given name has been hidden via game settings. 
   * 
   * @param {String} name 
   * @returns {Boolean}
   */
  _isHiddenBySettings(name) {
    const hiddenHealthConditions = new GameSystemWorldSettings().get(GameSystemWorldSettings.KEY_CUSTOM_HEALTH_CONDITIONS).hidden;
    return ValidationUtil.isDefined(hiddenHealthConditions.find(it => it === name));
  }
}
