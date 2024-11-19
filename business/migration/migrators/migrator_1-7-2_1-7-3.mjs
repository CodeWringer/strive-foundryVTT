import DocumentFetcher from "../../document/document-fetcher/document-fetcher.mjs";
import { GENERAL_DOCUMENT_TYPES } from "../../document/general-document-types.mjs";
import { PropertyUtil } from "../../util/property-utility.mjs";
import { ValidationUtil } from "../../util/validation-utility.mjs";
import AbstractMigrator from "../abstract-migrator.mjs";
import VersionCode from "../version-code.mjs";

export default class Migrator_1_7_2__1_7_3 extends AbstractMigrator {
  /** @override */
  get targetVersion() { return new VersionCode(1, 7, 2) };

  /** @override */
  get migratedVersion() { return new VersionCode(1, 7, 3) };

  /** @override */
  async _doWork() {
    // Fix up character template data.
    const actors = await new DocumentFetcher().findAll({
      documentType: GENERAL_DOCUMENT_TYPES.ACTOR,
      includeLocked: false,
      searchEmbedded: false,
    });

    // Also fetch actors from tokens, as there might be synthetic actors. 
    for (const sceneId of game.scenes.keys()) {
      const scene = game.scenes.get(sceneId);

      for (const tokenId of scene.tokens.keys()) {
        const token = scene.tokens.get(tokenId);

        actors.push(token.actor);
      }
    }

    for await (const actor of actors) {
      let actionPoints = actor.system.actionPoints;
      if (!ValidationUtil.isObject(actionPoints)) {
        actionPoints = actor.system.actionPoints.current ?? 0;
      }
      
      const maxActionPoints = (actor.system.maxActionPoints ?? PropertyUtil.guaranteeObject(actor.system.actionPoints).maximum) ?? 5;
      const actionPointRefill = (actor.system.actionPointRefill ?? PropertyUtil.guaranteeObject(PropertyUtil.guaranteeObject(actor.system.actionPoints).refill).amount) ?? 3;
      const allowAutomaticActionPointRefill = (actor.system.allowAutomaticActionPointRefill ?? PropertyUtil.guaranteeObject(PropertyUtil.guaranteeObject(actor.system.actionPoints).refill).enable) ?? true;
      
      let gritPoints = actor.system.gritPoints;
      if (!ValidationUtil.isObject(gritPoints)) {
        gritPoints = actor.system.gritPoints.current ?? 0;
      }
      const allowGritPoints = (actor.system.allowGritPoints ?? PropertyUtil.guaranteeObject(actor.system.gritPoints).enable) ?? false;

      await actor.update({
        system: {
          actionPoints: {
            current: actionPoints,
            maximum: maxActionPoints,
            refill: {
              amount: actionPointRefill,
              enable: allowAutomaticActionPointRefill,
            },
          },
          gritPoints: {
            current: gritPoints,
            enable: allowGritPoints,
          },
          "-=maxActionPoints": null,
          "-=actionPointRefill": null,
          "-=allowAutomaticActionPointRefill": null,
          "-=allowGritPoints": null,
        },
      });
    }
  }
}
