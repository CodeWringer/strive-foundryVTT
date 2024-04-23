import { ROLL_TYPES } from "../../../../../business/dice/roll-types.mjs";
import { GameSystemActor } from "../../../../../business/document/actor/actor.mjs";
import TransientBaseCharacterActor from "../../../../../business/document/actor/transient-base-character-actor.mjs";
import ChallengeRating from "../../../../../business/ruleset/attribute/challenge-rating.mjs";
import { Sum, SumComponent } from "../../../../../business/ruleset/summed-data.mjs";
import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs";
import ButtonRollViewModel from "../../../../component/button-roll/button-roll-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import { TEMPLATES } from "../../../../templatePreloader.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";

/**
 * @extends ViewModel
 * 
 * @property {challengeRating} challengeRating The challenge rating. Changing this value invokes 
 * the `onChallengeRatingChanged` callback. 
 * @property {String} localizedLabel Returns the localized name of the attribute group. 
 * @property {String | undefined} iconClass CSS class of the icon to display. 
 * E. g. `"ico-strongarm-solid"` or `"fas fa-brain"`
 * @method onClicked Callback that is invoked when the element is clicked. 
 * @method onChallengeRatingChanged Callback that is invoked when the challenge 
 * rating value changes. 
 */
export default class ChallengeRatingViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.CHALLENGE_RATING; }

  get challengeRating() { return this._challengeRating; }
  set challengeRating(value) {
    const oldValue = this._challengeRating;
    this._challengeRating = value;
    this.onChallengeRatingChanged(oldValue, value);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {ChallengeRating} args.challengeRating
   * @param {String} args.localizedLabel
   * @param {String | undefined} args.iconClass CSS class of the icon to display. 
   * E. g. `"ico-strongarm-solid"` or `"fas fa-brain"`
   * @param {Function | undefined} args.onClicked Callback that is invoked when 
   * the element is clicked. 
   * @param {Function | undefined} args.onChallengeRatingChanged Callback that 
   * is invoked when the challenge rating modifier value changes. 
   * @param {TransientBaseCharacterActor | undefined} args.actor The actor whose challenge 
   * rating this is. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["challengeRating", "localizedLabel"]);

    this._challengeRating = args.challengeRating;
    this.localizedLabel = args.localizedLabel;
    this.iconClass = args.iconClass;
    this.onClicked = args.onClicked ?? (() => {});
    this.onChallengeRatingChanged = args.onChallengeRatingChanged ?? (() => {});
    this.actor = args.actor;

    this.vmRoll = new ButtonRollViewModel({
      id: "vmRoll",
      parent: this,
      target: this,
      rollType: ROLL_TYPES.dicePool.name,
      localizedToolTip: game.i18n.localize("system.roll.doRoll"),
      primaryChatTitle: this.localizedLabel,
      primaryChatImage: (this.actor ?? {}).img,
      secondaryChatTitle: (this.actor ?? {}).name,
    });
    this.vmCr = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmCr",
      value: this.challengeRating.value,
      onChange: (_, newValue) => {
        const newChallengeRating = new ChallengeRating({
          value: newValue,
          modifier: this.challengeRating.modifier,
        });
        this.challengeRating = newChallengeRating;
      },
      min: 0,
    });
    this.vmCrModifier = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmCrModifier",
      value: this.challengeRating.modifier,
      onChange: (_, newValue) => {
        const newChallengeRating = new ChallengeRating({
          value: this.challengeRating.value,
          modifier: newValue,
        });
        this.challengeRating = newChallengeRating;
      },
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(`#${this.id}-header`).click(() => {
      this.onClicked();
    });
  }
  
  /**
   * Returns the component(s) to do a roll using this challenge rating. 
   * 
   * @returns {Sum}
   */
  getRollData() {
    return new Sum([
      new SumComponent(this.id, this.localizedLabel, this.challengeRating.modified)
    ]);
  }
}
