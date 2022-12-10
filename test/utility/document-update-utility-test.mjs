import { unnestData } from "../../business/document/document-update-utility.mjs";

describe('document-update-utility', function() {
  describe('unnestData', function() {
    it('properly un-nests the "data" property', function() {
      // Given
      const dto = {
        data: {
          data: {
            a: 42
          }
        }
      };
      // When
      const newDto = unnestData(dto);
      // Then
      newDto.data.a.should.be.equal(42);
    });

    it('does nothing when "data" is not nested', function() {
      // Given
      const dto = {
        a: {
          data: {
            c: 42
          }
        }
      };
      // When
      const newDto = unnestData(dto);
      // Then
      newDto.a.data.c.should.be.equal(42);
    });
  });
});
