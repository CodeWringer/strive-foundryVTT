import { ValidationUtil } from "../../../../../business/util/validation-utility.mjs";
import { ExtenderUtil } from "../../../../../common/extender-util.mjs";
import InputTextFieldViewModel from "../../../../component/input-textfield/input-textfield-viewmodel.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";

export default class ActorDriversViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_DRIVERS; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {Array<String>}
   * @readonly
   */
  get aspirations() {
    const dataAspirations = this.document.driverSystem.aspirations;
    return [dataAspirations._0, dataAspirations._1, dataAspirations._2];
  }

  /**
   * @type {Array<String>}
   * @readonly
   */
  get reactions() {
    const dataReactions = this.document.driverSystem.reactions;
    return [dataReactions._0, dataReactions._1, dataReactions._2];
  }

  /**
   * @type {Array<ViewModel>}
   * @readonly
   */
  aspirationViewModels = [];

  /**
   * @type {Array<ViewModel>}
   * @readonly
   */
  reactionViewModels = [];

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientPc} args.document
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.document = args.document;
    this.contextType = args.contextType ?? "actor-drivers";

    const thiz = this;

    this.vmTfAmbition = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTfAmbition",
      value: thiz.document.driverSystem.ambition,
      placeholder: game.i18n.localize("system.character.driverSystem.ambition.placeholder"),
      localizedToolTip: game.i18n.localize("system.character.driverSystem.ambition.reminder"),
      onChange: (_, newValue) => {
        thiz.document.driverSystem.ambition = newValue;
      },
    });

    const aspirationPlaceholders = [
      "system.character.driverSystem.aspiration.placeholder.1",
      "system.character.driverSystem.aspiration.placeholder.2",
      "system.character.driverSystem.aspiration.placeholder.3",
    ];
    for (let i = 0; i < this.aspirations.length; i++) {
      this.aspirationViewModels.push(new InputTextFieldViewModel({
        parent: thiz,
        id: `vmAspiration-${i}`,
        value: thiz.document.driverSystem.aspirations[`_${i}`],
        placeholder: game.i18n.localize(aspirationPlaceholders[i]),
        localizedToolTip: game.i18n.localize("system.character.driverSystem.aspiration.reminder"),
        onChange: (_, newValue) => {
          thiz.document.driverSystem.aspirations[`_${i}`] = newValue;
        },
      }));
    }

    const reactionPlaceholders = [
      "system.character.driverSystem.reaction.placeholder.1",
      "system.character.driverSystem.reaction.placeholder.2",
      "system.character.driverSystem.reaction.placeholder.3",
    ];
    for (let i = 0; i < this.reactions.length; i++) {
      this.reactionViewModels.push(new InputTextFieldViewModel({
        parent: thiz,
        id: `vmReaction-${i}`,
        value: thiz.document.driverSystem.reactions[`_${i}`],
        placeholder: game.i18n.localize(reactionPlaceholders[i]),
        localizedToolTip: game.i18n.localize("system.character.driverSystem.reaction.reminder"),
        onChange: (_, newValue) => {
          thiz.document.driverSystem.reactions[`_${i}`] = newValue;
        },
      }));
    }
  }
    
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(ActorDriversViewModel));
  }

}
