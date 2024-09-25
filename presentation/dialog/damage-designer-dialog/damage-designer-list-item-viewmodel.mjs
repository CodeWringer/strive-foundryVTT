import RollFormulaResolver from "../../../business/dice/roll-formula-resolver.mjs";
import AtReferencer from "../../../business/referencing/at-referencer.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import { DamageFinding } from "./damage-finding.mjs";

export default class DamageDesignerListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.DIALOG_DAMAGE_DESIGNER_LIST_ITEM; }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id
   * @param {ViewModel | undefined} args.parent
   * @param {DamageFinding} args.damageFinding
   */
  constructor(args = {}) {
    super(args);

    validateOrThrow(args, ["damageFinding"]);

    this.damageFinding = args.damageFinding;
    this.formula = this.damageFinding.getFullFormulaForDisplay();
    this.minDamage = this._getMinDamageForDisplay();
    this.meanDamage = this._getMeanDamageForDisplay();
    this.maxDamage = this._getMaxDamageForDisplay();
  }

  /**
   * @returns {String}
   * 
   * @private
   */
  _getMinDamageForDisplay() {
    const n = this.damageFinding.getMinDamage();
    if (n > 0) {
      return n;
    }
    return "";
  }

  /**
   * @returns {String}
   * 
   * @private
   */
  _getMeanDamageForDisplay() {
    const n = this.damageFinding.getMeanDamage();
    if (n > 0) {
      return n;
    }
    return "";
  }

  /**
   * @returns {String}
   * 
   * @private
   */
  _getMaxDamageForDisplay() {
    const n = this.damageFinding.getMaxDamage();
    if (n > 0) {
      return n;
    }
    return "";
  }

  /**
   * Returns a render of the template with this view model instance as its basis. 
   * 
   * @returns {String}
   */
  async render() {
    return await renderTemplate(DamageDesignerListItemViewModel.TEMPLATE, {
      viewModel: this,
    });
  }
}
