import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import { DamageFinding } from "./damage-finding.mjs";

export default class DamageFindingListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.DIALOG_DAMAGE_FINDING_LIST_ITEM; }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id
   * @param {ViewModel | undefined} args.parent
   * @param {DamageFinding} args.damageFinding
   * @param {String | undefined} args.damageFindingName
   */
  constructor(args = {}) {
    super(args);

    ValidationUtil.validateOrThrow(args, ["damageFinding"]);

    this.damageFinding = args.damageFinding;
    this.damageFindingName = args.damageFindingName ?? this.damageFinding.name;
    this.formula = this.damageFinding.getJoinedFormulaeForDisplay();
    this.evaluatedDamage = this.damageFinding.evaluate();
  }

  /**
   * Returns a render of the template with this view model instance as its basis. 
   * 
   * @returns {String}
   */
  async render() {
    return await renderTemplate(DamageFindingListItemViewModel.TEMPLATE, {
      viewModel: this,
    });
  }
}
