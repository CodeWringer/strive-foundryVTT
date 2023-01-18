import { SKILL_PROPERTIES } from "../../../../business/document/item/item-properties.mjs";
import { ATTRIBUTES } from "../../../../business/ruleset/attribute/attributes.mjs";
import { isDefined } from "../../../../business/util/validation-utility.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ChoiceAdapter from "../../../component/input-choice/choice-adapter.mjs";
import InputPropertiesViewModel from "../../../component/input-properties/input-properties-viewmodel.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import SkillAbilityTableViewModel from "../skill-ability/skill-ability-table-viewmodel.mjs"
import SkillViewModel from "./skill-viewmodel.mjs";

export default class SkillItemSheetViewModel extends SkillViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_ITEM_SHEET; }

  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get attributeOptions() { return ATTRIBUTES.asChoices; }

  /**
   * Returns true, if the skill ability list should be visible. 
   * @type {Boolean}
   * @readonly
   */
  get isSkillAbilityListVisible() { return (this.isEditable === true) || this.document.abilities.length !== 0 }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * 
   * @param {TransientSkill} args.document 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {String | undefined} args.visGroupId
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.contextTemplate = args.contextTemplate ?? "skill-item-sheet";

    // Child view models. 
    const thiz = this;
    const factory = new ViewModelFactory();

    this.vmImg = factory.createVmImg({
      parent: thiz,
      id: "vmImg",
      propertyOwner: thiz.document,
      propertyPath: "img",
    });
    this.vmTfName = factory.createVmTextField({
      parent: thiz,
      id: "vmTfName",
      propertyOwner: thiz.document,
      propertyPath: "name",
      placeholder: "ambersteel.general.name",
    });
    this.vmBtnSendToChat = factory.createVmBtnSendToChat({
      parent: thiz,
      id: "vmBtnSendToChat",
      target: thiz.document,
      isEditable: thiz.isEditable || thiz.isGM,
    });
    this.vmDdRelatedAttribute = factory.createVmDropDown({
      parent: thiz,
      id: "vmDdRelatedAttribute",
      propertyOwner: thiz.document,
      propertyPath: "relatedAttribute",
      options: thiz.attributeOptions,
      adapter: new ChoiceAdapter({
        toChoiceOption(obj) {
          if (isDefined(obj) === true) {
            return ATTRIBUTES.asChoices.find(it => it.value === obj.name);
          } else {
            return ATTRIBUTES.asChoices.find(it => it.value === "none");
          }
        },
        fromChoiceOption(option) {
          return ATTRIBUTES[option.value];
        }
      }),
    });
    this.vmTfCategory = factory.createVmTextField({
      parent: thiz,
      id: "vmTfCategory",
      propertyOwner: thiz.document,
      propertyPath: "category",
      placeholder: "ambersteel.general.category",
    });
    this.vmSwIsMagicSchool = factory.createVmBtnToggle({
      parent: thiz,
      id: "vmSwIsMagicSchool",
      target: thiz.document,
      propertyPath: "isMagicSchool",
    });
    this.vmRtDescription = factory.createVmRichText({
      parent: thiz,
      id: "vmRtDescription",
      propertyOwner: thiz.document,
      propertyPath: "description",
    });
    this.vmSkillAbilityTable = new SkillAbilityTableViewModel({
      id: "vmSkillAbilityTable",
      parent: thiz,
      isEditable: thiz.isEditable,
      isSendable: thiz.isSendable,
      isOwner: thiz.isOwner,
      document: thiz.document,
      skillAbilitiesInitiallyVisible: true,
      visGroupId: thiz.visGroupId,
    });
    this.vmProperties = new InputPropertiesViewModel({
      id: "vmProperties",
      parent: this,
      propertyPath: "properties",
      propertyOwner: this.document,
      isEditable: this.isEditable,
      systemProperties: SKILL_PROPERTIES.asArray,
    });
  }

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmBtnSendToChat, {
      ...updates.get(this.vmBtnSendToChat),
      isEditable: this.isEditable || this.isGM,
    });

    return updates;
  }
}
