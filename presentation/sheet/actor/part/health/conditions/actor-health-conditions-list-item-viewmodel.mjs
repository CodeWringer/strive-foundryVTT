import { CharacterHealthState } from "../../../../../../business/ruleset/health/character-health-state.mjs"
import { ArrayUtil } from "../../../../../../business/util/array-utility.mjs"
import { ValidationUtil } from "../../../../../../business/util/validation-utility.mjs"
import ObservableField from "../../../../../../common/observables/observable-field.mjs"
import InputNumberSpinnerViewModel from "../../../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import InputToggleViewModel from "../../../../../component/input-toggle/input-toggle-viewmodel.mjs"
import ViewModel from "../../../../../view-model/view-model.mjs"

/**
 * Represents a single health state. 
 * 
 * @property {Boolean} value Gets or sets the state on the given document. 
 * * If set to `true`, adds the state's "id" to the document's `states` array. 
 * * If set to `false`, removes the state's "id" from the document's `states` array. 
 * @property {TransientBaseCharacterActor} document An actor document on which to set the state. 
 * @property {String} localizedLabel A localized label for the state. 
 * @property {String} stateName The state's "id". 
 * @property {ObservableField} stateIntensity
 * @property {ObservableField} activeState
 * @property {Number} stateLimit
 * 
 * @extends ViewModel
 */
export default class ActorHealthConditionsListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_HEALTH_CONDITIONS_LIST_ITEM; }

  /**
   * Returns true, if the state can be incurred multiple times, which means the 
   * intensity number spinner should be visible. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get showIntensity() { return (this.stateLimit !== 1) && (this.stateIntensity.value > 0); }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {String | undefined} args.localizedToolTip A localized tool tip for the state. 
   * 
   * @param {TransientBaseCharacterActor} args.document An actor document on which to set the state. 
   * @param {String} args.localizedLabel A localized label for the state. 
   * @param {String} args.stateName The state's "id". 
   * @param {Number | undefined} args.stateIntensity
   * * Default `0`
   * @param {Number | undefined} args.stateLimit
   * * Default `0`
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document", "localizedLabel", "stateName"]);
    
    this.document = args.document;
    this.localizedLabel = args.localizedLabel;
    this.stateName = args.stateName;
    
    this.activeState = new ObservableField({ value: (args.stateIntensity > 0)})
    this.activeState.onChange((field, oldValue, newValue) => {
      if (newValue === true) {
        this.stateIntensity.value = 1;
      } else {
        this.stateIntensity.value = 0;
      }
    });
    
    this.stateIntensity = new ObservableField({ value: (args.stateIntensity ?? 0)})
    this.stateIntensity.onChange((field, oldValue, newValue) => {
      let characterHealthStates = this.document.health.states;
      const healthState = characterHealthStates.find(it => it.name === this.stateName);

      if (newValue < 1 && healthState !== undefined) {
        // Remove health state. 
        characterHealthStates = ArrayUtil.arrayTakeUnless(
          characterHealthStates, 
          it => it.name === this.stateName,
        );
      } else {
        if (healthState === undefined) {
          // Health state does not yet exist on character - add it. 
          characterHealthStates.push(
            new CharacterHealthState({
              name: this.stateName,
              intensity: newValue,
            })
          );
        } else {
          // Set new value for health state. 
          healthState.intensity = newValue;
        }
      }

      this.document.health.states = characterHealthStates;
    });

    this.stateLimit = args.stateLimit ?? 0;

    this.btnToggle = new InputToggleViewModel({
      id: "btnToggle",
      parent: this,
      value: this.activeState.value,
      onChange: (_, newValue) => {
        this.activeState.value = newValue;
      },
    });

    if (this.showIntensity === true) {
      this.vmIntensity = new InputNumberSpinnerViewModel({
        id: "vmIntensity",
        parent: this,
        value: this.stateIntensity.value,
        onChange: (_, newValue) => {
          this.stateIntensity.value = newValue;
        },
        min: 0,
        max: (this.stateLimit > 0) ? this.stateLimit : undefined,
      });
    }
  }

  /** @override */
  dispose() {
    this.activeState.dispose();
    this.stateIntensity.dispose();

    super.dispose();
  }
}