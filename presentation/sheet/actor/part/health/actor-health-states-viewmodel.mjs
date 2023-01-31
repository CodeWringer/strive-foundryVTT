import { HealthState, HEALTH_STATES } from "../../../../../business/ruleset/health/health-states.mjs";
import LoadHealthStatesSettingUseCase from "../../../../../business/use-case/load-health-states-setting-use-case.mjs";
import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../../../templatePreloader.mjs"
import ViewModel from "../../../../view-model/view-model.mjs"
import ActorHealthStatesListItemViewModel from "./actor-health-states-list-item-viewmodel.mjs";

/**
 * @property {TransientBaseCharacterActor} document An actor document on which to set the states. 
 * @property {String} listItemTemplate
 * * Read-only
 * @property {Array<ActorHealthStatesListItemViewModel>} stateViewModels
 * 
 * @extends ViewModel
 */
export default class ActorHealthStatesViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_HEALTH_STATES; }

  /**
   * @type {String}
   * @readonly
   */
  get listItemTemplate() { return ActorHealthStatesListItemViewModel.TEMPLATE; }

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
    validateOrThrow(args, ["document"]);

    this.document = args.document;

    // Turn states into view models. 

    this.stateViewModels = [];
    
    const stateSettings = new LoadHealthStatesSettingUseCase().invoke();

    // Combine the system default states with the custom states in a single list. 
    const states = HEALTH_STATES.asArray.concat(
      stateSettings.custom.map(customName => 
        new HealthState({
          name: customName,
          localizableName: customName,
        })
      )
    );
    // Sort alphabetically. 
    states.sort((a, b) => {
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

    for (const state of states) {
      if (stateSettings.hidden.find(stateName => state.name === stateName) === undefined) {
        const vm = new ActorHealthStatesListItemViewModel({
          id: state.name,
          parent: this,
          document: this.document,
          isEditable: this.isEditable,
          isSendable: this.isSendable,
          isOwner: this.isOwner,
          localizedLabel: game.i18n.localize(state.localizableName),
          stateName: state.name,
        });
        this.stateViewModels.push(vm);
      }
    }
  }
}