import { SpecificRollDataRollSchema } from "../../../../../business/dice/ability-roll/specific-roll-data-roll-schema.mjs"
import RollData from "../../../../../business/dice/roll-data.mjs"
import { ROLL_DICE_MODIFIER_TYPES } from "../../../../../business/dice/roll-dice-modifier-types.mjs"
import { ACTOR_TYPES } from "../../../../../business/document/actor/actor-types.mjs"
import TransientBaseCharacterActor from "../../../../../business/document/actor/transient-base-character-actor.mjs"
import { ITEM_TYPES } from "../../../../../business/document/item/item-types.mjs"
import { ATTRIBUTES } from "../../../../../business/ruleset/attribute/attributes.mjs"
import RulesetExplainer from "../../../../../business/ruleset/ruleset-explainer.mjs"
import { Sum, SumComponent } from "../../../../../business/ruleset/summed-data.mjs"
import { StringUtil } from "../../../../../business/util/string-utility.mjs"
import { ValidationUtil } from "../../../../../business/util/validation-utility.mjs"
import { ExtenderUtil } from "../../../../../common/extender-util.mjs"
import RollableSpecificDocumentCreationStrategy from "../../../../component/button-add/rollable-specific-document-creation-strategy.mjs"
import SpecificDocumentCreationStrategy from "../../../../component/button-add/specific-document-creation-strategy.mjs"
import ButtonRollViewModel from "../../../../component/button-roll/button-roll-viewmodel.mjs"
import ButtonViewModel from "../../../../component/button/button-viewmodel.mjs"
import InputNumberSpinnerViewModel from "../../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import ReadOnlyValueViewModel from "../../../../component/read-only-value/read-only-value.mjs"
import { SortingOption } from "../../../../component/sort-controls/sort-controls-viewmodel.mjs"
import DocumentListItemOrderDataSource from "../../../../component/sortable-list/document-list-item-order-datasource.mjs"
import SortableListViewModel, { SortableListAddItemParams, SortableListSortParams } from "../../../../component/sortable-list/sortable-list-viewmodel.mjs"
import DynamicInputDialog from "../../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs"
import DynamicInputDefinitionLabel from "../../../../dialog/dynamic-input-dialog/input-types/dynamic-input-definition-label.mjs"
import DynamicInputDefinitionNumberSpinner from "../../../../dialog/dynamic-input-dialog/input-types/dynamic-input-definition-number-spinner.mjs"
import ViewModel from "../../../../view-model/view-model.mjs"
import AssetListItemViewModel from "../../../item/asset/asset-list-item-viewmodel.mjs"
import IllnessListItemViewModel from "../../../item/illness/illness-list-item-viewmodel.mjs"
import InjuryListItemViewModel from "../../../item/injury/injury-list-item-viewmodel.mjs"
import MutationListItemViewModel from "../../../item/mutation/mutation-list-item-viewmodel.mjs"
import ScarListItemViewModel from "../../../item/scar/scar-list-item-viewmodel.mjs"
import ActorHealthStatesViewModel from "./actor-health-states-viewmodel.mjs"
import DeathsDoorViewModel from "./deaths-door/deaths-door-viewmodel.mjs"
import GritPointsViewModel from "./grit-points/grit-points-viewmodel.mjs"
import InjuryShrugOffBarViewModel from "./injury-shrug-off-bar/injury-shrug-off-bar-viewmodel.mjs"

/**
 * @extends ViewModel
 */
