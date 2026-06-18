import { ValidationUtil } from "../../../common/util/validation-utility.mjs"
import { ACTOR_TYPES } from "../../model/document/actor/actor-types.mjs"
import { DOCUMENT_COLLECTION_SOURCES } from "../../model/document/document-fetcher/document-collection-source.mjs"
import DocumentFetcher from "../../model/document/document-fetcher/document-fetcher.mjs"
import { GENERAL_DOCUMENT_TYPES } from "../../model/document/general-document-types.mjs"
import AbstractMigrator from "../abstract-migrator.mjs"
import VersionCode from "../version-code.mjs"

export default class Migrator_1_16_1__1_16_2 extends AbstractMigrator {
  /** @override */
  get fromVersion() { return new VersionCode(1, 16, 1) };

  /** @override */
  get toVersion() { return new VersionCode(1, 16, 2) };

  /** @override */
  async _doWork(args = {}) {
    // Get all editable actors.
    const actors = await new DocumentFetcher().findAll({
      documentType: GENERAL_DOCUMENT_TYPES.ACTOR,
      source: DOCUMENT_COLLECTION_SOURCES.all,
      includeLocked: false,
    });
    const totalProgress = actors.length;
    args.onBegin(totalProgress, "Updating actors");
    const transientActors = actors.map(it => it.getTransientObject());

    let currentProgress = 1;
    for await (const actor of transientActors) {
      const incrementTitle = ValidationUtil.isDefined(actor.pack) ? `${actor.pack} - ${actor.name}` : actor.name;
      args.onBeginIncrement(totalProgress, currentProgress, `Begun ${incrementTitle}`);

      if (actor.type === ACTOR_TYPES.PLAIN) {
        args.onCompleteIncrement(totalProgress, currentProgress, `Skipped ${incrementTitle} (plain actor)`);
        continue;
      }

      const slotGroups = [
        // Clothing
        {
          oldId: "b0fed8b3-1aa4-4b8e-a150-7c2fb647fe7e",
          newId: "b0fed8b31aa44b8e",
          slots: [
            { oldId: "458e47e6-f6ce-4841-83b2-0ac05c160a52", newId: "458e47e6f6ce4841" },
          ],
        },
        // Armor
        {
          oldId: "5af8c4db-de4a-4d2f-a3ed-9f8f18233cc5",
          newId: "5af8c4dbde4a4d2f",
          slots: [
            { oldId: "16b24ed7-de48-46fd-8849-82d7b2648b8d", newId: "16b24ed7de4846fd" },
          ],
        },
        // Hand
        {
          oldId: "d7c46adc-848a-4fc9-a73d-a3ba37c18cb3",
          newId: "d7c46adc848a4fc9",
          slots: [
            { oldId: "5321c233-8aef-43a5-b6a0-3b3309d31732", newId: "5321c2338aef43a5" },
            { oldId: "6348fbf9-0ec1-4dea-b6c7-d3a650c5a313", newId: "6348fbf90ec14dea" },
          ],
        },
        // Back
        {
          oldId: "4f44dbc4-8fd4-486d-a6d0-16d8b7642852",
          newId: "4f44dbc48fd4486d",
          slots: [
            { oldId: "112d2056-8754-48e3-bad0-31a6ef5d6a38", newId: "112d2056875448e3" },
          ],
        },
      ];

      for await (const slotGroup of slotGroups) {
        const oldGroup = actor.assets.equipmentSlotGroups.find(slot => slot.id === slotGroup.oldId);
        const newGroup = actor.assets.equipmentSlotGroups.find(slot => slot.id === slotGroup.newId);

        if (ValidationUtil.isDefined(oldGroup)) {
          if (ValidationUtil.isDefined(newGroup)) {
            // Move alotted asset IDs over. 
            for (const slot of slotGroup.slots) {
              const oldSlot = oldGroup.slots.find(it => it.id === slot.oldId);
              const newSlot = newGroup.slots.find(it => it.id === slot.newId);
  
              if (ValidationUtil.isDefined(oldSlot) && ValidationUtil.isDefined(newSlot)) {
                newSlot.alottedId = oldSlot.alottedId;
              }
            }
          }
          await oldGroup.delete();
        }
      }

      args.onCompleteIncrement(totalProgress, currentProgress, `Completed ${incrementTitle}`);
      currentProgress++;
    }
    args.onComplete();
  }
}
