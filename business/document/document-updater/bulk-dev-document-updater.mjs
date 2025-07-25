import { SKILL_TAGS } from "../../tags/system-tags.mjs";
import { ArrayUtil } from "../../util/array-utility.mjs";
import { ValidationUtil } from "../../util/validation-utility.mjs";
import { DOCUMENT_COLLECTION_SOURCES } from "../document-fetcher/document-collection-source.mjs";
import DocumentFetcher from "../document-fetcher/document-fetcher.mjs";

/**
 * 
 */
export default class BulkDevDocumentUpdater {
  /**
   * Updates the skill documents of all actors found in the pack with the given name. 
   * 
   * Does not overwrite custom or innate skills. 
   * 
   * @param {Object} args
   * @param {String} args.packName Name of the pack to update. 
   * E. g. `"world.fantasy-bestiary"`
   * @param {Function | undefined} args.onBeginDocument Invoked when updates of a document 
   * have begun. 
   * @param {Function | undefined} args.onCompleteDocument Invoked when updates of a document 
   * have finished. 
   * 
   * @async
   */
  async updateAllSkillsOfActorsOfPack(args = {}) {
    ValidationUtil.validateOrThrow(args, ["packName"]);

    this.onBeginDocument = args.onBeginDocument ?? (() => {});
    this.onCompleteDocument = args.onCompleteDocument ?? (() => {});

    const docFetcher = new DocumentFetcher();
    const actors = await docFetcher.findAll({
      documentType: "Actor",
      searchEmbedded: false,
      includeLocked: false,
    });
    const skills = await docFetcher.findAll({
      documentType: "Item",
      contentType: "skill",
      source: DOCUMENT_COLLECTION_SOURCES.systemAndModuleCompendia,
      searchEmbedded: false,
      includeLocked: true,
    });

    let currentProgress = 0;
    const maxProgress = actors.length;
    for await (const actor of actors) {
      if (actor.pack !== args.packName) continue;

      this.onBeginDocument(actor, currentProgress, maxProgress);
      const skillsOfActor = actor.items.filter(it => it.type === "skill");

      for await (const skill of skillsOfActor) {
        const transientSkill = skill.getTransientObject();
        if (ArrayUtil.arrayContains(transientSkill.tags, SKILL_TAGS.INNATE.id)) continue;
      }

      currentProgress++;
      this.onCompleteDocument(actor, currentProgress, maxProgress);
    }
  }
}
