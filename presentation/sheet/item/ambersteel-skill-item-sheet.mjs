import SkillItemSheetViewModel from "../../template/item/skill/skill-item-sheet-viewmodel.mjs";
import { TEMPLATES } from "../../template/templatePreloader.mjs";
import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";
import { ITEM_SHEET_SUBTYPE } from "./item-sheet-subtype.mjs";

export default class AmbersteelSkillItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() { return TEMPLATES.SKILL_ITEM_SHEET; }

  /** @override */
  get title() { return game.i18n.localize("ambersteel.character.skill.singular"); }

  getViewModel(context, item) {
    return new SkillItemSheetViewModel({
      id: item.id,
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      isGM: context.isGM,
      item: item,
    });
  }
}

ITEM_SHEET_SUBTYPE.set("skill", new AmbersteelSkillItemSheet());
