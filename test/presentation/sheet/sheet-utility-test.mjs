import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { getElementValue, setElementValue } from '../../../presentation/sheet/sheet-utility.mjs';

describe("sheet-utility", () => {
  before(() => {
    globalThis.$ = (element) => {
      const r = [element];
      r.find = () => {
        return element.options;
      }
      return r;
    }
  });

  describe("getElementValue", () => {
    it("correctly gets the value of the given select element", () => {
      // Given
      const givenValue = "b1";
      const givenElement = {
        tagName: "SELECT",
        selectedIndex: 1,
        options: [
          { value: "a0" },
          { value: givenValue },
          { value: "c2" },
        ],
      };
      // When
      const r = getElementValue(givenElement);
      // Then
      r.should.be.eql(givenValue);
    });
    
    it("correctly gets the value of the given checkbox element", () => {
      // Given
      const givenValue = true;
      const givenElement = {
        tagName: "INPUT",
        type: "CHECKBOX",
        checked: givenValue,
      };
      // When
      const r = getElementValue(givenElement);
      // Then
      r.should.be.eql(givenValue);
    });

    it("correctly gets the value of the given other element", () => {
      // Given
      const givenValue = "givenValue";
      const givenElement = {
        tagName: "INPUT",
        value: givenValue
      };
      // When
      const r = getElementValue(givenElement);
      // Then
      r.should.be.eql(givenValue);
    });
  });

  describe("setElementValue", () => {
    it("correctly sets the value of the given select element", () => {
      // Given
      const givenValue = "b1";
      const givenOptions = [
        { value: "a0" },
        { value: givenValue },
        { value: "c2" },
      ];
      const givenElement = {
        tagName: "SELECT",
        selectedIndex: 0,
        options: givenOptions,
        find: () => { return givenOptions },
      };
      // When
      setElementValue(givenElement, givenValue);
      // Then
      givenElement.selectedIndex.should.be.eql(1);
    });
    
    it("correctly sets the value of the given checkbox element", () => {
      // Given
      const givenValue = true;
      const givenElement = {
        tagName: "INPUT",
        type: "CHECKBOX",
        checked: !givenValue,
      };
      // When
      setElementValue(givenElement, givenValue);
      // Then
      givenElement.checked.should.be.eql(givenValue);
    });

    it("correctly sets the value of the given other element", () => {
      // Given
      const givenValue = "givenValue";
      const givenElement = {
        tagName: "INPUT",
        type: "TEXT",
        value: null
      };
      // When
      setElementValue(givenElement, givenValue);
      // Then
      givenElement.value.should.be.eql(givenValue);
    });
  });
});