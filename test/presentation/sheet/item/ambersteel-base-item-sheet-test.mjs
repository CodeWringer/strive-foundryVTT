import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import AmbersteelBaseItemSheet from '../../../../presentation/sheet/item/ambersteel-base-item-sheet.mjs';

describe("AmbersteelBaseItemSheet", () => {
  beforeEach((done) => {
    globalThis.game = {
      ambersteel: {
        viewModels: new Map(),
        viewStates: new Map(),
        enableViewModelCaching: false,
      },
    };

    done();
  });

  describe("template", () => {
    it("throws error when not implemented", () => {
      // Given
      const given = new AmbersteelBaseItemSheet();
      const call = sinon.spy(() => { given.template; });
      // Then
      call.should.throw();
    })
  });

  describe("title", () => {
    it("throws error when not implemented", () => {
      // Given
      const given = new AmbersteelBaseItemSheet();
      const call = sinon.spy(() => { given.title; });
      // Then
      call.should.throw();
    })
  });

  describe("getViewModel", () => {
    it("returns new instance when enableViewModelCaching = false", () => {
      // Given
      game.ambersteel.enableViewModelCaching = false;

      const givenContext = {
        isEditable: true,
        isSendable: true,
        isOwner: true,
      };
      const givenDocumentId = "3566735a7";
      const givenDocument = {
        id: givenDocumentId,
      }
      
      const given = new AmbersteelBaseItemSheet();

      const spyUpdate = sinon.spy(() => {});
      const spyGetViewModel = sinon.spy(() => {
        const fakeViewModel = {
          id: "abc123",
          update: spyUpdate,
        };
        return fakeViewModel;
      });
      given._getViewModel = spyGetViewModel;
      // When
      let r = given.getViewModel(givenContext, givenDocument);
      // Then
      spyGetViewModel.should.have.been.calledOnce();
      spyUpdate.should.not.have.been.called();
      // When
      r = given.getViewModel(givenContext, givenDocument);
      // Then
      spyGetViewModel.should.have.been.calledTwice();
      spyUpdate.should.not.have.been.called();
    });

    it("returns new instance when enableViewModelCaching = true", () => {
      // Given
      game.ambersteel.enableViewModelCaching = true;

      const givenContext = {
        isEditable: true,
        isSendable: true,
        isOwner: true,
      };
      const givenDocumentId = "3566735a7";
      const givenDocument = {
        id: givenDocumentId,
      }
      
      const given = new AmbersteelBaseItemSheet();

      const spyUpdate = sinon.spy(() => {});
      const spyGetViewModel = sinon.spy(() => {
        const fakeViewModel = {
          id: "abc123",
          update: spyUpdate,
        };
        return fakeViewModel;
      });
      given._getViewModel = spyGetViewModel;
      // When
      let r = given.getViewModel(givenContext, givenDocument);
      // Then
      spyGetViewModel.should.have.been.calledOnce();
      spyUpdate.should.not.have.been.called();
      // When
      r = given.getViewModel(givenContext, givenDocument);
      // Then
      spyGetViewModel.should.not.have.been.calledTwice();
      spyUpdate.should.have.been.calledOnce();
    });
  });
});