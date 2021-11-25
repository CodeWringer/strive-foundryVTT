import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";
import * as ButtonToggleSkillAbilityList from '../../../components/button-toggle-skill-ability-list.mjs';

export default class AmbersteelSkillItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() {
    return "systems/ambersteel/templates/item/skill/skill-item-sheet.hbs";
  }

  /** @override */
  prepareDerivedData(context) {
    super.prepareDerivedData(context);

    const itemData = context.data.data;

    itemData.isExpanded = itemData.isExpanded ?? false;
    itemData.isExpandable = itemData.isExpandable ?? true;

    itemData.groupName = game.ambersteel.getAttributeGroupName(itemData.relatedAttribute);
  }

  /** @override */
  activateListeners(html, isOwner, isEditable) {
    super.activateListeners(html, isOwner, isEditable);
    ButtonToggleSkillAbilityList.activateListeners(html, this, isOwner, isEditable);

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
    
    await this.getItem().deleteSkillAbilityAt(index);
    this.parent.render();
  }
}