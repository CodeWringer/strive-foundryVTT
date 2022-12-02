import { DiceOutcomeTypes } from '../../dto/dice-outcome-types.mjs';
import { SummedData, SummedDataComponent } from '../../dto/summed-data.mjs';
import Ruleset from '../../ruleset.mjs';
import { TEMPLATES } from '../../templatePreloader.mjs';
import * as PropUtil from '../../utils/property-utility.mjs';
import AmbersteelBaseActor from './ambersteel-base-actor.mjs';

/**
 * Represents the base contract for a "specific" actor "sub-type" that represents a "character", in the way the Ambersteel rule set regards them. 
 * 
 * Such a "sub-type" is really on an "enhancer", which adds properties and/or methods to a given `Actor` instance. 
 */
export default class AmbersteelBaseCharacterActor extends AmbersteelBaseActor {
  /** @override */
  get defaultImg() { return "icons/svg/mystery-man.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.ACTOR_CHAT_MESSAGE; }

  /**
   * Ensures type-specific methods and properties are added to the given 
   * context entity. 
   * @param {Actor} context 
   * @virtual
   * @private
   */
  _ensureContextHasSpecifics(context) {
    context.getSkills = this.getSkills.bind(context);
    context.getInjuries = this.getInjuries.bind(context);
    context.getIllnesses = this.getIllnesses.bind(context);
    context.getMutations = this.getMutations.bind(context);
    context.getPossessions = this.getPossessions.bind(context);
    context.getPropertyItems = this.getPropertyItems.bind(context);
    context.getFateCards = this.getFateCards.bind(context);
    context.getAttributeForName = this.getAttributeForName.bind(context);
    context.getAttributeForLocalizedName = this.getAttributeForLocalizedName.bind(context);
    context.setAttributeLevel = this.setAttributeLevel.bind(context);
    context.addAttributeProgress = this.addAttributeProgress.bind(context);
    context.advanceSkillBasedOnRollResult = this.advanceSkillBasedOnRollResult.bind(context);
    context.advanceAttributeBasedOnRollResult = this.advanceAttributeBasedOnRollResult.bind(context);
    context.resolveReferences = this.resolveReferences.bind(context);
  }
  
  /** @override */
  prepareData(context) {
    super.prepareData(context);

    this._ensureContextHasSpecifics(context);
  }

  /** @override */
  prepareDerivedData(context) {
    super.prepareDerivedData(context);

    this._ensureContextHasSpecifics(context);

    context.data.data.assets.maxBulk = new Ruleset().getCharacterMaximumInventory(context);
    context.data.data.assets.totalBulk = this._calculateUsedBulk(context);
    this._prepareDerivedAttributesData(context);
    this._prepareDerivedSkillsData(context);
    this._prepareDerivedHealthData(context);
  }

  /**
   * Returns the currently used bulk. 
   * @param {AmbersteelActor} context 
   * @returns {Number} The currently used bulk. 
   * @private
   */
  _calculateUsedBulk(context) {
    let usedBulk = 0;
    for (const possession of context.getPossessions()) {
      usedBulk += possession.data.data.bulk;
    }
    return usedBulk;
  }

  /**
   * Prepares derived data for all attributes. 
   * 
   * This will adjust actor.data.data to the following result:
   * actor.data.data = {
   *   attributeGroups: {Array<Object>} = same as physical,
   *   attributes: {Object} = {
   *     physical: {Object} = {
   *       name: {String},
   *       localizableName: {String},
   *       localizableAbbreviation: {String},
   *       attributes: {Array<Object>} = {
   *         value: {Number},
   *         successes: {Number},
   *         failures: {Number},
   *         requiredSuccessses: {Number},
   *         requiredFailures: {Number},
   *         name: {String},
   *         localizableName: {String},
   *         localizableAbbreviation: {String},
   *         getRollData(): {Function<Object>}
   *         advanceAttributeBasedOnRollResult({DicePoolResult}, {String}): {Function<>}
   *       }
   *     },
   *     mental: {Object} = same as physical
   *     social: {Object} = same as physical
   *   }
   * }
   * 
   * @param {AmbersteelActor} context 
   * @private
   */
  _prepareDerivedAttributesData(context) {
    const actorData = context.data.data;

    // The names of the attribute groups to iterate. "physical", "mental" and "social"
    const attributeGroupNames = actorData.attributeGroupNames ?? this._getAttributeGroupNames(context);
    if (actorData.attributeGroupNames === undefined) {
      actorData.attributeGroupNames = attributeGroupNames;
    }
    
    const attributeGroups = [];
    for (const attGroup of attributeGroupNames) {
      const attGroupName = attGroup.name;
      const oAttGroup = actorData.attributes[attGroupName];
      
      // The names of the attributes to iterate. E. g. "agility" or "willpower"
      const attributeNames = attGroup.attributeNames;
      
      // Prepare attributes of group. 
      const attributes = [];
      for (const attName of attributeNames) {
        const oAtt = oAttGroup[attName];
        this._prepareDerivedAttributeData(context, oAtt, attName);
        attributes.push(oAtt);
      }

      // Add internal name. 
      oAttGroup.name = attGroupName;
      // Add localization keys. 
      oAttGroup.localizableName = `ambersteel.character.attributeGroup.${attGroupName}.label`;
      oAttGroup.localizableAbbreviation = `ambersteel.character.attributeGroup.${attGroupName}.abbreviation`;
      // Add attributes of group for easy access. 
      oAttGroup.attributes = attributes;

      attributeGroups.push(oAttGroup);
    }
    // Add attribute groups for easy access. 
    actorData.attributeGroups = attributeGroups;
  }

  /**
   * Prepares derived data for a given attribute. 
   * @param oAtt {Object} The attribute object. 
   * @param attName {String} Internal name of the attribute, e.g. 'magicSense'. 
   * @private
   */
  _prepareDerivedAttributeData(context, oAtt, attName) {
    const attValue = parseInt(oAtt.value);
    const req = new Ruleset().getAttributeAdvancementRequirements(attValue);

    // Calculate advancement requirements. 
    oAtt.requiredSuccessses = req.requiredSuccessses;
    oAtt.requiredFailures = req.requiredFailures;

    // Add internal name. 
    oAtt.name = attName;

    // Add localization keys. 
    oAtt.localizableName = `ambersteel.character.attribute.${attName}.label`;
    oAtt.localizableAbbreviation = `ambersteel.character.attribute.${attName}.abbreviation`;

    // Add functions.
    const thiz = this;
    oAtt.getRollData = () => {
      return new SummedData(attValue, [
        new SummedDataComponent(attName, oAtt.localizableName, attValue)
      ]);
    };
    oAtt.advanceAttributeBasedOnRollResult = this.advanceAttributeBasedOnRollResult.bind(context);
  }
  
  /**
   * @param {Document} context 
   * @returns {Array<Object>} { name: {String}, attributeNames: {Array<String>} }
   * @private
   */
  _getAttributeGroupNames(context) {
    const result = [];

    for (const attributeGroupName in context.data.data.attributes) {
      const attributeNames = [];
      for (const attributeName in context.data.data.attributes[attributeGroupName]) {
        attributeNames.push(attributeName);
      }

      const obj = { name: attributeGroupName, attributeNames: attributeNames };
      result.push(obj);
    }

    return result;
  }

  /**
   * Updates the given actorData with derived skill data. 
   * Assigns items of type skill to the derived lists 'actorData.skills' and 'actorData.learningSkills'. 
   * @param {Actor} context 
   * @private
   */
  _prepareDerivedSkillsData(context) {
    const actorData = context.data.data;
    
    actorData.skills = (context.items.filter(item => {
      return item.data.type == "skill" && parseInt(item.data.data.value) > 0
    }));
    for (const oSkill of actorData.skills) {
      this._prepareDerivedSkillData(context, oSkill.id);
    };
    
    actorData.learningSkills = (context.items.filter(item => {
      return item.data.type == "skill" && parseInt(item.data.data.value) == 0
    }));
    for (const oSkill of actorData.learningSkills) {
      this._prepareDerivedSkillData(context, oSkill.id);
    };
  }
  
  /**
   * Pepares derived skill data. 
   * @param {Actor} context 
   * @param {String} skillId Id of a skill. 
   * @private
   */
  _prepareDerivedSkillData(context, skillId) {
    const oSkill = context.items.get(skillId);
    const skillData = oSkill.data.data;

    skillData.id = oSkill.id;
    skillData.entityName = skillData.entityName ? skillData.entityName : oSkill.name;
    skillData.value = parseInt(skillData.value ? skillData.value : 0);
    skillData.successes = parseInt(skillData.successes ? skillData.successes : 0);
    skillData.failures = parseInt(skillData.failures ? skillData.failures : 0);
    skillData.relatedAttribute = skillData.relatedAttribute ? skillData.relatedAttribute : "agility";

    const req = new Ruleset().getSkillAdvancementRequirements(skillData.value);
    skillData.requiredSuccessses = req.requiredSuccessses;
    skillData.requiredFailures = req.requiredFailures;
  }

  /**
   * Prepares derived health data. 
   * @param {AmbersteelActor} context 
   * @private
   * @async
   */
  _prepareDerivedHealthData(context) {
    const businessData = context.data.data;

    const ruleset = new Ruleset();
    businessData.health.maxHP = ruleset.getCharacterMaximumHp(context);
    businessData.health.maxInjuries = ruleset.getCharacterMaximumInjuries(context);
    businessData.health.maxExhaustion = ruleset.getCharacterMaximumExhaustion(context);
    businessData.health.maxMagicStamina = ruleset.getCharacterMaximumMagicStamina(context).total;
  }

  /**
   * Advances the skill, based on the given {DicePoolResult}. 
   * @param {DicePoolResult} rollResult 
   * @param {String} itemId The id of the skill item to advance. 
   * @async
   */
  async advanceSkillBasedOnRollResult(rollResult, itemId) {
    const oSkill = this.items.get(itemId);
    oSkill.addProgress(rollResult.outcomeType, false);
  }

  /**
   * Attribute roll handler. 
   * @param {DicePoolResult} rollResult 
   * @param {String} attributeName The name of the attribute. 
   * @async
   */
  async advanceAttributeBasedOnRollResult(rollResult, attributeName) {
    if (rollResult === undefined) {
      game.ambersteel.logger.logWarn("rollResult is undefined");
      return;
    }
    await this.addAttributeProgress(rollResult.outcomeType, attributeName);
  }

  /**
   * Returns an attribute, whose internal name matches with the given string. 
   * 
   * @param {String} name Internal name of an attribute, e.g. 'strength'. 
   * 
   * @returns {Object} With properties 'object', 'name', 'groupName'
   * 
   * @private
   */
  getAttributeForName(name) {
    const data = this.data.data;

    for (const attGroupName in data.attributes) {
      const oAtt = data.attributes[attGroupName][name];
      if (oAtt !== undefined) {
        return {
          object: oAtt,
          name: name,
          groupName: attGroupName
        };
      }
    }
    return undefined;
  }

  /**
   * Returns an attribute, whose localized name or name abbreviation matches with the given string. 
   * 
   * @param {String} name Localized name of an attribute, e.g. 'Stärke'. 
   * * Also accepts a localized abbreviation, e. g. 'Str'. 
   * 
   * @returns {Object} With properties 'object', 'name', 'groupName'
   * 
   * @private
   */
  getAttributeForLocalizedName(name) {
    const data = this.data.data;
    const comparableName = name.toLowerCase();

    for (const attGroupName in data.attributes) {
      const attGroup = data.attributes[attGroupName];

      for (const attGroupPropertyName in attGroup) {
        const attGroupProperty = attGroup[attGroupPropertyName];

        if (attGroupProperty.localizableName === undefined) {
          // Don't bother looking at properties that don't represent attributes. 
          continue;
        }

        if (comparableName == game.i18n.localize(attGroupProperty.localizableName).toLowerCase()
        || comparableName == game.i18n.localize(attGroupProperty.localizableAbbreviation).toLowerCase()) {
          return {
            object: attGroupProperty,
            name: attGroupProperty.name,
            groupName: attGroupName
          };
        }
      }
    }
    return undefined;
  }

  /**
   * Sets the level of the attribute with the given name. 
   * @param attName {String} Internal name of an attribute, e.g. 'magicSense'. 
   * @param newValue {Number} Value to set the attribute to, e.g. 0. Default 0
   * @async
   */
  async setAttributeLevel(attName = undefined, newValue = 0) {
    const oAttName = this.getAttributeForName(attName);
    const req = new Ruleset().getAttributeAdvancementRequirements(newValue);
    const propertyPath = `data.attributes.${oAttName.groupName}.${attName}`

    await this.update({
      [`${propertyPath}.value`]: newValue,
      [`${propertyPath}.requiredSuccessses`]: req.requiredSuccessses,
      [`${propertyPath}.requiredFailures`]: req.requiredFailures,
      [`${propertyPath}.successes`]: 0,
      [`${propertyPath}.failures`]: 0
    });
  }

  /**
   * Adds success/failure progress to an attribute. 
   * 
   * Also auto-levels up the attribute, if 'autoLevel' is set to true. 
   * @param {DiceOutcomeTypes} outcomeType The test outcome to work with. 
   * @param {String | undefined} attName Optional. Internal name of an attribute, e.g. 'magicSense'. 
   * @param {Boolean | undefined} autoLevel Optional. If true, will auto-level up. Default false
   * @async
   */
  async addAttributeProgress(outcomeType, attName = undefined, autoLevel = false) {
    if (outcomeType === undefined) {
      game.ambersteel.logger.logWarn("outcomeType is undefined");
      return;
    }

    const oAttName = this.getAttributeForName(attName);
    const oAtt = oAttName.object;

    let successes = parseInt(oAtt.successes);
    let failures = parseInt(oAtt.failures);
    const requiredSuccessses = parseInt(oAtt.requiredSuccessses);
    const requiredFailures = parseInt(oAtt.requiredFailures);
    const propertyPath = `data.attributes.${oAttName.groupName}.${attName}`

    if (outcomeType === DiceOutcomeTypes.SUCCESS) {
      successes++;
      await this.update({ [`${propertyPath}.successes`]: successes });
    } else if (outcomeType === DiceOutcomeTypes.FAILURE || outcomeType === DiceOutcomeTypes.PARTIAL) {
      failures++;
      await this.update({ [`${propertyPath}.failures`]: failures });
    }

    if (autoLevel) {
      if (successes >= requiredSuccessses
      && failures >= requiredFailures) {
        const newLevel = parseInt(oAtt.value) + 1;
        await this.setAttributeLevel(attName, newLevel);
      }
    }
  }

  /**
   * Returns all currently embedded skill documents.
   * @returns {Array<AmbersteelSkillItem>}
   */
  getSkills() { 
    return this.getItemsByType("skill"); 
  }
  /**
   * Returns all currently embedded injury documents.
   * @returns {Array<AmbersteelInjuryItem>}
   */
  getInjuries() { 
    return this.getItemsByType("injury"); 
  }
  /**
   * Returns all currently embedded illness documents.
   * @returns {Array<AmbersteelIllnessItem>}
   */
  getIllnesses() { 
    return this.getItemsByType("illness"); 
  }
  /**
   * Returns all currently embedded mutation documents.
   * @returns {Array<AmbersteelMutationItem>}
   */
  getMutations() { 
    return this.getItemsByType("mutation"); 
  }
  /**
   * Returns all currently embedded asset documents that are considered "on person".
   * @returns {Array<AmbersteelItemItem>}
   */
  getPossessions() {
    const items = Array.from(this.items);
    return items.filter((item) => { return item.type === "item" && item.data.data.isOnPerson; });
  }
  /**
   * Returns all currently embedded asset documents that are considered "remote".
   * @returns {Array<AmbersteelItemItem>}
   */
  getPropertyItems() {
    const items = Array.from(this.items);
    return items.filter((item) => { return item.type === "item" && !item.data.data.isOnPerson; });
  }
  /**
   * Returns all currently embedded fate-card documents.
   * @returns {Array<AmbersteelFateCardItem>}
   */
  getFateCards() {
    return this.getItemsByType("fate-card"); 
  }

  /**
   * Returns the property values identified by the `@`-denoted references in the given string, 
   * from this `Actor`. 
   * 
   * Searches: 
   * * Attribute names.
   * * Embedded skill name.
   * * Embedded skill ability name.
   * * Embedded asset name.
   * * Embedded injury name.
   * * Embedded illness name.
   * * Embedded mutation name.
   * * Embedded asset name.
   * * Embedded fate-card name.
   * 
   * @param {String} str A string containing `@`-denoted references. 
   * * E. g. `"@strength"` or localized and capitalized `"@Stärke"`. 
   * * Abbreviated attribute names are permitted, e. g. `"@wis"` instead of `"@wisdom"`. 
   * * If a reference's name contains spaces, they must be replaced with underscores. 
   * E. g. `"@Heavy_Armor"`, instead of `"@Heavy Armor"`
   * * *Can* contain property paths! These paths are considered relative to the data-property. 
   * E. g. `@a_fate_card.cost.miFP`, instead of `@a_fate_card.data.data.cost.miFP`. 
   * 
   * @returns {Map<String, Any | undefined>} A map of the reference key, including the `@`-symbol, to its resolved reference. 
   * * Only contains unique entries. No reference is included more than once. 
   */
  resolveReferences(str) {
    const result = new Map();

    const references = str.match(/@[^\s-/*+]+/g);
    if (references === undefined || references === null) {
      return result;
    }

    // Iterates the given documents array and returns the first element, 
    // whose name matches the given name. Case-insensitive comparison. 
    // No regard for localization! 
    const _getMatchingDocument = (documents, name) => {
      for (const document of documents) {
        if (document.name.toLowerCase() == name) {
          return document;
        }
      }
      return undefined;
    }

    for (const reference of references) {
      const propertyPathMatch = reference.match(/\.[^\s-/*+]+/i);
      const propertyPath = propertyPathMatch == null ? undefined : propertyPathMatch[0].substring(1); // The property path, excluding the first dot. 
      
      const lowercaseReference = reference.toLowerCase();
      const comparableReference = (propertyPath !== undefined ? lowercaseReference.substring(1, lowercaseReference.indexOf(".", 1)): lowercaseReference.substring(1)).replaceAll("_", " ");
      if (result.has(comparableReference)) {
        // Only bother looking up a reference once. 
        continue;
      }

      // Search attributes. 
      let attribute = this.getAttributeForName(comparableReference);
      if (attribute === undefined) {
        attribute = this.getAttributeForLocalizedName(comparableReference);
      }
      if (attribute !== undefined) {
        result.set(lowercaseReference, attribute.object);
        continue;
      }

      // Search skill. 
      let matchFound = false;
      const skills = this.getSkills();
      for (const skill of skills) {
        const skillData = skill.data.data;

        if (skill.name.toLowerCase() == comparableReference) {
          result.set(lowercaseReference, propertyPath !== undefined ? PropUtil.getNestedPropertyValue(skillData, propertyPath) : skillData);
          matchFound = true;
          break;
        }

        // Search skill ability.
        for (const ability of skillData.abilities) {
          if (ability.name.toLowerCase() == comparableReference) {
            result.set(lowercaseReference, propertyPath !== undefined ? PropUtil.getNestedPropertyValue(ability, propertyPath) : ability);
            matchFound = true;
            break;
          }
        }
        if (matchFound) break;
      }
      if (matchFound) continue;

      // Search asset.
      const assets = this.getPossessions().concat(this.getPropertyItems());
      const asset = _getMatchingDocument(assets, comparableReference);
      if (asset !== undefined) {
        result.set(lowercaseReference, propertyPath !== undefined ? PropUtil.getNestedPropertyValue(asset.data.data, propertyPath) : asset);
        continue;
      }
      
      // Search injury.
      const injuries = this.getInjuries();
      const injury = _getMatchingDocument(injuries, comparableReference);
      if (injury !== undefined) {
        result.set(lowercaseReference, propertyPath !== undefined ? PropUtil.getNestedPropertyValue(injury.data.data, propertyPath) : injury);
        continue;
      }
      
      // Search illness.
      const illnesses = this.getIllnesses();
      const illness = _getMatchingDocument(illnesses, comparableReference);
      if (illness !== undefined) {
        result.set(lowercaseReference, propertyPath !== undefined ? PropUtil.getNestedPropertyValue(illness.data.data, propertyPath) : illness);
        continue;
      }
      
      // Search mutation.
      const mutations = this.getMutations();
      const mutation = _getMatchingDocument(mutations, comparableReference);
      if (mutation !== undefined) {
        result.set(lowercaseReference, propertyPath !== undefined ? PropUtil.getNestedPropertyValue(mutation.data.data, propertyPath) : mutation);
        continue;
      }
      
      // Search fate-card.
      const fateCards = this.getFateCards();
      const fateCard = _getMatchingDocument(fateCards, comparableReference);
      if (fateCard !== undefined) {
        result.set(lowercaseReference, propertyPath !== undefined ? PropUtil.getNestedPropertyValue(fateCard.data.data, propertyPath) : fateCard);
        continue;
      }
    }

    return result;
  }
}