export default class ActorHealthViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_HEALTH; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isPC() { return this.document.type === ACTOR_TYPES.PC; }

  /**
   * @type {Number}
   * @readonly
   */
  get injuryCount() { return this.document.health.injuries.length; }

  /**
   * @type {Number}
   * @readonly
   */
  get illnessCount() { return this.document.health.illnesses.length; }

  /**
   * @type {Number}
   * @readonly
   */
  get mutationCount() { return this.document.health.mutations.length; }

  /**
   * @type {Number}
   * @readonly
   */
  get scarCount() { return this.document.health.scars.length; }

  /**
   * @type {Number}
   * @readonly
   */
  get modifiedMaxHp() { return this.document.health.modifiedMaxHp; }

  /**
   * @type {Number}
   * @readonly
   */
  get modifiedMaxExhaustion() { return this.document.health.modifiedMaxExhaustion; }

  /**
   * @type {Number}
   * @readonly
   */
  get maxExhaustion() { return this.document.health.maxExhaustion; }

  /**
   * @type {Array<IllnessListItemViewModel>}
   * @readonly
   */
  illnesses = [];

  /**
   * @type {Array<InjuryViewModel>}
   * @readonly
   */
  injuries = [];

  /**
   * @type {Array<MutationViewModel>}
   * @readonly
   */
  mutations = [];

  /**
   * @type {Array<ScarListItemViewModel>}
   * @readonly
   */
  scars = [];

  /**
   * @type {String}
   * @readonly
   */
  get healthStatesTemplate() { return ActorHealthStatesViewModel.TEMPLATE; }

  /**
   * @type {String}
   * @readonly
   */
  get gritPointsTemplate() { return GritPointsViewModel.TEMPLATE; }

  /**
   * @type {String}
   * @readonly
   */
  get shrugOffBarTemplate() { return InjuryShrugOffBarViewModel.TEMPLATE; }

  /**
   * @type {String}
   * @readonly
   */
  get deathsDoorTemplate() { return DeathsDoorViewModel.TEMPLATE; }

  /**
   * @type {String}
   * @readonly
   */
  get armorListItemTemplate() { return AssetListItemViewModel.TEMPLATE; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientBaseCharacterActor} args.document
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.document = args.document;
    this.contextType = args.contextType ?? "actor-health";
    const thiz = this;

    // HP
    this.vmMaxHp = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmMaxHp",
      value: this.document.health.maxHP,
      isEditable: false, // This should only ever be a read-only view! 
      localizedToolTip: new RulesetExplainer().getExplanationForMaxHp(this.document),
    });
    this.vmMaxHpModifier = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmMaxHpModifier",
      value: this.document.health.maxHpModifier,
      onChange: (_, newValue) => {
        this.document.health.maxHpModifier = newValue;
      },
    });
    this.vmModifiedMaxHp = new ReadOnlyValueViewModel({
      id: "vmModifiedMaxHp",
      parent: this,
      value: this.modifiedMaxHp,
    });
    this.vmHp = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmHp",
      value: this.document.health.HP,
      onChange: (_, newValue) => {
        this.document.health.HP = newValue;
      },
    });
    this.vmAdjustHp = new ButtonViewModel({
      id: "vmAdjustHp",
      parent: this,
      localizedToolTip: game.i18n.localize("system.character.health.hp.adjust"),
      iconHtml: '<i class="dark ico ico-modifier-solid interactible" style="height: 22px;"></i>',
      onClick: async () => {
        const inputNumber = "inputNumber";
        const dialog = await new DynamicInputDialog({
          easyDismissal: true,
          focused: inputNumber,
          inputDefinitions: [
            new DynamicInputDefinitionNumberSpinner({
              name: inputNumber,
              localizedLabel: game.i18n.localize("system.character.health.hp.adjustInputLabel"),
              required: true,
              defaultValue: 0,
            }),
            new DynamicInputDefinitionLabel({
              name: "reminder",
              localizedLabel: game.i18n.localize("system.character.health.injury.reminder"),
            }),
          ],
        }).renderAndAwait(true);
        
        if (dialog.confirmed !== true) return;

        const number = parseInt(dialog[inputNumber]);
        const newHP = thiz.document.health.HP + number;
        const clampedHP = Math.max(0, Math.min(newHP, thiz.document.health.maxHP));
        thiz.document.health.HP = clampedHP;
      },
    })
    this.vmHpInjuryReminder = new ViewModel({
      id: "vmHpInjuryReminder",
      parent: this,
      localizedToolTip: game.i18n.localize("system.character.health.injury.reminder"),
    });
    // Exhaustion
    this.vmMaxExhaustion = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmMaxExhaustion",
      value: this.document.health.maxExhaustion,
      isEditable: false, // This should only ever be a read-only view! 
      localizedToolTip: new RulesetExplainer().getExplanationForMaxExhaustion(this.document),
    });
    this.vmMaxExhaustionModifier = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmMaxExhaustionModifier",
      value: this.document.health.maxExhaustionModifier,
      onChange: (_, newValue) => {
        this.document.health.maxExhaustionModifier = newValue;
      },
    });
    this.vmExhaustion = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmExhaustion",
      value: this.document.health.exhaustion,
      onChange: (_, newValue) => {
        this.document.health.exhaustion = newValue;
      },
      min: 0,
    });
    this.vmModifiedMaxExhaustion = new ReadOnlyValueViewModel({
      id: "vmModifiedMaxExhaustion",
      parent: this,
      value: this.modifiedMaxExhaustion,
    });

    // Armor list item (if there is one). 
    const armorAssetId = this.document.assets.equipmentSlotGroups
      .find(assetGroup => assetGroup.name === "armor")
      .slots[0].alottedId;
    if (ValidationUtil.isDefined(armorAssetId)) {
      const armorAsset = this.document.assets.all.find(asset => asset.id === armorAssetId);

      this.vmArmorListItem = new AssetListItemViewModel({
        id: "vmArmorListItem",
        parent: this,
        isEditable: false, // This should only ever be a read-only view! 
        document: armorAsset,
      });
    }

    // Injury
    this.vmShrugOffBar = new InjuryShrugOffBarViewModel({
      id: "vmShrugOffBar",
      parent: this,
      document: this.document,
    });

    const toughnessAttribute = this.document.attributes.find(it => it.name === ATTRIBUTES.toughness.name);
    this.vmRollShrugOff = new ButtonRollViewModel({
      id: "vmRollShrugOff",
      parent: this,
      localizedToolTip: game.i18n.localize("system.character.health.injury.shrugOff.roll"),
      target: this.document,
      primaryChatTitle: game.i18n.localize("system.character.health.injury.shrugOff.chatMessage"),
      primaryChatImage: this.document.img,
      actor: this.document.document,
      rollSchema: new SpecificRollDataRollSchema({
        rollData: new RollData({
          dieFaces: 6,
          hitThreshold: 5,
          obFormula: `${this.injuryCount + 1 + this.document.health.injuryShrugOffs}`,
          diceComponents: new Sum([
            new SumComponent(ATTRIBUTES.toughness.name, ATTRIBUTES.toughness.localizableName, toughnessAttribute.modifiedLevel),
          ]),
          bonusDiceComponent: new SumComponent("bonus", "", 0),
          hitModifier: 0,
          compensationPoints: 0,
          rollModifier: ROLL_DICE_MODIFIER_TYPES.NONE,
        }),
      }),
    });

    // Conditions (formerly health states)
    this.vmHealthStates = new ActorHealthStatesViewModel({
      id: "vmHealthStates",
      parent: this,
      isOwner: this.isOwner,
      document: this.document,
    });

    // Prepare illnesses list view models. 
    this.illnesses = this._getIllnessViewModels();
    this.vmIllnessList = new SortableListViewModel({
      id: "vmIllnessList",
      parent: this,
      isCollapsible: false,
      indexDataSource: new DocumentListItemOrderDataSource({
        document: this.document,
        listName: "illnesses",
      }),
      listItemViewModels: this.illnesses,
      listItemTemplate: IllnessListItemViewModel.TEMPLATE,
      localizedTitle: game.i18n.localize("system.character.health.illness.plural"),
      headerLevel: 1,
      addItemParams: [
        new SortableListAddItemParams({
          creationStrategy: new RollableSpecificDocumentCreationStrategy({
            rollTables: ["Illnesses"],
            localizedSelectionType: game.i18n.localize(`TYPES.Item.${ITEM_TYPES.ILLNESS}`),
            target: this.document,
          }),
          localizedLabel: StringUtil.format(
            game.i18n.localize("system.general.add.addType"),
            game.i18n.localize("system.character.health.illness.singular"),
          ),
          localizedToolTip: StringUtil.format(
            game.i18n.localize("system.general.add.addType"),
            game.i18n.localize("system.character.health.illness.singular"),
          ),
        })
      ],
      sortParams: new SortableListSortParams({
        options: this._getTreatableSortingOptions(),
        compact: true,
      }),
    });
    this.vmIllnessCount = new ReadOnlyValueViewModel({
      id: "vmIllnessCount",
      parent: this,
      value: this.illnessCount,
    });

    // Prepare injuries list view models. 
    this.injuries = this._getInjuryViewModels();
    this.vmInjuryList = new SortableListViewModel({
      id: "vmInjuryList",
      parent: this,
      indexDataSource: new DocumentListItemOrderDataSource({
        document: this.document,
        listName: "injuries",
      }),
      listItemViewModels: this.injuries,
      listItemTemplate: InjuryListItemViewModel.TEMPLATE,
      localizedTitle: game.i18n.localize("system.character.health.injury.plural"),
      headerLevel: 1,
      addItemParams: [
        new SortableListAddItemParams({
          creationStrategy: new RollableSpecificDocumentCreationStrategy({
            rollTables: [
              "Injuries (Acid)",
              "Injuries (Bleeding)",
              "Injuries (Bludgeoning)",
              "Injuries (Burning)",
              "Injuries (Electrical)",
              "Injuries (Freezing)",
              "Injuries (Piercing)",
              "Injuries (Poison)",
              "Injuries (Slashing)",
            ],
            localizedSelectionType: game.i18n.localize(`TYPES.Item.${ITEM_TYPES.INJURY}`),
            target: this.document,
          }),
          localizedLabel: StringUtil.format(
            game.i18n.localize("system.general.add.addType"),
            game.i18n.localize("system.character.health.injury.singular"),
          ),
          localizedToolTip: StringUtil.format(
            game.i18n.localize("system.general.add.addType"),
            game.i18n.localize("system.character.health.injury.singular"),
          ),
        })
      ],
      sortParams: new SortableListSortParams({
        options: this._getTreatableSortingOptions(),
        compact: true,
      }),
    });
    this.vmInjuryCount = new ReadOnlyValueViewModel({
      id: "vmInjuryCount",
      parent: this,
      value: this.injuryCount,
    });

    // Prepare mutations list view models. 
    this.mutations = this._getMutationViewModels();
    this.vmMutationList = new SortableListViewModel({
      id: "vmMutationList",
      parent: this,
      indexDataSource: new DocumentListItemOrderDataSource({
        document: this.document,
        listName: "mutations",
      }),
      listItemViewModels: this.mutations,
      listItemTemplate: MutationListItemViewModel.TEMPLATE,
      localizedTitle: game.i18n.localize("system.character.health.mutation.plural"),
      headerLevel: 1,
      addItemParams: [
        new SortableListAddItemParams({
          creationStrategy: new RollableSpecificDocumentCreationStrategy({
            rollTables: ["Mutations"],
            localizedSelectionType: game.i18n.localize(`TYPES.Item.${ITEM_TYPES.MUTATION}`),
            target: this.document,
          }),
          localizedLabel: StringUtil.format(
            game.i18n.localize("system.general.add.addType"),
            game.i18n.localize("system.character.health.mutation.singular"),
          ),
          localizedToolTip: StringUtil.format(
            game.i18n.localize("system.general.add.addType"),
            game.i18n.localize("system.character.health.mutation.singular"),
          ),
        })
      ],
      sortParams: new SortableListSortParams({
        options: this._getNameSortingOptions(),
        compact: true,
      }),
    });
    this.vmMutationCount = new ReadOnlyValueViewModel({
      id: "vmMutationCount",
      parent: this,
      value: this.mutationCount,
    });

    // Prepare scars list view models. 
    this.scars = this._getScarViewModels();
    this.vmScarList = new SortableListViewModel({
      id: "vmScarList",
      parent: this,
      indexDataSource: new DocumentListItemOrderDataSource({
        document: this.document,
        listName: "scars",
      }),
      listItemViewModels: this.scars,
      listItemTemplate: ScarListItemViewModel.TEMPLATE,
      localizedTitle: game.i18n.localize("system.character.health.scar.plural"),
      headerLevel: 1,
      addItemParams: [
        new SortableListAddItemParams({
          creationStrategy: new SpecificDocumentCreationStrategy({
            documentType: ITEM_TYPES.SCAR,
            target: this.document,
          }),
          localizedLabel: StringUtil.format(
            game.i18n.localize("system.general.add.addType"),
            game.i18n.localize("system.character.health.scar.singular"),
          ),
          localizedToolTip: StringUtil.format(
            game.i18n.localize("system.general.add.addType"),
            game.i18n.localize("system.character.health.scar.singular"),
          ),
        })
      ],
      sortParams: new SortableListSortParams({
        options: this._getNameSortingOptions(),
        compact: true,
      }),
    });
    this.vmScarCount = new ReadOnlyValueViewModel({
      id: "vmScarCount",
      parent: this,
      value: this.scarCount,
    });

    this.vmGritPoints = new GritPointsViewModel({
      id: "vmGritPoints",
      parent: this,
      document: this.document,
      isInCombatTracker: false,
    });

    if (this.isPC) {
      this.vmDeathsDoor = new DeathsDoorViewModel({
        id: "vmDeathsDoor",
        parent: this,
        document: this.document,
      });
    }
  }

  /**
   * Updates the data of this view model. 
   * 
   * @param {Object} args 
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document.
   * * Default `false`. 
   * 
   * @override
   */
  update(args = {}) {
    // Illnesses
    const newIllnesses = this._getIllnessViewModels();
    this._cullObsolete(this.illnesses, newIllnesses);
    this.illnesses = newIllnesses;
    
    // Injuries
    const newInjuries = this._getInjuryViewModels();
    this._cullObsolete(this.injuries, newInjuries);
    this.injuries = newInjuries;
    
    // Mutations
    const newMutations = this._getMutationViewModels();
    this._cullObsolete(this.mutations, newMutations);
    this.mutations = newMutations;
    
    // Scars
    const newScars = this._getScarViewModels();
    this._cullObsolete(this.scars, newScars);
    this.scars = newScars;

    super.update(args);
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(ActorHealthViewModel));
  }

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmIllnessList, {
      ...updates.get(this.vmIllnessList),
      listItemViewModels: this.illnesses,
    });
    updates.set(this.vmInjuryList, {
      ...updates.get(this.vmInjuryList),
      listItemViewModels: this.injuries,
    });
    updates.set(this.vmMutationList, {
      ...updates.get(this.vmMutationList),
      listItemViewModels: this.mutations,
    });
    updates.set(this.vmScarList, {
      ...updates.get(this.vmScarList),
      listItemViewModels: this.scars,
    });
    
    return updates;
  }

  /**
   * @returns {Array<IllnessListItemViewModel>}
   * 
   * @private
   */
  _getIllnessViewModels() {
    return this._getViewModels(
      this.document.health.illnesses, 
      this.illnesses,
      (args) => { return new IllnessListItemViewModel(args); }
    );
  }
  
  /**
   * @returns {Array<InjuryListItemViewModel>}
   * 
   * @private
   */
  _getInjuryViewModels() {
    return this._getViewModels(
      this.document.health.injuries, 
      this.injuries,
      (args) => { return new InjuryListItemViewModel(args); }
    );
  }
  
  /**
   * @returns {Array<MutationListItemViewModel>}
   * 
   * @private
   */
  _getMutationViewModels() {
    return this._getViewModels(
      this.document.health.mutations, 
      this.mutations,
      (args) => { return new MutationListItemViewModel(args); }
    );
  }
  
  /**
   * @returns {Array<ScarListItemViewModel>}
   * 
   * @private
   */
  _getScarViewModels() {
    return this._getViewModels(
      this.document.health.scars, 
      this.scars,
      (args) => { return new ScarListItemViewModel(args); }
    );
  }

  /**
   * Returns the `SortingOption`s for the injury and illness lists. 
   * 
   * @returns {Array<SortingOption>}
   * 
   * @private
   */
  _getTreatableSortingOptions() {
    return [
      new SortingOption({
        iconHtml: '<i class="ico ico-tags-solid dark"></i>',
        localizedToolTip: game.i18n.localize("system.general.name.label"),
        sortingFunc: (a, b) => {
          return a.document.name.localeCompare(b.document.name);
        },
      }),
      new SortingOption({
        iconHtml: '<i class="fas fa-mortar-pestle pad-r-sm"></i>',
        localizedToolTip: game.i18n.localize("system.character.health.treatment"),
        sortingFunc: (a, b) => {
          return a.document.compareTreatment(b.document);
        },
      }),
    ];
  }

  /**
   * Returns the `SortingOption`s for the mutation and scar lists. 
   * 
   * @returns {Array<SortingOption>}
   * 
   * @private
   */
  _getNameSortingOptions() {
    return [
      new SortingOption({
        iconHtml: '<i class="ico ico-tags-solid dark"></i>',
        localizedToolTip: game.i18n.localize("system.general.name.label"),
        sortingFunc: (a, b) => {
          return a.document.name.localeCompare(b.document.name);
        },
      }),
    ];
  }
}
