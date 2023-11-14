import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs";
import InputNumberSpinnerViewModel from "../../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import { TEMPLATES } from "../../../../templatePreloader.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";

/**
 * @extends ViewModel
 * 
 * @property {Number} challengeRating The challenge rating. Changing this value invokes 
 * the `onChallengeRatingChanged` callback. 
 * @property {String} localizedLabel Returns the localized name of the attribute group. 
 * * Read-only
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
   * @param {Number} args.challengeRating
   * @param {String} args.localizedLabel
   * @param {Function | undefined} args.onClicked Callback that is invoked when 
   * the element is clicked. 
   * @param {Function | undefined} args.onChallengeRatingChanged Callback that 
   * is invoked when the challenge rating value changes. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["challengeRating", "localizedLabel"]);

    this._challengeRating = args.challengeRating;
    this.localizedLabel = args.localizedLabel;
    this.onClicked = args.onClicked ?? (() => {});
    this.onChallengeRatingChanged = args.onChallengeRatingChanged ?? (() => {});

    this.vmCr = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmCr",
      value: this.challengeRating,
      onChange: (_, newValue) => {
        this.challengeRating = newValue;
      },
      min: 0,
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(`#${this.id}-header`).click(() => {
      this.onClicked();
    });
  }
}