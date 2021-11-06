import { getAttributeGroupName } from '../../../utils/attribute-utility.mjs';
import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";

export default class AmbersteelSkillItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() {
    return "systems/ambersteel/templates/item/skill-item-sheet.hbs";
  }

  /** @override */
  prepareDerivedData(context) {
    super.prepareDerivedData(context);

    const itemData = context.data.data;

    itemData.isExpanded = itemData.isExpanded ?? false;
    itemData.isExpandable = itemData.isExpandable ?? true;

    itemData.groupName = getAttributeGroupName(itemData.relatedAttribute);
  }

  /** @override */
  activateListeners(html, isOwner, isEditable) {
    super.activateListeners(html, isOwner, isEditable);

    // Show skill abilities. 
    html.find(".ambersteel-expand-skill-ability-list").click(this._onExpandSkillAbilityList.bind(this));

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
  async _onExpandSkillAbilityList(event) {
    event.preventDefault();

    await this.getItem().subType.toggleSkillAbilityListVisible();
    this.parent.render();
  }

  /**
   * @param event 
   * @private
   * @async
   */
  async _onCreateSkillAbility(event) {
    event.preventDefault();
    
    await this.getItem().subType.createSkillAbility();
    this.parent.render();
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
    
    await this.getItem().subType.deleteSkillAbilityAt(index);
    this.parent.render();
  }
}