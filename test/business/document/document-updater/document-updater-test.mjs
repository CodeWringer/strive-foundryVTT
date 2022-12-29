import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import DocumentUpdater from '../../../../business/document/document-updater/document-updater.mjs';
import * as PropertyUtility from '../../../../business/util/property-utility.mjs';

describe('DocumentUpdater', function() {
  // Globals
  let mockedLogger;
  let givenDocument;

  beforeEach(function() {
    // Mock logger. 
    mockedLogger = {
      log: () => {},
      logVerbose: () => {},
      logDebug: () => {},
      logWarn: () => {},
      logError: () => {},
    };

    // Mock document. 
    givenDocument = {
      id: "abc123",
      name: "A document",
      data: {
        _id: "abc123",
        name: "A document",
        aFunc: () => { return "Returned by aFunc" },
        anArray: [{ a: 1, b: 2.3 }, { a: 0, b: -999 }],
        data: {
          a: 42,
          b: "A string",
          c: [1, 2, 3],
          d: () => { return "real"; },
          e: { 
            eA: "eA", 
            eB: 41 
          }
        }
      },
      update: async (delta) => { return delta; }
    };
  });

  describe('_unnestData', function() {
    it('properly un-nests the "data" property', function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtility });
      const givenDto = {
        data: {
          data: {
            a: 42
          }
        }
      };
      // When
      const result = given._unnestData(givenDto);
      // Then
      result.data.a.should.be.equal(42);
    });

    it('does nothing when "data" is not nested', function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtility });
      const givenDto = {
        a: {
          data: {
            c: 42
          }
        }
      };
      // When
      const result = given._unnestData(givenDto);
      // Then
      result.a.data.c.should.be.equal(42);
    });

    it('does nothing when there is no "data"', function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtility });
      const givenDto = {
        a: {
          c: 42
        }
      };
      // When
      const result = given._unnestData(givenDto);
      // Then
      result.a.c.should.be.equal(42);
    });
  });

  describe("_buildDto", function() {
    it("builds an expected dto for primitive", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtility });
      const givenPath = "data.data.b";
      const givenNewValue = "A modified string";
      // When
      const dto = given._buildDto(givenDocument, givenPath, givenNewValue);
      // Then
      dto.should.be.deepEqual({
        data: {
          b: givenNewValue,
        }
      });
    });

    it("builds an expected dto for object", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtility });
      const givenPath = "data.data.e.eA";
      const givenNewValue = "A modified string";
      // When
      const dto = given._buildDto(givenDocument, givenPath, givenNewValue);
      // Then
      dto.should.be.deepEqual({
        data: {
          e: {
            eA: givenNewValue
          }
        }
      });
    });

    it("builds an expected dto for array", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtility });
      const givenPath = "data.data.c";
      const givenNewValue = [4, 5, 6];
      sinon.spy(mockedLogger, "logWarn");
      // When
      const dto = given._buildDto(givenDocument, givenPath, givenNewValue);
      // Then
      dto.should.be.deepEqual({
        data: {
          c: givenNewValue
        }
      });
      mockedLogger.logWarn.should.be.calledOnce();
    });

    it("builds an expected dto for nested array", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtility });
      const givenDocument = {
        id: "abc123",
        name: "A document",
        data: {
          _id: "abc123",
          data: {
            anArray: [
              [{ a: 1, b: 2}, { a: 3, b: 4 }],
              [{ a: 5, b: 6}, { a: 7, b: 8 }]
            ],
          }
        }
      };
      const givenPath = "data.data.anArray[0][1].b";
      const givenNewValue = 42;
      // When
      const dto = given._buildDto(givenDocument, givenPath, givenNewValue);
      // Then
      dto.should.be.deepEqual({
        data: {
          anArray: [
            [{ a: 1, b: 2}, { a: 3, b: givenNewValue }],
            [{ a: 5, b: 6}, { a: 7, b: 8 }]
          ]
        }
      });
    });

    it("builds an expected dto for property in object in array", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtility });
      const givenDocument = {
        id: "abc123",
        name: "A document",
        data: {
          _id: "abc123",
          data: {
            anArray: [
              { a: [1, 2, 3] }
            ],
          }
        }
      };
      const givenPath = "data.data.anArray[0].a";
      const givenNewValue = 42;
      // When
      const dto = given._buildDto(givenDocument, givenPath, givenNewValue);
      // Then
      dto.should.be.deepEqual({
        data: {
          anArray: [
            { a: givenNewValue }
          ]
        }
      });
    });

    it("builds an expected dto for array in object in array", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtility });
      const givenDocument = {
        id: "abc123",
        name: "A document",
        data: {
          _id: "abc123",
          data: {
            anArray: [
              { a: [1, 2, 3] }
            ],
          }
        }
      };
      const givenPath = "data.data.anArray[0].a[0]";
      const givenNewValue = 42;
      // When
      const dto = given._buildDto(givenDocument, givenPath, givenNewValue);
      // Then
      dto.should.be.deepEqual({
        data: {
          anArray: [
            { a: [givenNewValue, 2, 3] }
          ]
        }
      });
    });

    it("builds an expected dto for element of array", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtility });
      const givenPath = "data.anArray[0].b";
      const givenNewValue = 55;
      sinon.spy(mockedLogger, "logWarn");
      // When
      const dto = given._buildDto(givenDocument, givenPath, givenNewValue);
      // Then
      dto.should.be.deepEqual({
        data: {
          anArray: [{ a: 1, b: givenNewValue }, { a: 0, b: -999 }]
        }
      });
      mockedLogger.logWarn.should.be.calledOnce();
    });

    it("throws on undefined path", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtility });
      const givenPath = undefined;
      const givenNewValue = 42;
      const call = () => { given._buildDto(givenDocument, givenPath, givenNewValue) }
      // Then
      call.should.throw(/^Invalid property path.*/i);
    });

    it("throws on blank path", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtility });
      const givenPath = "";
      const givenNewValue = 42;
      const call = () => { given._buildDto(givenDocument, givenPath, givenNewValue) }
      // Then
      call.should.throw(/^Invalid property path.*/i);
    });

    it("throws on function as value", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtility });
      const givenPath = "data.data.d";
      const givenNewValue = (() => {});
      const call = () => { given._buildDto(givenDocument, givenPath, givenNewValue) }
      // Then
      call.should.throw(/^Detected a function.*/i);
    });

    it("throws on function in path", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtility });
      const givenPath = "data.aFunc.doesnotexist";
      const givenNewValue = 42;
      const call = () => { given._buildDto(givenDocument, givenPath, givenNewValue) }
      // Then
      call.should.throw(/^Detected a function as part.*/i);
    });

    it("throws on primitive in path", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtility });
      const givenPath = "data.name.doesnotexist";
      const givenNewValue = 42;
      const call = () => { given._buildDto(givenDocument, givenPath, givenNewValue) }
      // Then
      call.should.throw(/^Detected a primitive as part.*/i);
    });
  });

  describe("updateByPath", function() {
    it("Calls underlying update", async function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtility });
      const givenPath = "data.data.b";
      const givenNewValue = "A modified string";
      sinon.spy(givenDocument, "update");
      // When
      await given.updateByPath(givenDocument, givenPath, givenNewValue);
      // Then
      givenDocument.update.should.be.calledOnce();
    });
  });

  describe("deleteByPath", function() {
    it("Calls underlying update - element of array to remove", async function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtility });
      const givenPath = "data.data.c[1]";
      sinon.spy(givenDocument, "update");
      // When
      await given.deleteByPath(givenDocument, givenPath);
      // Then
      givenDocument.update.should.be.calledOnce();
    });

    it("Calls underlying update - property to remove", async function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtility });
      const givenPath = "data.data.b";
      sinon.spy(givenDocument, "update");
      // When
      await given.deleteByPath(givenDocument, givenPath);
      // Then
      givenDocument.update.should.be.calledOnce();
    });
  });
});
