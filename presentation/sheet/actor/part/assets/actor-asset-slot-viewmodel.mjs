import * as StringUtil from "../../../../../business/util/string-utility.mjs";
import { isDefined, validateOrThrow } from "../../../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../../../component/button/button-viewmodel.mjs";
import ChoiceAdapter from "../../../../component/input-choice/choice-adapter.mjs";
import ChoiceOption from "../../../../component/input-choice/choice-option.mjs";
import DynamicInputDefinition from "../../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../../../dialog/dynamic-input-dialog/dynamic-input-types.mjs";
import { TEMPLATES } from "../../../../templatePreloader.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";

/**
 * @extends ViewModel
 * 
 * @property {CharacterAssetSlot} assetSlot
 * * Read-only. 
 * @property {TransientAsset | undefined} asset
 * * Read-only. 
 * @property {Boolean} hasAsset
 * * Read-only. 
 * @property {Number} currentBulk
 * * Read-only. 
 * @property {Number} maxBulk
 * * Read-only. 
 * @property {Array<TransientAsset>} availableAssets
 * * Read-only. 
 */
export default class ActorAssetSlotViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_ASSET_SLOT; }

  get asset() { return this.assetSlot.asset; }

  get hasAsset() {
    return isDefined(this.assetSlot.alottedId) === true;
  }

  get currentBulk() {
    const asset = this.asset;
    if (asset === undefined) {
      return 0;
    } else {
      return asset.bulk;
    }
  }

  get maxBulk() {
    return this.assetSlot.maxBulk;
  }
  
  /**
   * @type {Array<TransientAsset>}
   * @readonly
   */
  get availableAssets() {
    return this.assetSlot.group.actor.assets.luggage.concat(this.assetSlot.group.actor.assets.property);
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
   * @param {CharacterAssetSlot} args.assetSlot
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["assetSlot"]);

    this.assetSlot = args.assetSlot;

    const thiz = this;

    this.vmBtnEdit = new ButtonViewModel({
      id: "vmBtnEdit",
      parent: this,
      isSendable: this.isSendable,
      isEditable: this.isEditable,
      isOwner: this.isOwner,
      target: this.document,
      localizableTitle: "ambersteel.character.asset.slot.edit",
      onClick: async () => {
        const inputName = "name";
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
              defaultValue: this.assetSlot.name,
            }),
            new DynamicInputDefinition({
              type: DYNAMIC_INPUT_TYPES.TEXTFIELD,
              name: inputAcceptedTypes,
              localizableLabel: "ambersteel.character.asset.slot.acceptedTypes",
              required: true,
              defaultValue: this.assetSlot.acceptedTypes.join(", "),
              specificArgs: {
                placeholder: "holdable, armor, ..."
              },
            }),
            new DynamicInputDefinition({
              type: DYNAMIC_INPUT_TYPES.NUMBER_SPINNER,
              name: inputMaxBulk,
              localizableLabel: "ambersteel.character.asset.maxBulk",
              required: false,
              defaultValue: this.assetSlot.maxBulk,
              specificArgs: {
                min: 1
              },
              validationFunc: (value) => {
                try {
                  const int = parseInt(value);
                  if (int < 1) {
                    return false;
                  }
                  return true;
                } catch {
                  return false;
                }
              },
            }),
          ],
        }).renderAndAwait(true);
        
        if (dialog.confirmed !== true) return;

        const name = dialog[inputName];
        const acceptedTypes = dialog[inputAcceptedTypes].split(",").trim();
        const maxBulk = parseInt(dialog[inputMaxBulk]);

        this.assetSlot.update({
          name: name,
          acceptedTypes: acceptedTypes,
          maxBulk: maxBulk,
        });
      },
    });

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
              specificArgs: {
                options: this._getAssetsAsChoices(),
                adapter: this.choiceAdapter,
              }
            }),
          ],
        }).renderAndAwait(true);
        
        if (dialog.confirmed !== true) return;
        
        const asset = this.availableAssets.find(it => it.id === dialog[inputChoices]);
        
        // // Deny, if maxbulk exceeded. 
        // const newBulk = this.group.currentBulk + asset.bulk;
        // if (newBulk > this.group.maxBulk) {
        //   // TODO #196: Dialog to inform user.
        //   return;
        // }

        // // Find vacant slots.
        // let assignedBulk = 0;
        // while (assignedBulk < asset.bulk) {
          
        // }
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
}