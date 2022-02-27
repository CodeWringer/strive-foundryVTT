import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";
import IllnessViewModel from "../../item/illness/illness-viewmodel.mjs";
import InjuryViewModel from "../../item/injury/injury-viewmodel.mjs";
import SheetViewModel from "../../sheet-viewmodel.mjs";

export default class ActorHealthViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_HEALTH; }

  /**
   * @type {Actor}
   */
  actor = undefined;

  /**
   * @type {Number}
   * @readonly
   */
  get injuryCount() { return this.actor.injuries.length; }

  /**
   * @type {Number}
   * @readonly
   */
  get illnessCount() { return this.actor.illnesses.length; }

  /**
   * @type {Array<IllnessViewModel>}
   * @readonly
   */
  illnesses = [];

  /**
   * @type {Array<InjuryViewModel>}
   * @readonly
   */
  injuries = [];

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} isGM If true, the current user is a GM. 
   * 
   * @param {Actor} actor
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["actor"]);

    // Own properties.
    this.actor = args.actor;

    // Child view models. 
    const thiz = this;

    for (const illness of this.actor.illnesses) {
      const illnessViewModel = new IllnessViewModel({
        ...args,
        id: illness.id,
        parent: thiz,
        item: illness,
      });
      this.illnesses.push(illnessViewModel);
    }

    for (const injury of this.actor.injuries) {
      const injuryViewModel = new InjuryViewModel({
        ...args,
        id: injury.id,
        parent: thiz,
        item: injury,
      });
      this.injuries.push(injuryViewModel);
    }
  }
}
