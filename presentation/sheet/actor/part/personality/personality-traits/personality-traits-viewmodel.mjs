import { TEMPLATES } from "../../../../../templatePreloader.mjs";
import { validateOrThrow } from "../../../../../../business/util/validation-utility.mjs";
import InputRadioButtonGroupViewModel from "../../../../../component/input-radio-button-group/input-radio-button-group-viewmodel.mjs";
import ViewModel from "../../../../../view-model/view-model.mjs";
import StatefulChoiceOption from "../../../../../component/input-choice/stateful-choice-option.mjs";

/**
 * @property {Array<Object>} personalityTraits An array of personality traits for display. 
 * These objects must have the following fields: 
 * * `localizedTraitLeft: String`
 * * `vmRadioButtonGroup: InputRadioButtonGroupViewModel`
 * * `localizedTraitRight: String`
 */
export default class PersonalityTraitsViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_PERSONALITY_TRAITS; }

  /** @override */
  get entityId() { return this.document.id; }

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
   * @param {TransientBaseCharacterActor} args.document
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    // Own properties.
    this.document = args.document;

    this.personalityTraits = [
      this._getTrait("arrogant", "humble", "arrogantOrHumble"),
      this._getTrait("cowardly", "courageous", "cowardlyOrCourageous"),
      this._getTrait("cruel", "merciful", "cruelOrMerciful"),
      this._getTrait("deceitful", "honest", "deceitfulOrHonest"),
      this._getTrait("lazy", "energetic", "lazyOrEnergetic"),
      this._getTrait("paranoid", "naive", "paranoidOrNaive"),
      this._getTrait("reckless", "prudent", "recklessOrPrudent"),
      this._getTrait("selfish", "considerate", "selfishOrConsiderate"),
      this._getTrait("vengeful", "forgiving", "vengefulOrForgiving"),
    ];
  }
  
  /**
   * @param {String} leftTrait Name of the left-hand side trait.
   * * E.g. `"arrogant"`
   * @param {String} rightTrait Name of the right-hand side trait.
   * * E.g. `"humble"`
   * @param {String} propertyName Name of the underlying data field. Assumes this field 
   * to be on the `document`'s `personalityTraits` field. 
   * * E.g. `"arrogantOrHumble"`
   * 
   * @returns {Array<Object>}
   * 
   * @private
   */
  _getTrait(leftTrait, rightTrait, propertyName) {
    return {
      localizedTraitLeft: game.i18n.localize(`ambersteel.character.personalityTrait.traits.${leftTrait}`),
      vmRadioButtonGroup: new InputRadioButtonGroupViewModel({
        id: `vmRadioButtonGroup-${propertyName}`,
        parent: this,
        isEditable: this.isEditable,
        propertyOwner: this.document,
        propertyPath: `personalityTraits.${propertyName}`,
        options: this._getTraitOptions(),
      }),
      localizedTraitRight: game.i18n.localize(`ambersteel.character.personalityTrait.traits.${rightTrait}`),
    };
  }

  /**
   * @returns {Array<StatefulChoiceOption>}
   * 
   * @private
   */
  _getTraitOptions() {
    return [
      new StatefulChoiceOption({
        value: -3,
        activeHtml: "X",
        inactiveHtml: "",
      }),
      new StatefulChoiceOption({
        value: -2,
        activeHtml: "X",
        inactiveHtml: "",
      }),
      new StatefulChoiceOption({
        value: -1,
        activeHtml: "X",
        inactiveHtml: "",
      }),
      new StatefulChoiceOption({
        value: 0,
        activeHtml: "X",
        inactiveHtml: "",
      }),
      new StatefulChoiceOption({
        value: 1,
        activeHtml: "X",
        inactiveHtml: "",
      }),
      new StatefulChoiceOption({
        value: 2,
        activeHtml: "X",
        inactiveHtml: "",
      }),
      new StatefulChoiceOption({
        value: 3,
        activeHtml: "X",
        inactiveHtml: "",
      }),
    ];
  }
}
