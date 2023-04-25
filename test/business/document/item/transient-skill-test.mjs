import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import TransientSkill from '../../../../business/document/item/transient-skill.mjs';
import { SKILL_PROPERTIES } from '../../../../business/document/item/item-properties.mjs';
import { BaseLoggingStrategy } from '../../../../business/logging/base-logging-strategy.mjs';

describe("TransientSkill", () => {

  beforeEach(function () {
    globalThis.game = {
      ambersteel: {
        logger: sinon.createStubInstance(BaseLoggingStrategy),
      },
    };
  });

  describe("isMagicSchool", () => {
    describe("get", () => {
      it("returns false on non-existent properties field", () => {
        // Given
        const givenDocument = {
          system: {}
        };
        const given = new TransientSkill(givenDocument);
        // When
        const r = given.isMagicSchool;
        // Then
        r.should.be.eql(false);
      });

      it("returns false on empty properties list", () => {
        // Given
        const givenDocument = {
          system: {
            properties: []
          }
        };
        const given = new TransientSkill(givenDocument);
        // When
        const r = given.isMagicSchool;
        // Then
        r.should.be.eql(false);
      });

      it("returns true when the property is present in the properties list", () => {
        // Given
        const givenDocument = {
          system: {
            properties: [SKILL_PROPERTIES.MAGIC_SCHOOL.id]
          }
        };
        const given = new TransientSkill(givenDocument);
        // When
        const r = given.isMagicSchool;
        // Then
        r.should.be.eql(true);
      });
    });

    describe("set", () => {
      it("sets true correctly on non-existent properties", () => {
        // Given
        const givenDocument = {
          system: {},
          update: sinon.fake(),
        };
        const given = new TransientSkill(givenDocument);
        // When
        given.isMagicSchool = true;
        // Then
        givenDocument.update.should.have.been.calledOnce();
        givenDocument.update.should.have.been.calledWith({
          system: {
            properties: [SKILL_PROPERTIES.MAGIC_SCHOOL.id],
          }
        }, { render: true });
      });

      it("sets true correctly on existing but empty properties", () => {
        // Given
        const givenDocument = {
          system: {
            properties: [],
          },
          update: sinon.fake(),
        };
        const given = new TransientSkill(givenDocument);
        // When
        given.isMagicSchool = true;
        // Then
        givenDocument.update.should.have.been.calledOnce();
        givenDocument.update.should.have.been.calledWith({
          system: {
            properties: [SKILL_PROPERTIES.MAGIC_SCHOOL.id],
          }
        }, { render: true });
      });

      it("sets false correctly on existing properties with contained property", () => {
        // Given
        const givenDocument = {
          system: {
            properties: [SKILL_PROPERTIES.MAGIC_SCHOOL.id],
          },
          update: sinon.fake(),
        };
        const given = new TransientSkill(givenDocument);
        // When
        given.isMagicSchool = false;
        // Then
        givenDocument.update.should.have.been.calledOnce();
        givenDocument.update.should.have.been.calledWith({
          system: {
            properties: [],
          }
        }, { render: true });
      });

      it("doesn't set true on existing properties with contained property", () => {
        // Given
        const givenDocument = {
          system: {
            properties: [SKILL_PROPERTIES.MAGIC_SCHOOL.id],
          },
          update: sinon.fake(),
        };
        const given = new TransientSkill(givenDocument);
        // When
        given.isMagicSchool = true;
        // Then
        givenDocument.update.should.not.have.been.called();
      });
    });
  });
});
