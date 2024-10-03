import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { ConstantsUtil } from '../../../business/util/constants-utility.mjs';

describe("constants-utility", () => {
  before(() => {
    globalThis.game = {
      i18n: {
        localize: (s) => { return "Berserk"; }
      }
    };
  });

  after(() => {
    globalThis.game = undefined;
  });

  describe("getAsChoices", () => {
    it("returns expected result, no excludes", () => {
      // Given
      const given = {
        berserk: {
          name: "berserk",
          localizableName: "states.berserk",
        },
        burning: {
          name: "burning",
          localizableName: "states.burning",
          icon: "icon.jpg"
        },
        bleeding: {
          name: "bleeding",
          localizableName: "states.bleeding",
        },
      };
      // When
      const r = ConstantsUtil.getAsChoices(given);
      // Then
      r.length.should.be.eql(3);

      r[0].value.should.be.eql("berserk");
      r[0].localizedValue.should.be.eql("Berserk");
      should.equal(r[0].icon, undefined);
      r[0].shouldDisplayValue.should.be.eql(true);
      r[0].shouldDisplayIcon.should.be.eql(false);

      r[1].value.should.be.eql("burning");
      r[1].localizedValue.should.be.eql("Berserk");
      r[1].icon.should.be.eql("icon.jpg");
      r[1].shouldDisplayValue.should.be.eql(true);
      r[1].shouldDisplayIcon.should.be.eql(true);
      
      r[2].value.should.be.eql("bleeding");
      r[2].localizedValue.should.be.eql("Berserk");
      should.equal(r[2].icon, undefined);
      r[2].shouldDisplayValue.should.be.eql(true);
      r[2].shouldDisplayIcon.should.be.eql(false);
    });

    it("returns expected result, with excludes", () => {
      // Given
      const given = {
        berserk: {
          name: "berserk",
          localizableName: "states.berserk",
        },
        burning: {
          name: "burning",
          localizableName: "states.burning",
          icon: "icon.jpg"
        },
        bleeding: {
          name: "bleeding",
          localizableName: "states.bleeding",
        },
      };
      // When
      const r = ConstantsUtil.getAsChoices(given, ["bleeding"]);
      // Then
      r.length.should.be.eql(2);

      r[0].value.should.be.eql("berserk");
      r[0].localizedValue.should.be.eql("Berserk");
      should.equal(r[0].icon, undefined);
      r[0].shouldDisplayValue.should.be.eql(true);
      r[0].shouldDisplayIcon.should.be.eql(false);

      r[1].value.should.be.eql("burning");
      r[1].localizedValue.should.be.eql("Berserk");
      r[1].icon.should.be.eql("icon.jpg");
      r[1].shouldDisplayValue.should.be.eql(true);
      r[1].shouldDisplayIcon.should.be.eql(true);
    });
  });

  describe("getAsArray", () => {
    it("returns expected result, no excludes", () => {
      // Given
      const given = {
        berserk: {
          name: "berserk",
          localizableName: "states.berserk",
        },
        burning: {
          name: "burning",
          localizableName: "states.burning",
          icon: "icon.jpg"
        },
        bleeding: {
          name: "bleeding",
          localizableName: "states.bleeding",
        },
      };
      // When
      const r = ConstantsUtil.getAsArray(given);
      // Then
      r.length.should.be.eql(3);

      r[0].name.should.be.eql("berserk");
      r[0].localizableName.should.be.eql("states.berserk");
      should.equal(r[0].icon, undefined);

      r[1].name.should.be.eql("burning");
      r[1].localizableName.should.be.eql("states.burning");
      r[1].icon.should.be.eql("icon.jpg");

      r[2].name.should.be.eql("bleeding");
      r[2].localizableName.should.be.eql("states.bleeding");
      should.equal(r[2].icon, undefined);
    });

    it("returns expected result, with excludes", () => {
      // Given
      const given = {
        berserk: {
          name: "berserk",
          localizableName: "states.berserk",
        },
        burning: {
          name: "burning",
          localizableName: "states.burning",
          icon: "icon.jpg"
        },
        bleeding: {
          name: "bleeding",
          localizableName: "states.bleeding",
        },
      };
      // When
      const r = ConstantsUtil.getAsArray(given, ["burning"]);
      // Then
      r.length.should.be.eql(2);

      r[0].name.should.be.eql("berserk");
      r[0].localizableName.should.be.eql("states.berserk");
      should.equal(r[0].icon, undefined);

      r[1].name.should.be.eql("bleeding");
      r[1].localizableName.should.be.eql("states.bleeding");
      should.equal(r[1].icon, undefined);
    });
  });
});