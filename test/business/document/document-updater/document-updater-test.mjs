import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import DocumentUpdater from '../../../../business/document/document-updater/document-updater.mjs';
import { PropertyUtil } from '../../../../business/util/property-utility.mjs';

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
      aFunc: () => { return "Returned by aFunc" },
      system: {
        anArray: [{ a: 1, b: 2.3 }, { a: 0, b: -999 }],
        a: 42,
        b: "A string",
        c: [1, 2, 3],
        d: () => { return "real"; },
        e: { 
          eA: "eA", 
          eB: 41 
        }
      },
      update: async (delta) => { return delta; }
    };
  });

  describe("_buildDto", function() {
    it("builds an expected dto for primitive", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtil });
      const givenPath = "system.b";
      const givenNewValue = "A modified string";
      // When
      const dto = given._buildDto(givenDocument, givenPath, givenNewValue);
      // Then
      dto.should.be.deepEqual({
        system: {
          b: givenNewValue,
        }
      });
    });

    it("builds an expected dto for object", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtil });
      const givenPath = "system.e.eA";
      const givenNewValue = "A modified string";
      // When
      const dto = given._buildDto(givenDocument, givenPath, givenNewValue);
      // Then
      dto.should.be.deepEqual({
        system: {
          e: {
            eA: givenNewValue
          }
        }
      });
    });

    it("builds an expected dto for array", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtil });
      const givenPath = "system.c";
      const givenNewValue = [4, 5, 6];
      sinon.spy(mockedLogger, "logWarn");
      // When
      const dto = given._buildDto(givenDocument, givenPath, givenNewValue);
      // Then
      dto.should.be.deepEqual({
        system: {
          c: givenNewValue
        }
      });
      mockedLogger.logWarn.should.be.calledOnce();
    });

    it("builds an expected dto for nested array", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtil });
      const givenDocument = {
        id: "abc123",
        name: "A document",
        system: {
          anArray: [
            [{ a: 1, b: 2}, { a: 3, b: 4 }],
            [{ a: 5, b: 6}, { a: 7, b: 8 }]
          ],
        }
      };
      const givenPath = "system.anArray[0][1].b";
      const givenNewValue = 42;
      // When
      const dto = given._buildDto(givenDocument, givenPath, givenNewValue);
      // Then
      dto.should.be.deepEqual({
        system: {
          anArray: [
            [{ a: 1, b: 2}, { a: 3, b: givenNewValue }],
            [{ a: 5, b: 6}, { a: 7, b: 8 }]
          ]
        }
      });
    });

    it("builds an expected dto for property in object in array", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtil });
      const givenDocument = {
        id: "abc123",
        name: "A document",
        system: {
          anArray: [
            { a: [1, 2, 3] }
          ],
        }
      };
      const givenPath = "system.anArray[0].a";
      const givenNewValue = 42;
      // When
      const dto = given._buildDto(givenDocument, givenPath, givenNewValue);
      // Then
      dto.should.be.deepEqual({
        system: {
          anArray: [
            { a: givenNewValue }
          ]
        }
      });
    });

    it("builds an expected dto for array in object in array", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtil });
      const givenDocument = {
        id: "abc123",
        name: "A document",
        system: {
          anArray: [
            { a: [1, 2, 3] }
          ],
        }
      };
      const givenPath = "system.anArray[0].a[0]";
      const givenNewValue = 42;
      // When
      const dto = given._buildDto(givenDocument, givenPath, givenNewValue);
      // Then
      dto.should.be.deepEqual({
        system: {
          anArray: [
            { a: [givenNewValue, 2, 3] }
          ]
        }
      });
    });

    it("builds an expected dto for element of array", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtil });
      const givenPath = "system.anArray[0].b";
      const givenNewValue = 55;
      sinon.spy(mockedLogger, "logWarn");
      // When
      const dto = given._buildDto(givenDocument, givenPath, givenNewValue);
      // Then
      dto.should.be.deepEqual({
        system: {
          anArray: [{ a: 1, b: givenNewValue }, { a: 0, b: -999 }]
        }
      });
      mockedLogger.logWarn.should.be.calledOnce();
    });

    it("builds an expected dto with substituted object in the path", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtil });
      const givenPath = "system.f.g";
      const givenNewValue = 55;
      const spy = sinon.spy(mockedLogger, "logWarn");
      // When
      const dto = given._buildDto(givenDocument, givenPath, givenNewValue);
      // Then
      dto.should.be.deepEqual({
        system: {
          f: {
            g: givenNewValue
          }
        }
      });
      spy.should.have.been.calledOnce();
      spy.should.have.been.calledWith("Substituting missing object in path");
    });

    it("throws on undefined path", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtil });
      const givenPath = undefined;
      const givenNewValue = 42;
      const call = () => { given._buildDto(givenDocument, givenPath, givenNewValue) }
      // Then
      call.should.throw(/^Invalid property path.*/i);
    });

    it("throws on blank path", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtil });
      const givenPath = "";
      const givenNewValue = 42;
      const call = () => { given._buildDto(givenDocument, givenPath, givenNewValue) }
      // Then
      call.should.throw(/^Invalid property path.*/i);
    });

    it("throws on function as value", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtil });
      const givenPath = "system.d";
      const givenNewValue = (() => {});
      const call = () => { given._buildDto(givenDocument, givenPath, givenNewValue) }
      // Then
      call.should.throw(/^Detected a function.*/i);
    });

    it("throws on function in path", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtil });
      const givenPath = "aFunc.doesnotexist";
      const givenNewValue = 42;
      const call = () => { given._buildDto(givenDocument, givenPath, givenNewValue) }
      // Then
      call.should.throw(/^Detected a function as part.*/i);
    });

    it("throws on primitive in path", function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtil });
      const givenPath = "name.doesnotexist";
      const givenNewValue = 42;
      const call = () => { given._buildDto(givenDocument, givenPath, givenNewValue) }
      // Then
      call.should.throw(/^Detected a primitive as part.*/i);
    });
  });

  describe("updateByPath", function() {
    it("Calls underlying update", async function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtil });
      const givenPath = "system.b";
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
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtil });
      const givenPath = "system.c[1]";
      sinon.spy(givenDocument, "update");
      // When
      await given.deleteByPath(givenDocument, givenPath);
      // Then
      givenDocument.update.should.be.calledOnce();
    });

    it("Calls underlying update - property to remove", async function() {
      // Given
      const given = new DocumentUpdater({ logger: mockedLogger, propertyUtility: PropertyUtil });
      const givenPath = "system.b";
      sinon.spy(givenDocument, "update");
      // When
      await given.deleteByPath(givenDocument, givenPath);
      // Then
      givenDocument.update.should.be.calledOnce();
    });
  });
});
