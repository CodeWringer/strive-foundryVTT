import { ATTRIBUTES } from "../../../../business/model/domain/const/attributes.mjs";
import { Skill } from "../../../../business/model/domain/skill/skill.mjs";
import { Sum, SumComponent } from "../../../../business/model/domain/summed-data.mjs";
import { ArrayUtil } from "../../../../common/util/array-utility.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import ChoiceOption from "../../../model/choice-option.mjs";
import { DOCUMENT_CONTEXT } from "../../../model/document-context.mjs";
import { ChoicesUtil } from "../../../util/choices-utility.mjs";
import AbilityLevelViewModel from "../../component/ability-level/ability-level-viewmodel.mjs";
import InputDropDownViewModel from "../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import BaseItemHeaderViewModel from "../base/base-item-header-viewmodel.mjs";

export default class SkillHeaderViewModel extends BaseItemHeaderViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.skill.header; }

  /** @override */
  get clazz() { return SkillHeaderViewModel; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is in edit mode. 
   * 
   * @param {TransientSkill} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   * @param {DOCUMENT_CONTEXT | undefined} args.context 
   * * default `DOCUMENT_CONTEXT.independent`
   */
  constructor(args = {}) {
    super(args);

    const diceCount = this.#getRollableDiceCount();
    this.vmLevel = new AbilityLevelViewModel({
      id: "vmLevel",
      parent: this,
      value: this.document.level,
      diceCount: diceCount.total,
      levelToolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.skill.level"),
      }),
      rollButtonToolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.skill.roll"),
      }),
      onChange: (newValue) => {
        this.document.level = newValue;
      },
      onRoll: () => {
        // TODO #762
      },
    });

    this.vmBaseAttributes = new ViewModel({
      id: "vmBaseAttributes",
      parent: this,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.skill.baseAttribute.baseAttributes"),
      }),
    });
    const attributeOptions = this.#getAttributeChoices();
    this.baseAttributeVms = [];
    for (let i = 0; i < Skill.baseAttributeCount; i++) {
      let value = attributeOptions[0];

      if ((this.document.baseAttributes ?? []).length > i) {
        value = attributeOptions.find(it => it.value === this.document.baseAttributes[i].name);
      }

      this.baseAttributeVms.push(new InputDropDownViewModel({
        id: `vmAttribute-${i}`,
        parent: this,
        value: value,
        options: attributeOptions,
        onChange: (newValue) => {
          const newAttributes = (this.document.baseAttributes ?? []).concat([]);
          while (newAttributes.length <= i) {
            newAttributes.push(ATTRIBUTES.agility);
          }
          newAttributes[i] = ATTRIBUTES[newValue.value];
          this.document.baseAttributes = newAttributes;
        },
      }));
    }
  }

  /**
   * @returns {Sum}
   * @private
   */
  #getRollableDiceCount() {
    const sumComps = [];
    if (ValidationUtil.isDefined(this.document.owningDocument)) {
      for (const attribute of this.document.baseAttributes) {
        const level = (this.document.owningDocument.attributes.find(it => it.name === attribute.name)).level;
        sumComps.push(new SumComponent(attribute.name, attribute.localizableName, level));
      }
    }
    return new Sum(sumComps);
  }

  /**
   * @returns {Array<ChoiceOption>}
   * @private
   */
  #getAttributeChoices() {
    const r = [];
    for (const key in ATTRIBUTES) {
      if (!Object.hasOwn(ATTRIBUTES, key)) continue;
      if (ArrayUtil.arrayContains(ChoicesUtil._defaultExcludes, key)) continue;

      const attribute = ATTRIBUTES[key];
      r.push(new ChoiceOption({
        value: attribute.name,
        localizedValue: StringUtil.getLoca(attribute.localizableAbbreviation),
      }));
    }
    return r;
  }
}
