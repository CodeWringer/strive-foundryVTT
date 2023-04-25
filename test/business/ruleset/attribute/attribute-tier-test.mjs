import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { ATTRIBUTE_TIERS, AttributeTier } from '../../../../business/ruleset/attribute/attribute-tier.mjs';

describe("AttributeTier", () => {
  it("constructs as expected", () => {
    // When
    const r = new AttributeTier({
      name: "a",
      localizableName: "b",
      icon: "c",
    });
    // Then
    r.name.should.be.eql("a");
    r.localizableName.should.be.eql("b");
    r.icon.should.be.eql("c");
  });

  it("throws on bad constructor call", () => {
    // Given
    const call = () => { new AttributeTier(); };
    // Then
    call.should.throw();
  });
});

describe("ATTRIBUTE_TIERS", () => {
  beforeEach(() => {
    globalThis.game = {
      i18n: {
        localize: sinon.fake(),
      },
    };
  });

  it("has expected fields", () => {
    // Then
    ATTRIBUTE_TIERS.underdeveloped.should.not.be.undefined();
    ATTRIBUTE_TIERS.average.should.not.be.undefined();
    ATTRIBUTE_TIERS.exceptional.should.not.be.undefined();
    ATTRIBUTE_TIERS.asChoices.should.not.be.undefined();
    ATTRIBUTE_TIERS.asArray.should.not.be.undefined();
  });
});
