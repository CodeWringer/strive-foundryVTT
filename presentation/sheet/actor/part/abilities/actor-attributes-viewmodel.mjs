import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../../../templatePreloader.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";
import ChallengeRatingViewModel from "./challenge-rating-viewmodel.mjs";
import AttributeTableViewModel from "./actor-attribute-table-viewmodel.mjs";
import TransientBaseCharacterActor from "../../../../../business/document/actor/transient-base-character-actor.mjs";
import CharacterAttributeGroup from "../../../../../business/ruleset/attribute/character-attribute-group.mjs";
import KeyValuePair from "../../../../../common/key-value-pair.mjs";
import ChallengeRating from "../../../../../business/ruleset/attribute/challenge-rating.mjs";

export default class ActorAttributesViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_ATTRIBUTES; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isPC() { return this.document.type === TransientPc.TYPE; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get isNPC() { return this.document.type === TransientNpc.TYPE; }

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
   * @param {TransientBaseCharacterActor} args.document
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    // Own properties.
    this.document = args.document;

    // Child view models. 
    this.attributeGroups = this.document.attributeGroups.map(attributeGroup => 
      this._getAttributeGroupRenderData(attributeGroup)
    );
  }

  /**
   * Returns render data for the given attribute group. 
   * 
   * @param {CharacterAttributeGroup} attributeGroup 
   * 
   * @returns {Object} An object containing the render data. Has the following properties: 
   * * `{String} template`
   * * `{ViewModel} viewModel`
   * 
   * @private
   */
  _getAttributeGroupRenderData(attributeGroup) {
    let template;
    let viewModel;

    const isExpanded = (this.isPC === true || (this.isNPC === true && this.document.getIsExpandedFor(attributeGroup.name) === true));

    if (isExpanded === true) {
      template = AttributeTableViewModel.TEMPLATE;

      viewModel = new AttributeTableViewModel({
        id: attributeGroup.name,
        parent: this,
        document: this.document,
        attributes: attributeGroup.attributes,
        attributeGroupName: attributeGroup.name,
        localizableAttributeGroupName: attributeGroup.localizableName,
        parent: this,
        headerInteractible: this.isNPC === true,
        iconClass: attributeGroup.iconClass,
        onHeaderClicked: () => {
          if (this.isNPC === true) {
            const expansion = this.document.getIsExpandedFor(attributeGroup.name);
            this._setExpansion(attributeGroup.name, !expansion);
          }
        },
      });
    } else {
      template = ChallengeRatingViewModel.TEMPLATE;

      const challengeRating = this.document.getCrFor(attributeGroup.name);
      viewModel = new ChallengeRatingViewModel({
        id: attributeGroup.name,
        parent: this,
        challengeRating: challengeRating,
        localizedLabel: game.i18n.localize(attributeGroup.localizableName),
        iconClass: attributeGroup.iconClass,
        actor: this.document,
        onClicked: () => {
          if (this.isNPC === true) {
            const expansion = this.document.getIsExpandedFor(attributeGroup.name);
            this._setExpansion(attributeGroup.name, !expansion);
          }
        },
        onChallengeRatingChanged: (_, newValue) => {
          this._setChallengeRating(attributeGroup.name, newValue);
        },
      });
    }

    return {
      template: template,
      viewModel: viewModel,
    };
  }

  /**
   * Sets the challenge rating of an attribute group with the given name. 
   * 
   * @param {String} attributeGroupName 
   * @param {ChallengeRating} challengeRating 
   * 
   * @private
   */
  _setChallengeRating(attributeGroupName, challengeRating) {
    const challengeRatings = this.document.challengeRatings.concat([]);

    const kvpair = challengeRatings.find(it => it.key === attributeGroupName);
    if (kvpair === undefined) {
      challengeRatings.push(new KeyValuePair(attributeGroupName, challengeRating));
    } else {
      kvpair.value = challengeRating;
    }

    this.document.challengeRatings = challengeRatings;
  }

  /**
   * Sets the expanded state of an attribute group with the given name. 
   * 
   * @param {String} attributeGroupName 
   * @param {Boolean} value 
   * 
   * @private
   */
  _setExpansion(attributeGroupName, value) {
    const expansions = this.document.attributeGroupExpansionStates.concat([]);

    const expansion = expansions.find(it => it.key === attributeGroupName);
    if (expansion === undefined) {
      expansions.push(new KeyValuePair(attributeGroupName, value));
    } else {
      expansion.value = value;
    }

    this.document.attributeGroupExpansionStates = expansions;
  }
}
