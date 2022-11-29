import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import SkillItemSheetViewModel from "../../../templates/item/skill/skill-item-sheet-viewmodel.mjs";
import Ruleset from "../../ruleset.mjs";

export default class AmbersteelSkillItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() {
    return TEMPLATES.SKILL_ITEM_SHEET;
  }

  /** @override */
  prepareDerivedData(context) {
    super.prepareDerivedData(context);

    const itemData = context.data.data;
    itemData.groupName = new Ruleset().getAttributeGroupName(itemData.relatedAttribute);
  }

  /** @override */
  activateListeners(html, isOwner, isEditable) {
    super.activateListeners(html, isOwner, isEditable);

    if (!isOwner) return;
    if (!isEditable) return;

    // Add skill ability. 
    html.find(".ambersteel-skill-ability-create").click(this._onCreateSkillAbility.bind(this));

    // Delete skill ability.
    html.find(".ambersteel-skill-ability-delete").click(this._onDeleteSkillAbility.bind(this));
  }
  
  /**
   * @param event 
   * @private
   * @async
   */
  async _onCreateSkillAbility(event) {
    event.preventDefault();
    
    await this.getItem().createSkillAbility();
  }

  /**
   * @param event 
   * @private
   * @async
   */
  async _onDeleteSkillAbility(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const index = parseInt(element.dataset.index);
    
    await this.getItem().deleteSkillAbilityAt(index);
  }

  getViewModel(context) {
    return new SkillItemSheetViewModel({
      id: this.getItem().id,
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      isGM: context.isGM,
      item: this.getItem(),
    });
  }
}