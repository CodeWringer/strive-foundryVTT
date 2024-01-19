import { DOCUMENT_COLLECTION_SOURCES } from "../../document/document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "../../document/document-fetcher/document-fetcher.mjs";
import DocumentUpdater from "../../document/document-updater/document-updater.mjs";
import AbstractMigrator from "../abstract-migrator.mjs";
import { MIGRATORS } from "../migrators.mjs";
import VersionCode from "../version-code.mjs";
import * as PropertyUtility from "../../util/property-utility.mjs";

export default class Migrator_1_5_5__1_5_6 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 5, 5) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 5, 6) };

  /**
   * @type {DocumentUpdater}
   * @readonly
   * @protected
   */
  get updater() {
    if (this._updater === undefined) {
      this._updater = new DocumentUpdater({
        propertyUtility: PropertyUtility,
        logger: game.ambersteel.logger,
      });
    }
    return this._updater;
  }

  /**
   * @type {DocumentFetcher}
   * @readonly
   * @protected
   */
  get fetcher() {
    if (this._fetcher === undefined) {
      this._fetcher = new DocumentFetcher();
    }
    return this._fetcher;
  }

  /**
   * @type {Array<Object>}
   * @readonly
   */
  get attributeDefinitions() { return [
    { group: "physical", attribute: "agility" },
    { group: "physical", attribute: "endurance" },
    { group: "physical", attribute: "perception" },
    { group: "physical", attribute: "strength" },
    { group: "physical", attribute: "toughness" },
    { group: "mental", attribute: "intelligence" },
    { group: "mental", attribute: "wisdom" },
    { group: "mental", attribute: "arcana" },
    { group: "social", attribute: "empathy" },
    { group: "social", attribute: "oratory" },
    { group: "social", attribute: "willpower" },
  ]; }

  /**
   * Returns the system definition of the intimidation skill. 
   * 
   * @type {Object}
   * @readonly
   */
  get intimidationSkillDefinition() {
    if (this._intimidationSkillDefinition === undefined) {
      this._intimidationSkillDefinition = this.fetcher.find({
        name: "Intimidation",
        documentType: "Item",
        contentType: "skill",
        source: DOCUMENT_COLLECTION_SOURCES.systemCompendia,
        includeLocked: true,
      });
      if (this._intimidationSkillDefinition === undefined) {
        game.ambersteel.logger.logWarn('"Intimidation" skill cannot be migrated, as it is missing from the system compendium!');
      }
    }
    return this._intimidationSkillDefinition;
  }

  /**
   * Returns the system definition of the intimidation skill. 
   * 
   * @type {Object}
   * @readonly
   */
  get unarmedSkillDefinition() {
    if (this._unarmedSkillDefinition === undefined) {
      this._unarmedSkillDefinition = this.fetcher.find({
        name: "Unarmed Combat",
        documentType: "Item",
        contentType: "skill",
        source: DOCUMENT_COLLECTION_SOURCES.systemCompendia,
        includeLocked: true,
      });
      if (this._unarmedSkillDefinition === undefined) {
        game.ambersteel.logger.logWarn('"Unarmed Combat" skill cannot be migrated, as it is missing from the system compendium!');
      }
    }
    return this._unarmedSkillDefinition;
  }

  /** @override */
  async _doWork() {
    // Get all _editable_ actors. 
    // Locked compendia will be excluded in the search. FoundryVTT doesn't allow 
    // editing them and chances are we're dealing with system compendia, 
    // which shouldn't be touched, anyway. 
    const editableActors = await this.fetcher.findAll({
      documentType: "Actor",
      source: DOCUMENT_COLLECTION_SOURCES.all,
      includeLocked: false,
    });

    for (const actor of editableActors) {
      if (actor.type === "plain") continue;

      await this._migrateAttributeLevelModifier(actor);
      await this._migrateSkillLevelModifier(actor);
      await this._replaceSkillWithDefinition(actor, "Intimidation", this.intimidationSkillDefinition);
      await this._replaceSkillWithDefinition(actor, "Weapon <Unarmed>", this.unarmedSkillDefinition);
    }
  }

  /**
   * Migrates from the `moddedLevel` to the `levelModifier` field for all attributes 
   * of the given actor.  
   * 
   * @param {Object} actor 
   * 
   * @async
   */
  async _migrateAttributeLevelModifier(actor) {
    // Determine update delta for the actor. 
    const updateDelta = {
      attributes: {
        physical: {},
        mental: {},
        social: {},
      },
    };

    const actorData = this._getData(actor);

    // Collect attribute updates. 
    for (const attributeDefinition of this.attributeDefinitions) {
      const attributeData = actorData.attributes[attributeDefinition.group][attributeDefinition.attribute];
      
      let levelModifier = 0;
      if (attributeData.moddedLevel !== undefined) {
        levelModifier = parseInt(attributeData.moddedLevel) - parseInt(attributeData.level);
      } else {
        levelModifier = attributeData.levelModifier;
      }

      updateDelta.attributes[attributeDefinition.group][attributeDefinition.attribute] = {
        "-=moddedLevel": null,
        levelModifier: levelModifier,
      };
    }

    // Do the update. 
    const dataPath = this._getDataPath(actor);
    await this.updater.updateByPath(actor, dataPath, updateDelta, false);
  }

  /**
   * Migrates from the `moddedLevel` to the `levelModifier` field for all skills 
   * of the given actor. 
   * 
   * @param {Object} actor 
   * 
   * @async
   */
  async _migrateSkillLevelModifier(actor) {
    // Get all _editable_ skills on the given actor. 
    for (const item of actor.items) {
      if (item.type !== "skill") continue;

      // Collect update delta. 
      const itemData = this._getData(item);
      let levelModifier = 0;
      if (itemData.moddedLevel !== undefined) {
        levelModifier = parseInt(itemData.moddedLevel) - parseInt(itemData.level);
      } else {
        levelModifier = itemData.levelModifier;
      }
      const updateDelta = {
        "-=moddedLevel": null,
        levelModifier: levelModifier,
      };
      
      // Do the update. 
      const dataPath = this._getDataPath(item);
      await this.updater.updateByPath(item, dataPath, updateDelta, false);
    }
  }

  /**
   * Replaces the "Intimidation" skill of the given actor with the compendium definition, 
   * if possible. 
   * 
   * @param {Object} actor 
   * @param {String} oldSkillName Name of the skill to migrate. Note this must be its 
   * "old" name, as the definition's name might be different from the one of the skill 
   * on the actor. 
   * * E. g. `"Intimidation"`
   * @param {Object} definition The definition whose data to use for replacements. 
   * 
   * @async
   */
  async _replaceSkillWithDefinition(actor, oldSkillName, definition) {
    const skillOfActor = actor.items.find(it => it.name === oldSkillName);

    if (skillOfActor === undefined) return;

    const updateDelta = {
      name: definition.name,
      img: definition.img,
      system: {
        abilities: definition.expertises,
        category: definition.category,
        description: definition.description,
        displayOrders: definition.displayOrders,
        headState: definition.headState,
        gmNotes: definition.gmNotes,
        properties: definition.properties,
        relatedAttribute: definition.relatedAttribute,
        isCustom: false,
      },
    };

    // Do the update. 
    const dataPath = this._getDataPath(skillOfActor);
    await this.updater.updateByPath(skillOfActor, dataPath, updateDelta, false);
  }
}

MIGRATORS.push(new Migrator_1_5_5__1_5_6());
