import { ValidationUtil } from "../../../../../common/util/validation-utility.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";

export default class ActorActionPointsViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_ACTION_POINTS; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {TransientBaseActor} args.document The represented transient document instance. 
   */
  constructor(args = {}) {
    super(args);

    ValidationUtil.validateOrThrow(args, ["document"]);

    this.actionPoints = [];
    const currentAp = this.document.actionPoints.current;
    for (let i = 0; i < (this.document.actionPoints.maximum + 1); i++) {
      this.actionPoints.push({
        id: `${this.id}-ap-${i}`,
        full: (i > 0) && (i <= currentAp),
        value: i,
      });
    }
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.actionPoints.forEach(ap => {
      const element = this.element.find(`#${ap.id}`);
      element.click(async (event) => {
        event.preventDefault(); // Prevents side-effects from event-bubbling. 

        if (this.isEditable === true) {
          this.document.actionPoints.current = ap.value;
        }
      });
    });
  }

}
