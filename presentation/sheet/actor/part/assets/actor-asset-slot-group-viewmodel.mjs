import * as StringUtil from "../../../../../business/util/string-utility.mjs";
import { createUUID } from "../../../../../business/util/uuid-utility.mjs";
import { isDefined } from "../../../../../business/util/validation-utility.mjs";
import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs";
import ButtonContextMenuViewModel from "../../../../component/button-context-menu/button-context-menu-viewmodel.mjs";
import ButtonViewModel from "../../../../component/button/button-viewmodel.mjs";
import ChoiceAdapter from "../../../../component/input-choice/choice-adapter.mjs";
import ChoiceOption from "../../../../component/input-choice/choice-option.mjs";
import DynamicInputDefinition from "../../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../../../dialog/dynamic-input-dialog/dynamic-input-types.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";

/**
 * @extends ViewModel
 */
export default class ActorAssetSlotGroupViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_ASSET_SLOT_GROUP; }

  /**
   * @type {String}
   * @readonly
   */
  get localizedName() {
    const name = this.group.name.toLowerCase();
    if (name === "hand") {
      return game.i18n.localize("ambersteel.character.asset.slot.hand");
    } else if (name === "clothing") {
      return game.i18n.localize("ambersteel.character.asset.slot.clothing");
    } else if (name === "armor") {
      return game.i18n.localize("ambersteel.character.asset.slot.armor");
    } else if (name === "back") {
      return game.i18n.localize("ambersteel.character.asset.slot.back");
    } else {
      return this.group.name;
    }
  }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hasFreeSlot() {
    for (const slot of this.group.slots) {
      if (isDefined(slot.alottedId) === false) {
        return true;
      }
    }
    return false;
  }

  /**
   * @type {String}
   * @readonly
   */
  get localizedAddSlotLabel() { return game.i18n.localize("ambersteel.character.asset.slot.add.label"); }
  
  /**
   * @type {Array<TransientAsset>}
   * @readonly
   */
  get availableAssets() {
    return this.group.actor.assets.luggage.concat(this.group.actor.assets.property);
  }
  
  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {CharacterAssetSlotGroup} args.group
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["group"]);

    this.group = args.group;
    const thiz = this;

    this.choiceAdapter = new ChoiceAdapter({
      toChoiceOption: (obj) => {
        return new ChoiceOption({
          value: obj.id,
          localizedValue: obj.name,
        });
      },
      fromChoiceOption: (option) => {
        return thiz.availableAssets.find(it => it.id === option.value);
      },
    });

    this.vmBtnEdit = new ButtonContextMenuViewModel({
      id: "vmBtnEdit",
      parent: this,
      isSendable: this.isSendable,
      isEditable: this.isEditable,
      isOwner: this.isOwner,
      menuItems: [
        {
          name: game.i18n.localize("ambersteel.character.asset.slot.add.label"),
          icon: '<i class="fas fa-plus"></i>',
          condition: () => { return true; },
          callback: async () => {
            thiz._queryAddSlot();
          },
        }
      ],
    });
    this.vmBtnAssign = new ButtonViewModel({
      id: "vmBtnAssign",
      parent: this,
      isSendable: this.isSendable,
      isEditable: this.isEditable,
      isOwner: this.isOwner,
      target: this.document,
      localizableTitle: "ambersteel.character.asset.slot.assign.label",
      onClick: async () => {
        const inputChoices = "inputChoices";

        const dialog = await new DynamicInputDialog({
          localizedTitle: StringUtil.format(
            game.i18n.localize("ambersteel.general.input.queryFor"), 
            game.i18n.localize("ambersteel.character.asset.slot.label"), 
          ),
          inputDefinitions: [
            new DynamicInputDefinition({
              type: DYNAMIC_INPUT_TYPES.DROP_DOWN,
              name: inputChoices,
              localizableLabel: "ambersteel.character.asset.slot.name",
              required: true,
              defaultValue: undefined,
              options: this._getAssetsAsChoices(),
              adapter: this.choiceAdapter,
            }),
          ],
        }).renderAndAwait(true);
        
        if (dialog.confirmed !== true) return;
        

        // this.document.addEquipmentAssetSlot({
        //   customName: dialog[inputNameCustomName],
        //   acceptedTypes: dialog[inputNameAcceptedTypes],
        // });
      },
    });
  }

  /**
   * Returns all luggage and property from the group's parent actor. 
   * 
   * @returns {Array<TransientAsset>}
   * 
   * @private
   */
  _getAssetsAsChoices() {
    const result = [];
    const assets = this.availableAssets;

    for (const asset of assets) {
      result.push(this.choiceAdapter.toChoiceOption(asset));
    }

    return result;
  }

  /**
   * Queries the user for data for a new asset slot to add to the represented 
   * asset slot group. 
   * 
   * If the user confirms, the asset slot is created and added to the group. 
   * 
   * @async
   * @private
   */
  async _queryAddSlot() {
    const inputName = "customName";
    const inputAcceptedTypes = "acceptedTypes";
    const inputMaxBulk = "maxBulk";

    const dialog = await new DynamicInputDialog({
      localizedTitle: StringUtil.format(
        game.i18n.localize("ambersteel.general.input.queryFor"), 
        game.i18n.localize("ambersteel.character.asset.slot.label"), 
      ),
      inputDefinitions: [
        new DynamicInputDefinition({
          type: DYNAMIC_INPUT_TYPES.TEXTFIELD,
          name: inputName,
          localizableLabel: "ambersteel.character.asset.slot.name",
          required: true,
          defaultValue: "New Asset Slot"
        }),
        new DynamicInputDefinition({
          type: DYNAMIC_INPUT_TYPES.TEXTFIELD,
          name: inputAcceptedTypes,
          localizableLabel: "ambersteel.character.asset.slot.acceptedTypes",
          required: true,
          defaultValue: "",
          specificArgs: {
            placeholder: "holdable, armor, clothing"
          },
        }),
        new DynamicInputDefinition({
          type: DYNAMIC_INPUT_TYPES.NUMBER_SPINNER,
          name: inputMaxBulk,
          localizableLabel: "ambersteel.character.asset.maxBulk",
          required: false,
          defaultValue: 1,
          specificArgs: {
            min: 1
          },
        }),
      ],
    }).renderAndAwait(true);
    
    if (dialog.confirmed !== true) return;

    this.group.actor.updateByPath(`system.assets.equipment.${this.group.id}.slots.${createUUID()}`, {
      name: dialog[inputName],
      acceptedTypes: dialog[inputAcceptedTypes],
      alottedId: null,
      maxBulk: dialog[inputMaxBulk],
    });
  }
}