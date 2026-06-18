import { ValidationUtil } from "../../../../common/util/validation-utility.mjs"
import InputTextFieldViewModel from "../../../../presentation/component/input-textfield/input-textfield-viewmodel.mjs"
import DynamicInputDefinition from "../../../../presentation/dialog/dynamic-input-dialog/dynamic-input-definition.mjs"
import DynamicInputDialog from "../../../../presentation/dialog/dynamic-input-dialog/dynamic-input-dialog.mjs"
import { ITEM_TYPES } from "../item/item-types.mjs"
import TransientSkill from "../item/skill/transient-skill.mjs"
import DocumentCreationStrategy from "./document-creation-strategy.mjs"

/**
 * Adds a new, blank Expertise to the given `target` skill document instance. 
 * 
 * Does not prompt for anything and can not be canceled. 
 * 
 * @property {TransientBaseActor | undefined} target The Actor document instance on which 
 * to embed the new document instance. 
 * @property {Object | undefined} creationDataOverrides Overrides applied to the selected 
 * creation data. Can be used to override a specific property, while leaving 
 * the others untouched. For example, to set a starting level for a skill Item. 
 * 
 * @extends DocumentCreationStrategy
 */
export default class ExpertiseCreationStrategy extends DocumentCreationStrategy {
  /**
   * @param {Object} args 
   * @param {TransientSkill} args.target The skill document instance to which to add 
   * a new blank Expertise. 
   * @param {Object | undefined} args.creationDataOverrides Overrides applied to the selected 
   * creation data. Can be used to override a specific property, while leaving 
   * the others untouched. For example, to set a starting level for a skill Item. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["target"]);
  }

  /** @override */
  async selectAndCreate() {
    if (this.target.type !== ITEM_TYPES.SKILL) {
      throw new Error("InvalidArgumentException: Cannot add item of type 'expertise' to non-'skill'-type item!");
    }

    const inputName = "inputName";
    const dialog = await new DynamicInputDialog({
      id: "expertise-creation-strategy-dialog",
      localizedTitle: game.i18n.localize("system.character.skill.expertise.createExpertise"),
      inputDefinitions: [
        new DynamicInputDefinition({
          name: inputName,
          localizedLabel: game.i18n.localize("system.general.name.label"),
          template: InputTextFieldViewModel.TEMPLATE,
          viewModelFactory: async (id, parent, overrides) => {
            return new InputTextFieldViewModel({
              id: id,
              parent: parent,
              value: game.i18n.localize("system.character.skill.expertise.newDefaultName"),
              ...overrides,
            });
          },
        }),
      ],
      focused: inputName,
    }).renderAndAwait(true);

    if (dialog.confirmed !== true) return undefined;

    const creationData = {
      isCustom: true,
      name: dialog[inputName],
    };

    return await this.target.createExpertise(creationData);
  }
}
