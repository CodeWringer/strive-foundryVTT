import DocumentUpdater from "../../document/document-updater/document-updater.mjs";
import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";
import DocumentFetcher from "../../document/document-fetcher/document-fetcher.mjs";
import { DOCUMENT_COLLECTION_SOURCES } from "../../document/document-fetcher/document-collection-source.mjs";
import { HEALTH_CONDITIONS } from "../../ruleset/health/health-states.mjs";
import { PropertyUtil } from "../../util/property-utility.mjs";
import { ArrayUtil } from "../../util/array-utility.mjs";

export default class Migrator_1_5_4__1_5_5 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 5, 4) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 5, 5) };

  /**
   * @type {DocumentUpdater}
   * @readonly
   * @protected
   */
  get updater() {
    if (this._updater === undefined) {
      this._updater = new DocumentUpdater({
        propertyUtility: PropertyUtil,
        logger: game.strive.logger,
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

    const attributeDefinitions = [
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
    ];

    for (const actor of editableActors) {
      if (actor.type === "plain") continue;

      const actorData = this._getData(actor);

      // Migrate attribute progress. 
      
      // Determine update delta for the actor. 
      const updateDelta = {
        attributes: {
          physical: {},
          mental: {},
          social: {},
        },
      };

      let migratable = true;

      // Collect attribute updates. 
      for (const attributeDefinition of attributeDefinitions) {
        const attributeData = actorData.attributes[attributeDefinition.group][attributeDefinition.attribute];
        
        if (attributeData.successes !== undefined && attributeData.failures !== undefined) {
          const progress = parseInt(attributeData.successes) + parseInt(attributeData.failures);
          updateDelta.attributes[attributeDefinition.group][attributeDefinition.attribute] = {
            "-=successes": null,
            "-=failures": null,
            progress: progress,
          };
        } else {
          game.strive.logger.logWarn(`Skipping actor attribute migration for actor '${actor.name}' because of missing 'successes' and 'failures' field`);
          migratable = false;
          break;
        }
      }

      // Collect health state updates. 
      const priorHealthStateName = "dazed";

      if (ArrayUtil.arrayContains(actorData.health.states, priorHealthStateName) === true) {
        updateDelta.health = {
          states: ArrayUtil.arrayTakeUnless(actorData.health.states, (it) => {
            return it === priorHealthStateName;
          }),
        }
        updateDelta.health.states.push(HEALTH_CONDITIONS.exhausted.name);
      }

      if (migratable === true) {
        // Do the update. 
        const dataPath = this._getDataPath(actor);
        await this.updater.updateByPath(actor, dataPath, updateDelta, false);
      }
    }

    const throwingSkillId = "m9u2l71cg9791dwR";
    let throwingSkillFromPack = await this.fetcher.find({
      id: throwingSkillId,
      documentType: "Item",
      contentType: "skill",
      source: DOCUMENT_COLLECTION_SOURCES.systemCompendia,
      searchEmbedded: false,
      includeLocked: true,
    });
    if (throwingSkillFromPack === undefined) {
      // Try again. Perhaps the id changed?
      game.strive.logger.logWarn(`Id of "Throwing" skill "${throwingSkillId}" changed unexpectedly and can no longer be found!`);
      throwingSkillFromPack = await this.fetcher.find({
        name: "Throwing",
        documentType: "Item",
        contentType: "skill",
        source: DOCUMENT_COLLECTION_SOURCES.systemCompendia,
        searchEmbedded: false,
        includeLocked: true,
      });
    }
    if (throwingSkillFromPack === undefined) {
      // Cannot migrate skill!
      game.strive.logger.logWarn('"Throwing" skill cannot be migrated, as it is missing from the system compendium!');
      return;
    }

    // Collect embedded document updates.
    for (const actor of editableActors) {
      // Exchange "Weapon-Throwing" with "Throwing". 
      const weaponThrowingSkill = actor.items.find(it => it.name === "Weapon-Throwing");
      if (weaponThrowingSkill !== undefined) {
        const skillData = this._getData(weaponThrowingSkill);
        const level = skillData.level;
        const moddedLevel = skillData.moddedLevel;
        const successes = skillData.successes;
        const failures = skillData.failures;

        await weaponThrowingSkill.delete();
        await Item.create({
          id: throwingSkillFromPack.id,
          name: throwingSkillFromPack.name,
          type: throwingSkillFromPack.type,
          img: throwingSkillFromPack.img,
          system: {
            abilities: throwingSkillFromPack.expertises,
            category: throwingSkillFromPack.category,
            description: throwingSkillFromPack.description,
            displayOrders: throwingSkillFromPack.displayOrders,
            headState: throwingSkillFromPack.headState,
            gmNotes: throwingSkillFromPack.gmNotes,
            properties: throwingSkillFromPack.properties,
            relatedAttribute: throwingSkillFromPack.relatedAttribute,
            isCustom: false,
            level: level,
            moddedLevel: moddedLevel,
            successes: successes,
            failures: failures,
          }
        }, { parent: actor });
      }
    }
  }
}
