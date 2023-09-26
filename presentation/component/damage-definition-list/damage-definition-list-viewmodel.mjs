import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { isNumber } from "../../../business/util/validation-utility.mjs";
import { getNestedPropertyValue } from "../../../business/util/property-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import DiceRollListViewModel from "../dice-roll-list/dice-roll-list-viewmodel.mjs";
import DamageDefinitionListItemViewModel from "./damage-definition-list-item-viewmodel.mjs";

/**
 * Represents a rollable list of damage definitions. 
 * 
 * @extends ViewModel
 * 
 * @property {Object} propertyOwner The transient document whose damage definition this is. 
 * @property {String} propertyPath The path on the `propertyOwner` by which to identify 
 * the list of damage definitions. 
 * 
 * @property {DiceRollListViewModel} vmList
 * @property {Array<DamageDefinitionListItemViewModel>} damageDefinitionViewModels
 */
export default class DamageDefinitionListViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_DAMAGE_DEFINITION_LIST; }
  
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('damageDefinitionList', `{{> "${DamageDefinitionListViewModel.TEMPLATE}"}}`);
  }

  /**
   * @type {Array<DamageAndType>}
   * @readonly
   */
  get damageDefinitions() { return getNestedPropertyValue(this.propertyOwner, this.propertyPath); }

  /**
   * @type {Array<DamageDefinitionListItemViewModel>}
   * @readonly
   */
  damageDefinitionViewModels = [];

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * @param {Object | TransientDocument} args.propertyOwner The transient document whose damage definition this is. 
   * @param {String} args.propertyPath The path on the `propertyOwner` by which to identify 
   * the list of damage definitions. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyOwner", "propertyPath"]);

    this.propertyOwner = args.propertyOwner;
    this.propertyPath = args.propertyPath;

    const thiz = this;

    const damageDefinitions = this.damageDefinitions;
    for (let i = 0; i < damageDefinitions.length; i++) {
      const damageDefinition = damageDefinitions[i];

      const vm = new DamageDefinitionListItemViewModel({
        id: `vmDamageDefinition-${i}`,
        parent: thiz,
        isEditable: thiz.isEditable,
        isSendable: thiz.isSendable,
        isOwner: thiz.isOwner,
        isGM: thiz.isGM,
        contextTemplate: this.contextTemplate,
        propertyOwner: thiz.propertyOwner,
        index: i,
        resolveFormula: () => {
          // At this point, the string may contain `@`-references. These must be resolved. 
          let resolvedDamage = damageDefinition.damage;

          const owningDocument = thiz._getRootOwningDocument(thiz.propertyOwner);
          let resolvedReferences;

          // Resolve references. 
          if (owningDocument !== undefined) {
            resolvedReferences = owningDocument.resolveReferences(damageDefinition.damage);
          } else if (thiz.propertyOwner.resolveReferences !== undefined) {
            resolvedReferences = thiz.propertyOwner.resolveReferences(damageDefinition.damage);
          }

          if (resolvedReferences !== undefined) {
            for (const [key, value] of resolvedReferences) {
              // Skip unresolvable values. These are returned as-is. 
              if (value === undefined) continue;

              // This replaces every reference of the current type, e. g. `"@strength"` with the 
              // current level or value of the thing, if possible. 
              // If a value cannot be determined, it will default to "0". 
              const regExpReplace = new RegExp(key, "gi");
              const replaceValue = ((value.modifiedLevel ?? value.level) ?? value.value) ?? (isNumber(value) === true ? value : "0");
              resolvedDamage = resolvedDamage.replace(regExpReplace, replaceValue);
            }
          }

          return resolvedDamage;
        },
      });
      this.damageDefinitionViewModels.push(vm);
    }

    this.vmList = new DiceRollListViewModel({
      id: `vmList`,
      parent: thiz,
      isEditable: thiz.isEditable,
      isSendable: thiz.isSendable,
      isOwner: thiz.isOwner,
      isGM: thiz.isGM,
      formulaViewModels: thiz.damageDefinitionViewModels,
      formulaListItemTemplate: DamageDefinitionListItemViewModel.TEMPLATE,
      chatMessageTemplate: TEMPLATES.DICE_ROLL_DAMAGE_CHAT_MESSAGE,
      chatTitle: `${game.i18n.localize("ambersteel.damageDefinition.label")} - ${thiz.propertyOwner.name}`,
    });
  }

  /**
   * Returns the root owning document of the given document. 
   * 
   * @param {TransientDocument} document 
   * 
   * @returns {TransientDocument}
   */
  _getRootOwningDocument(document) {
    if (document.owningDocument !== undefined) {
      return this._getRootOwningDocument(document.owningDocument);
    } else {
      return document;
    }
  }
}
