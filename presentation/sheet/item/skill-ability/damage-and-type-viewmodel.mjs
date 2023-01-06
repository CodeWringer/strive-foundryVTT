import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import { isDefined } from "../../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import ChoiceAdapter from "../../../component/input-choice/choice-adapter.mjs";

/**
 * Represents a damage definition, combining both a formula and a damage type. 
 * 
 * @extends ViewModel
 */
export default class DamageAndTypeViewModel extends ViewModel {
  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get damageTypeOptions() { return DAMAGE_TYPES.asChoices; }

  /**
   * @param {Object} args 
   * @param {Object} args.propertyOwner The transient document whose damage definition this is. 
   * @param {Number} args.index The index of this damage definition, in the array of damage 
   * definitions on the `propertyOwner`. 
   * @param {String | undefined} args.localizableDeletionHint 
   * * Default `"ambersteel.damage.delete"`
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyOwner", "index"]);

    this.propertyOwner = args.propertyOwner;
    this.index = args.index;
    this._localizableDeletionHint = args.localizableDeletionHint ?? "ambersteel.damage.delete";

    const thiz = this;
    const factory = new ViewModelFactory();

    this.vmTfDamage = factory.createVmTextField({
      parent: thiz,
      id: "vmTfDamage",
      propertyOwner: this.propertyOwner,
      propertyPath: `damage[${this.index}].damage`,
    });
    this.vmDdDamageType = factory.createVmDropDown({
      parent: thiz,
      id: "vmDdDamageType",
      propertyOwner: this.propertyOwner,
      propertyPath: `damage[${this.index}].damageType`,
      options: thiz.damageTypeOptions,
      adapter: new ChoiceAdapter({
        toChoiceOption(obj) {
          if (isDefined(obj) === true) {
            return DAMAGE_TYPES.asChoices.find(it => it.value === obj.name);
          } else {
            return DAMAGE_TYPES.asChoices.find(it => it.value === "none");
          }
        },
        fromChoiceOption(option) {
          return DAMAGE_TYPES[option.value];
        }
      }),
    });

    this.vmBtnDelete = new ButtonViewModel({
      id: "vmBtnDelete",
      parent: thiz,
      isEditable: thiz.isEditable,
      localizableTitle: this._localizableDeletionHint,
    });
    this.vmBtnDelete.onClick = (html, isOwner, isEditable) => {
      const damage = thiz.propertyOwner.damage;
      damage.splice(thiz.index, 1);
      thiz.propertyOwner.damage = damage;
    };
  }
}
