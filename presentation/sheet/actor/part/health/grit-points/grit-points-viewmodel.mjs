import { ACTOR_TYPES } from "../../../../../../business/document/actor/actor-types.mjs";
import TransientBaseCharacterActor from "../../../../../../business/document/actor/transient-base-character-actor.mjs";
import { ValidationUtil } from "../../../../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../../../../component/button/button-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import DynamicInputDefinition from "../../../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import ViewModel from "../../../../../view-model/view-model.mjs";
import GritPoint from "./grit-point.mjs";

/**
 * Represents the grit points bar on a character sheet. 
 * 
 * @extends ViewModel
 * 
 * @property {TransientBaseCharacterActor} document 
 * @property {Number} gritPointLimit 
 * * read-only
 * @property {Array<GritPoint>} gritPoints 
 */
export default class GritPointsViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_GRIT_POINTS; }

  /**
   * @type {Number}
   * @readonly
   */
  get gritPointLimit() { return 10; }

  /**
   * Returns true, if the grit points list should be visible. 
   * 
   * This is the case, when the owning character has at least one injury. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get shouldBeVisible() {
    if (this.document.type === ACTOR_TYPES.NPC && this.document.gritPoints.enable !== true) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * @param {Object} args The arguments object. 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * 
   * If no value is provided, a shortened UUID will be generated for it. 
   * 
   * This string may not contain any special characters! Alphanumeric symbols, as well as hyphen ('-') and 
   * underscore ('_') are permitted, but no dots, brackets, braces, slashes, equal sign, and so on. Failing to comply to this 
   * naming restriction may result in DOM elements not being properly detected by the `activateListeners` method. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * Default `false`. 
   * @param {TransientBaseCharacterActor} args.document 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.document = args.document;

    const thiz = this;

    const currentGritPoints = this.document.gritPoints.current;
    this.gritPoints = [];
    for (let i = 0; i < currentGritPoints; i++) {
      this.gritPoints.push(new GritPoint({
        id: `${this.id}-${i}`,
        active: i < currentGritPoints,
        value: i + 1,
      }));
    }

    this.vmGritPointsIcon = new ViewModel({
      id: "vmGritPointsIcon",
      parent: this,
      localizedToolTip: this.showReminders ?
        `${game.i18n.localize("system.character.gritPoint.plural")}<br>${game.i18n.localize("system.character.gritPoint.tooltip")}`
        : game.i18n.localize("system.character.gritPoint.plural"),
    });
    this.vmGritPointsSpinner = new InputNumberSpinnerViewModel({
      id: "vmGritPointsSpinner",
      parent: this,
      value: this.document.gritPoints.current,
      min: 0,
      localizedToolTip: game.i18n.localize("system.character.gritPoint.plural"),
      onChange: (_, newValue) => {
        this.document.gritPoints.current = newValue;
      },
    });
    this.vmAdjust = new ButtonViewModel({
      id: "vmAdjust",
      parent: this,
      localizedToolTip: game.i18n.localize("system.character.gritPoint.adjust"),
      iconHtml: '<i class="fas fa-edit" style="height: 22px;"></i>',
      onClick: async () => {
        const inputNumber = "inputNumber";
        const dialog = await new DynamicInputDialog({
          easyDismissal: true,
          focused: inputNumber,
          inputDefinitions: [
            new DynamicInputDefinition({
              name: inputNumber,
              localizedLabel: game.i18n.localize("system.character.gritPoint.adjustInputLabel"),
              template: InputNumberSpinnerViewModel.TEMPLATE,
              viewModelFactory: (id, parent) => new InputNumberSpinnerViewModel({
                id: id,
                parent: parent,
                value: 0,
              }),
              required: true,
              validationFunc: (value) => { return parseInt(value) !== NaN; },
            }),
          ],
        }).renderAndAwait(true);

        if (dialog.confirmed !== true) return;

        const number = parseInt(dialog[inputNumber]);
        const newValue = thiz.document.gritPoints.current + number;
        const clampedValue = Math.max(0, newValue);
        thiz.document.gritPoints.current = clampedValue;
      },
    });
  }
}
