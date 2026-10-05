import Expertise from "../../../../business/model/domain/skill/expertise.mjs";
import { Sum, SumComponent } from "../../../../business/model/domain/summed-data.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import { DOCUMENT_CONTEXT } from "../../../model/document-context.mjs";
import AbilityLevelViewModel from "../../component/ability-level/ability-level-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import BaseItemHeaderViewModel from "../base/base-item-header-viewmodel.mjs";

export default class ExpertiseHeaderViewModel extends BaseItemHeaderViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.expertise.header; }

  /** @override */
  get clazz() { return ExpertiseHeaderViewModel; }

  get apCost() { return this.document.actionPoints.current ?? 0; }
  get hasApCost() { return this.document.actionPoints.enabled ?? false; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is in edit mode. 
   * 
   * @param {Expertise} args.document The represented transient document instance. 
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
        localized: StringUtil.getLoca("system.item.expertise.level"),
      }),
      rollButtonToolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.expertise.roll"),
      }),
      onChange: (newValue) => {
        this.document.level = newValue;
      },
      onRoll: () => {
        // TODO #762
      },
    });

    this.vmActionPoints = new ViewModel({
      id: "vmActionPoints",
      parent: this,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.expertise.actionPoints"),
      }),
    });
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
}
