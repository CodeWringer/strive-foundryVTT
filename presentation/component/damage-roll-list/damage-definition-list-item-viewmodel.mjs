import { DAMAGE_TYPES } from "../../../business/ruleset/damage-types.mjs"
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { isDefined } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ViewModelFactory from "../../view-model/view-model-factory.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import ChoiceAdapter from "../input-choice/choice-adapter.mjs";

/**
 * Represents the definition of a damage roll formula. 
 * 
 * @extends ViewModel
 * 
 * @property {Array<ChoiceOption>} damageTypeOptions An array of damage type choices. 
 * * Read-only.
 * @property {Object} propertyOwner The transient document whose damage definition this is. 
 * @property {Number} index The index of this damage definition, in the array of damage 
 * definitions on the `propertyOwner`. 
 * 
 * @property {ViewModel} vmTfDamage
 * @property {ViewModel} vmDdDamageType
 * @property {ViewModel} vmBtnDelete
 */
export default class DamageDefinitionListItemViewModel extends ViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_ROLL_DAMAGE_LIST_ITEM; }

  /**
   * Returns an array of damage type choices. 
   * 
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get damageTypeOptions() { return DAMAGE_TYPES.asChoices; }
  
  /**
   * Returns the localization key of the deletion button hint. 
   * 
   * @type {String}
   * @readonly
   */
  get localizableDeletionHint() { return "ambersteel.damageDefinition.delete"; }
  
  /**
   * Returns the id of the parent view model instance. 
   * 
   * @type {String}
   * @readonly
   */
  get parentId() { return this.parent.id; }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * @param {Object} args.propertyOwner The transient document whose damage definition this is. 
   * @param {Number} args.index The index of this damage definition, in the array of damage 
   * definitions on the `propertyOwner`. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyOwner", "index"]);

    this.propertyOwner = args.propertyOwner;
    this.index = args.index;

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
      onClick: async (html, isOwner, isEditable) => {
        const damage = thiz.propertyOwner.damage;
        damage.splice(thiz.index, 1);
        thiz.propertyOwner.damage = damage;
      },
    });
  }
}

Handlebars.registerPartial('damageDefinitionListItem', `{{> "${DamageDefinitionListItemViewModel.TEMPLATE}"}}`);
