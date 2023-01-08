import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
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
 * @property {String | undefined} hintId Id of the info bubble elements that inform 
 * the user about formula references. 
 * 
 * @property {DiceRollListViewModel} vmList
 * @property {Array<DamageDefinitionListItemViewModel>} damageDefinitionViewModels
 */
export default class DamageDefinitionListViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_DAMAGE_DEFINITION_LIST; }
  
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
   * @param {Object} args.propertyOwner The transient document whose damage definition this is. 
   * @param {String} args.propertyPath The path on the `propertyOwner` by which to identify 
   * the list of damage definitions. 
   * @param {String | undefined} hintId Id of the info bubble elements that inform 
   * the user about formula references. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyOwner", "propertyPath"]);

    this.propertyOwner = args.propertyOwner;
    this.propertyPath = args.propertyPath;
    this.hintId = args.hintId;

    const thiz = this;

    const damageDefinitions = this.damageDefinitions;
    for (let i = 0; i < damageDefinitions.length; i++) {
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
        hintId: thiz.hintId,
        resolveFormula: () => {

          // TODO
        //   await new VisibilitySingleChoiceDialog({
        //     closeCallback: async (dialog) => {
        //       if (dialog.confirmed !== true) return;
        //       // This is the total across all damage definitions. 
        //       let damageTotal = 0;
  
        //       // Build roll array. 
        //       const rolls = [];
        //       for (const damageDefinition of thiz.skillAbility.damage) {
        //         // At this point, the string may contain `@`-references. These must be resolved. 
        //         let resolvedDamage = damageDefinition.damage;
  
        //         if (thiz.skillAbility.owningDocument !== undefined) {
        //           // Resolve references. 
        //           // If the skill (which is the ability's owning document) has a parent (= an actor document), 
        //           // resolve references on that document, instead of the skill document. 
        //           let resolvedReferences;
        //           if (thiz.skillAbility.owningDocument.owningDocument !== undefined) {
        //             resolvedReferences = thiz.skillAbility.owningDocument.owningDocument.resolveReferences(damageDefinition.damage)
        //           } else {
        //             resolvedReferences = thiz.skillAbility.owningDocument.resolveReferences(damageDefinition.damage)
        //           }
  
        //           for (const [key, value] of resolvedReferences) {
        //             // This replaces every reference of the current type, e. g. `"@strength"` with the 
        //             // current level or value of the thing, if possible. 
        //             // If a value cannot be determined, it will default to "0". 
        //             const regExpReplace = new RegExp(key, "gi");
    
        //             const replaceValue = (value.level ?? value.value) ?? (isNumber(value) === true ? value : "0");
    
        //             resolvedDamage = resolvedDamage.replace(regExpReplace, replaceValue);
        //           }
        //         }
  
        //         // Get evaluated roll of damage formula. 
        //         const rollResult = new Roll(resolvedDamage);
        //         await rollResult.evaluate({ async: true });
  
        //         damageTotal += parseFloat(rollResult.total);
  
        //         // Get an array of each dice term. 
        //         const diceResults = [];
        //         for (const term of rollResult.terms) {
        //           if (term.values !== undefined) {
        //             for (const value of term.values) {
        //               diceResults.push({
        //                 value: value,
        //                 isDiceResult: true,
        //               });
        //             }
        //           } else {
        //             diceResults.push({
        //               value: term.total,
        //               isDiceResult: false,
        //             });
        //           }
        //         }
  
        //         // Get localized damage type. 
        //         const localizedDamageType = game.i18n.localize(damageDefinition.damageType.localizableName);
  
        //         rolls.push({
        //           damage: rollResult.total,
        //           localizedDamageType: localizedDamageType,
        //           diceResults: diceResults,
        //         });
        //       }
  
        //       // Determine title
        //       const title = `${game.i18n.localize("ambersteel.damageDefinition.label")} - ${thiz.skillAbility.name}`;
  
        //       // Render the results. 
        //       const renderedContent = await renderTemplate(TEMPLATES.DICE_ROLL_DAMAGE_CHAT_MESSAGE, {
        //         damageTotal: damageTotal,
        //         rolls: rolls,
        //         title: title,
        //       });
  
        //       return ChatUtil.sendToChat({
        //         renderedContent: renderedContent,
        //         actor: owningDocument.parent,
        //         sound: SOUNDS_CONSTANTS.DICE_ROLL,
        //         visibilityMode: dialog.visibilityMode
        //       });
        //     },
        //   }).renderAndAwait(true);
        // },
          return "5 + 3D3";
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
}

Handlebars.registerPartial('damageDefinitionList', `{{> "${DamageDefinitionListViewModel.TEMPLATE}"}}`);
