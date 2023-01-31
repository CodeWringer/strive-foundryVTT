import { arrayTakeUnless } from "../../../../../business/util/array-utility.mjs";
import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs";
import ButtonToggleViewModel from "../../../../component/button-toggle/button-toggle-viewmodel.mjs";
import { TEMPLATES } from "../../../../templatePreloader.mjs"
import ViewModel from "../../../../view-model/view-model.mjs"

/**
 * Represents a single health state. 
 * 
 * @property {Boolean} value Gets or sets the state on the given document. 
 * * If set to `true`, adds the state's "id" to the document's `states` array. 
 * * If set to `false`, removes the state's "id" from the document's `states` array. 
 * @property {TransientBaseCharacterActor} document An actor document on which to set the state. 
 * @property {String} localizedLabel A localized label for the state. 
 * @property {String} stateName The state's "id". 
 * 
 * @extends ViewModel
 */
export default class ActorHealthStatesListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_HEALTH_STATES_LIST_ITEM; }

  /**
   * Gets or sets the state on the given document. 
   * 
   * If set to `true`, adds the state's "id" to the document's `states` array. 
   * If set to `false`, removes the state's "id" from the document's `states` array. 
   * 
   * @type {Boolean}
   */
  get value() {
    const index = (this.document.health.states ?? []).indexOf(this.stateName);
    return index > -1;
  }
  set value(value) {
    const states = this.document.health.states ?? [];
    const index = states.indexOf(this.stateName);
    if (value === true && index < 0) {
      // State not yet on document - add it. 
      this.document.health.states = states.concat([this.stateName]);
    } else if (value === false && index > -1) {
      // State on document - remove it. 
      this.document.health.states = arrayTakeUnless(states, (it) => {
        return it === this.stateName;
      });
    }
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientBaseCharacterActor} args.document An actor document on which to set the state. 
   * @param {String} args.localizedLabel A localized label for the state. 
   * @param {String} args.stateName The state's "id". 
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document", "localizedLabel", "stateName"]);
    
    this.document = args.document;
    this.localizedLabel = args.localizedLabel;
    this.stateName = args.stateName;

    this.btnToggle = new ButtonToggleViewModel({
      id: "btnToggle",
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      propertyPath: "value",
      target: this,
    });
  }
}