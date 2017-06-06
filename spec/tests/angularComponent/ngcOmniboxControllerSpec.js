import NgcOmniboxController from '~/angularComponent/ngcOmniboxController.js';

describe('ngcOmnibox.angularComponent.ngcOmniboxController', () => {
  let omniboxController, document;
  const fakeEl = {
    addEventListener() {},
    removeEventListener() {},
    removeAttribute() {},
    setAttribute() {},
    querySelector() {},
    querySelectorAll() {},
    focus() {},
    blur() {},
    contains() {}
  };

  beforeEach(() => {

    document = Object.assign({}, fakeEl);
    document.styleSheets = [{insertRule: jasmine.createSpy(() => {})}];

    omniboxController = new NgcOmniboxController([document], [fakeEl], {$apply() {}});
    omniboxController._suggestionElements = [fakeEl, fakeEl, fakeEl, fakeEl];
    omniboxController.isSelectable = () => {};
    omniboxController.onChosen = () => {};
    omniboxController.onUnchosen = () => {};
  });

  it('should inject $document, $element, and $scope', () => {
    expect(NgcOmniboxController.$inject.join(',')).toBe('$document,$element,$scope');
  });

  it('should remove the focus ring when the component is focused', () => {
    expect(document.styleSheets[0].insertRule)
        .toHaveBeenCalledWith('ngc-omnibox:focus {outline: none}', 0);
  });

  it('should listen for field element focus events when the field is set', () => {
    const fieldEl = Object.assign({}, fakeEl);
    spyOn(fieldEl, 'addEventListener');
    spyOn(fieldEl, 'removeEventListener');

    omniboxController.fieldElement = fieldEl;
    expect(fieldEl.addEventListener).toHaveBeenCalled();

    const newFieldEl = Object.assign({}, fieldEl);
    omniboxController.fieldElement = newFieldEl;

    expect(fieldEl.removeEventListener).toHaveBeenCalled();
    expect(newFieldEl.addEventListener).toHaveBeenCalled();
  });

  it('should clear out the query when the ngModel changes when a match is required', () => {
    omniboxController.ngModel = ['one'];
    omniboxController.query = 'my query';
    omniboxController.ngModel.push('two');

    expect(omniboxController.query).toBe('my query');

    omniboxController.requireMatch = true;
    omniboxController.ngModel.push('three');
    expect(omniboxController.query).toBe('');
  });

  describe('when populating suggestions via the source function', () => {
    it('it should empty out the suggestions when resolving to a falsy value', (done, fail) => {
      omniboxController.query = 'my query';
      omniboxController.suggestions = ['suggestion 1', 'suggestion 2'];
      omniboxController.source = () => Promise.resolve(null);
      omniboxController.updateSuggestions().then(() => {
        expect(omniboxController.suggestions).toBe(null);
      }).then(done, fail);
    });

    it('it should set the suggestions when resolving to an Array', (done, fail) => {
      omniboxController.query = 'my query';
      omniboxController.suggestions = ['suggestion 1', 'suggestion 2'];
      omniboxController.source = () => Promise.resolve(['new suggestion 1', 'new suggestion 2']);
      omniboxController.updateSuggestions().then(() => {
        expect(omniboxController.suggestions.join(',')).toBe('new suggestion 1,new suggestion 2');
      }).then(done, fail);
    });

    it('it should throw an error when resolving to a truthy, non-Array value', (done, fail) => {
      omniboxController.query = 'my query';
      omniboxController.suggestions = ['suggestion 1', 'suggestion 2'];
      omniboxController.source = () => Promise.resolve(true);
      omniboxController.updateSuggestions().then(fail, (e) => {
        expect(e.message).toBe('Suggestions must be an Array');
      }).then(done, fail);
    });

    it('should support resolving suggestions and hints', (done, fail) => {
      omniboxController.query = 'my query';
      omniboxController.suggestions = [];
      omniboxController.source = () => {
        return Promise.resolve({
          suggestions: ['new suggestion 1', 'new suggestion 2'],
          hint: 'My Query is Awesome'
        });
      };
      omniboxController.updateSuggestions().then(() => {
        expect(omniboxController.suggestions.join(',')).toBe('new suggestion 1,new suggestion 2');
        expect(omniboxController.hint).toBe('my query is Awesome');
        expect(omniboxController.fullHint).toBe('My Query is Awesome');
      }).then(done, fail);
    });
  });

  describe('when determining if there are suggestions', () => {
    it('should return false for falsy values', () => {
      omniboxController.suggestions = false;
      expect(omniboxController.hasSuggestions).toBe(false);

      omniboxController.suggestions = null;
      expect(omniboxController.hasSuggestions).toBe(false);

      omniboxController.suggestions = '';
      expect(omniboxController.hasSuggestions).toBe(false);
    });

    it('should throw an Error for suggestions that aren\'t an Array', () => {
      const errorMsg = 'Suggestions must be an Array';

      expect(() => omniboxController.suggestions = 'false').toThrowError(errorMsg);
      expect(() => omniboxController.suggestions = true).toThrowError(errorMsg);
      expect(() => omniboxController.suggestions = 100).toThrowError(errorMsg);
      expect(() => omniboxController.suggestions = {test: 'me'}).toThrowError(errorMsg);
    });

    it('should return false for empty Arrays', () => {
      omniboxController.suggestions = [];
      expect(omniboxController.hasSuggestions).toBe(false);
    });

    it('should return true for non-empty Arrays', () => {
      omniboxController.suggestions = ['test', 'me'];
      expect(omniboxController.hasSuggestions).toBe(true);
    });
  });

  describe('building a flattened list representation of the suggestions', () => {
    it('should produce a list of UI objects with strings for data', () => {
      omniboxController.suggestions = ['test', 'me', 'now'];
      expect(JSON.stringify(omniboxController._suggestionsUiList)).toBe(JSON.stringify([
        {index: 0, data: 'test'},
        {index: 1, data: 'me'},
        {index: 2, data: 'now'}
      ]));
    });

    it('should product a flat list of UI objects from a nested list of suggestions', () => {
      omniboxController.suggestions = [
        {title: 'test', children: ['one', 'two', 'three']},
        {title: 'me', children: ['four', 'five', 'six']},
        {title: 'now', children: ['seven', 'eight', 'nine']}
      ];

      expect(JSON.stringify(omniboxController._suggestionsUiList)).toBe(JSON.stringify([
        {index: 0, data: {title: 'test', children: ['one', 'two', 'three']}},
        {index: 1, data: 'one'},
        {index: 2, data: 'two'},
        {index: 3, data: 'three'},
        {index: 4, data: {title: 'me', children: ['four', 'five', 'six']}},
        {index: 5, data: 'four'},
        {index: 6, data: 'five'},
        {index: 7, data: 'six'},
        {index: 8, data: {title: 'now', children: ['seven', 'eight', 'nine']}},
        {index: 9, data: 'seven'},
        {index: 10, data: 'eight'},
        {index: 11, data: 'nine'}
      ]));
    });
  });

  describe('when highlighting a specific suggestions', () => {
    beforeEach(() => {
      omniboxController.suggestions = ['one', 'two', 'three'];
      omniboxController.highlightedIndex = -1;
    });

    it('should know if a specific suggestion is highlighted if the index changes', () => {
      expect(omniboxController.isHighlighted('one')).toBe(false);

      omniboxController.highlightedIndex = 0;
      expect(omniboxController.isHighlighted('one')).toBe(true);
      expect(omniboxController.isHighlighted('two')).toBe(false);

      omniboxController.highlightedIndex = 1;
      expect(omniboxController.isHighlighted('one')).toBe(false);
      expect(omniboxController.isHighlighted('two')).toBe(true);
    });

    it('should highlight a specific suggestion', () => {
      omniboxController.highlightSuggestion('two');

      expect(omniboxController.highlightedIndex).toBe(1);
      expect(omniboxController.isHighlighted('two')).toBe(true);
    });

    it('should be able to highlight none', () => {
      omniboxController.highlightedIndex = 2;

      omniboxController.highlightNone();
      expect(omniboxController.highlightedIndex).toBe(-1);
    });

    it('should not highlight if highlighting is disabled', () => {
      omniboxController.isHighlightingDisabled = true;

      omniboxController.highlightSuggestion('one');
      expect(omniboxController.isHighlighted('one')).toBe(false);
      expect(omniboxController.highlightedIndex).toBe(-1);

      omniboxController.highlightSuggestion('two');
      expect(omniboxController.isHighlighted('two')).toBe(false);
      expect(omniboxController.highlightedIndex).toBe(-1);

      omniboxController.highlightedIndex = 1;
      omniboxController.highlightNone();
      expect(omniboxController.highlightedIndex).toBe(1);
    });

    it('should only highlight if isSelectable() is true', () => {
      omniboxController.isSelectable = () => true;

      omniboxController.highlightSuggestion('one');
      expect(omniboxController.isHighlighted('one')).toBe(true);
      expect(omniboxController.highlightedIndex).toBe(0);

      omniboxController.isSelectable = () => false;
      omniboxController.highlightedIndex = -1;

      omniboxController.highlightSuggestion('one');
      expect(omniboxController.isHighlighted('one')).toBe(false);
      expect(omniboxController.highlightedIndex).toBe(-1);

      omniboxController.highlightSuggestion('two');
      expect(omniboxController.isHighlighted('two')).toBe(false);
      expect(omniboxController.highlightedIndex).toBe(-1);
    });
  });

  describe('when navigating suggestions sequentially', () => {
    it('should highlight the next suggestion', () => {
      omniboxController.suggestions = ['test', 'me'];

      expect(omniboxController.highlightedIndex).toBe(-1);

      omniboxController.highlightNextSuggestion();
      expect(omniboxController.highlightedIndex).toBe(0);

      omniboxController.highlightNextSuggestion();
      expect(omniboxController.highlightedIndex).toBe(1);
    });

    it('should highlight the previous suggestion', () => {
      omniboxController.suggestions = ['test', 'me', 'too'];

      omniboxController.highlightedIndex = 1;

      omniboxController.highlightPreviousSuggestion();
      expect(omniboxController.highlightedIndex).toBe(0);
    });

    it('should wrap around the selection if match is required', () => {
      omniboxController.suggestions = ['test', 'me', 'again', 'please'];
      omniboxController.highlightedIndex = 0;
      omniboxController.requireMatch = true;

      omniboxController.highlightPreviousSuggestion();
      expect(omniboxController.highlightedIndex).toBe(3);

      omniboxController.highlightNextSuggestion();
      expect(omniboxController.highlightedIndex).toBe(0);
    });

    it('should select nothing when wrapping around the selection if match isn\'t  required', () => {
      omniboxController.suggestions = ['test', 'me', 'again', 'please'];
      omniboxController.highlightedIndex = 0;
      omniboxController.requireMatch = false;

      omniboxController.highlightPreviousSuggestion();
      expect(omniboxController.highlightedIndex).toBe(-1);

      omniboxController.highlightPreviousSuggestion();
      expect(omniboxController.highlightedIndex).toBe(3);

      omniboxController.highlightNextSuggestion();
      expect(omniboxController.highlightedIndex).toBe(-1);

      omniboxController.highlightNextSuggestion();
      expect(omniboxController.highlightedIndex).toBe(0);
    });

    it('should highlight nothing if all suggestions are non-selectable', () => {
      omniboxController.suggestions = ['test', 'me', 'again', 'please'];
      omniboxController.isSelectable = () => false;

      omniboxController.highlightedIndex = 0;
      omniboxController.highlightNextSuggestion();
      expect(omniboxController.highlightedIndex).toBe(-1);

      omniboxController.highlightedIndex = 3;
      omniboxController.highlightPreviousSuggestion();
      expect(omniboxController.highlightedIndex).toBe(-1);
    });
  });

  describe('suggestion visibility', () => {
    beforeEach(() => {
      omniboxController.suggestions = null;
      omniboxController.shouldShowLoadingElement = false;
      omniboxController.canShowSuggestions = () => false;
    });

    it('should not be determined just by if the suggestions are loading', () => {
      expect(omniboxController.shouldShowSuggestions()).toBe(false);

      omniboxController.shouldShowLoadingElement = true;
      expect(omniboxController.shouldShowSuggestions()).toBe(false);
    });

    it('should not be determined by just the presence of suggestions', () => {
      expect(omniboxController.shouldShowSuggestions()).toBe(false);

      omniboxController.suggestions = [];
      expect(omniboxController.shouldShowSuggestions()).toBe(false);
    });

    it('should not be controllable by just the canShowSuggestions binding function', () => {
      expect(omniboxController.shouldShowSuggestions()).toBe(false);

      omniboxController.canShowSuggestions = () => true;
      expect(omniboxController.shouldShowSuggestions()).toBe(false);
    });

    it('should be determined by loading state, having suggestions, and can-show binding', () => {
      omniboxController.shouldShowLoadingElement = true;
      omniboxController.suggestions = [];
      omniboxController.canShowSuggestions = () => true;
      expect(omniboxController.shouldShowSuggestions()).toBe(true);
    });

    it('should be visible when done loading if has suggestions and can-show passes', () => {
      omniboxController.shouldShowLoadingElement = false;
      omniboxController.suggestions = [];
      omniboxController.canShowSuggestions = () => true;
      expect(omniboxController.shouldShowSuggestions()).toBe(true);
    });
  });

  describe('changing the ngModel', () => {
    beforeEach(() => {
      spyOn(omniboxController, '_onNgModelChange');
    });

    it('should be detected when setting ngModel to a string', () => {
      omniboxController.ngModel = 'My model value';
      expect(omniboxController._onNgModelChange).toHaveBeenCalled();
    });

    it('should be detected when setting ngModel to an array', () => {
      omniboxController.ngModel = ['my', 'model'];
      expect(omniboxController._onNgModelChange).toHaveBeenCalled();
    });

    it('should be detected when replacing the ngModel array', () => {
      omniboxController.ngModel = ['my', 'new', 'model'];
      expect(omniboxController._onNgModelChange).toHaveBeenCalled();
    });

    it('should clear out the query when the ngModel is cleared', () => {
      omniboxController.query = 'my query';
      omniboxController.ngModel = '';

      expect(omniboxController.query).toBe('');
      expect(omniboxController.ngModel).toBe(null);
    });
  });

  describe('modifying the ngModel should be detected when', () => {
    beforeEach(() => {
      spyOn(omniboxController, '_onNgModelChange');
      omniboxController.ngModel = ['one', 'two', 'three'];
    });

    it('pushing to the ngModel array', () => {
      omniboxController.ngModel.push('four');
      expect(omniboxController.ngModel.toString()).toBe('one,two,three,four');
      expect(omniboxController._onNgModelChange).toHaveBeenCalled();
    });

    it('popping from the ngModel array', () => {
      omniboxController.ngModel.pop();
      expect(omniboxController.ngModel.toString()).toBe('one,two');
      expect(omniboxController._onNgModelChange).toHaveBeenCalled();
    });

    it('shifting the ngModel array', () => {
      omniboxController.ngModel.shift();
      expect(omniboxController.ngModel.toString()).toBe('two,three');
      expect(omniboxController._onNgModelChange).toHaveBeenCalled();
    });

    it('unshifting the ngModel array', () => {
      omniboxController.ngModel.unshift('zero');
      expect(omniboxController.ngModel.toString()).toBe('zero,one,two,three');
      expect(omniboxController._onNgModelChange).toHaveBeenCalled();
    });

    it('splicing the ngModel array', () => {
      omniboxController.ngModel.splice(1, 1);
      expect(omniboxController.ngModel.toString()).toBe('one,three');
      expect(omniboxController._onNgModelChange).toHaveBeenCalled();
    });
  });

  describe('choosing and unchoosing', () => {
    describe('when multiple is off', () => {
      beforeEach(() => {
        omniboxController.multiple = false;
        omniboxController.ngModel = 'one';
      });

      it('should set the ngModel to the choice when multiple is off', () => {
        omniboxController.choose('three');
        expect(omniboxController.ngModel).toEqual('three');
      });

      it('should set the ngModel to null when unchoosing if multiple is off', () => {
        omniboxController.unchoose('one');
        expect(omniboxController.ngModel).toEqual(null);
      });
    });

    describe('when multiple is on', () => {
      beforeEach(() => {
        omniboxController.multiple = true;
        omniboxController.ngModel = ['one', 'two'];
      });

      it('should push the choice to an array', () => {
        omniboxController.choose('three');
        expect(omniboxController.ngModel).toEqual(['one', 'two', 'three']);
      });

      it('should not update the ngModel when onChosen event prevents default', () => {
        omniboxController.onChosen = ({$event}) => $event.preventDefault();
        omniboxController.choose('three');

        expect(omniboxController.ngModel).toEqual(['one', 'two']);
      });

      it('should update the ngModel when onChosen event prevents then peforms default', (done) => {
        omniboxController.onChosen = ({$event}) => {
          $event.preventDefault();
          expect(omniboxController.ngModel).toEqual(['one', 'two']);

          $event.performDefault();
          expect(omniboxController.ngModel).toEqual(['one', 'two', 'three']);

          done();
        };

        omniboxController.choose('three');
      });

      it('should not update the ngModel when choosing if an item is not selectable', () => {
        omniboxController.isSelectable = () => false;
        omniboxController.choose('three');

        expect(omniboxController.ngModel).toEqual(['one', 'two']);
      });

      it('should remove a choice from the ngModel array when unchoosing', () => {
        omniboxController.unchoose('two');
        expect(omniboxController.ngModel).toEqual(['one']);
      });

      it('should not update the ngModel when onUnchosen event prevents default', () => {
        omniboxController.onUnchosen = ({$event}) => $event.preventDefault();
        omniboxController.unchoose('two');

        expect(omniboxController.ngModel).toEqual(['one', 'two']);
      });

      it('should update the ngModel when onUnchosen event prevents then peforms default', (done) => {
        omniboxController.onUnchosen = ({$event}) => {
          $event.preventDefault();
          expect(omniboxController.ngModel).toEqual(['one', 'two']);

          $event.performDefault();
          expect(omniboxController.ngModel).toEqual(['one']);

          done();
        };

        omniboxController.unchoose('two');
      });
    });
  });

  describe('choices visibility', () => {
    beforeEach(() => {
      omniboxController.multiple = true;
      omniboxController.ngModel = ['choice'];
    });

    it('should require an ngModel with at least one choice', () => {
      expect(omniboxController.hasChoices).toBe(true);

      omniboxController.ngModel = [];
      expect(omniboxController.hasChoices).toBe(false);
    });

    it('should require the component to be set to multiple', () => {
      expect(omniboxController.hasChoices).toBe(true);

      omniboxController.multiple = false;

      // Multiple will never get updated out of band like this, so just forcing the update here for
      // the test
      omniboxController._onNgModelChange();

      expect(omniboxController.hasChoices).toBe(false);
    });
  });

  describe('when navigating choices', () => {
    beforeEach(() => {
      omniboxController.multiple = true;
      omniboxController.ngModel = ['one', 'two', 'three'];
      omniboxController.fieldElement = Object.assign({}, fakeEl);
    });

    it('should not try to highlight a choice when multiple is false', () => {
      omniboxController.multiple = false;

      expect(omniboxController.highlightedChoice).toBe(null);

      omniboxController.highlightNextChoice();
      expect(omniboxController.highlightedChoice).toBe(null);

      omniboxController.highlightPreviousChoice();
      expect(omniboxController.highlightedChoice).toBe(null);
    });

    it('should highlight a specific choice', () => {
      expect(omniboxController.highlightedChoice).toBe(null);

      omniboxController.highlightChoice('two');
      expect(omniboxController.highlightedChoice).toBe('two');
    });

    it('should only highlight a choice that exists in the list of choices', () => {
      omniboxController.highlightChoice('two');
      expect(omniboxController.highlightedChoice).toBe('two');

      omniboxController.highlightChoice('bogus');
      expect(omniboxController.highlightedChoice).toBe('two');

      omniboxController.highlightChoice('three');
      expect(omniboxController.highlightedChoice).toBe('three');
    });

    it('should highlight the next choice', () => {
      omniboxController.highlightNextChoice();
      expect(omniboxController.highlightedChoice).toBe('one');

      omniboxController.highlightNextChoice();
      expect(omniboxController.highlightedChoice).toBe('two');

      omniboxController.highlightNextChoice();
      expect(omniboxController.highlightedChoice).toBe('three');

      omniboxController.highlightNextChoice();
      expect(omniboxController.highlightedChoice).toBe(null); // No wrapping around
    });

    it('should highlight the previous choice', () => {
      omniboxController.highlightPreviousChoice();
      expect(omniboxController.highlightedChoice).toBe(null); // No wrapping around

      omniboxController.highlightedChoice = 'three';

      omniboxController.highlightPreviousChoice();
      expect(omniboxController.highlightedChoice).toBe('two');

      omniboxController.highlightPreviousChoice();
      expect(omniboxController.highlightedChoice).toBe('one');

      omniboxController.highlightPreviousChoice();
      expect(omniboxController.highlightedChoice).toBe(null);
    });

    it('should highlight the first choice', () => {
      omniboxController.highlightFirstChoice();
      expect(omniboxController.highlightedChoice).toBe('one');

      omniboxController.highlightedChoice = 'two';
      omniboxController.highlightFirstChoice();
      expect(omniboxController.highlightedChoice).toBe('one');
    });

    it('should highlight the last choice', () => {
      omniboxController.highlightLastChoice();
      expect(omniboxController.highlightedChoice).toBe('three');

      omniboxController.highlightedChoice = 'two';
      omniboxController.highlightLastChoice();
      expect(omniboxController.highlightedChoice).toBe('three');
    });

    it('should check if a choice is highlighted', () => {
      omniboxController.highlightedChoice = 'one';

      expect(omniboxController.isChoiceHighlighted('one')).toBe(true);
      expect(omniboxController.isChoiceHighlighted('two')).toBe(false);
      expect(omniboxController.isChoiceHighlighted('three')).toBe(false);
      expect(omniboxController.isChoiceHighlighted(null)).toBe(false);
    });

    it('should focus the component when highlighting a choice', () => {
      omniboxController.doc.activeElement = omniboxController.element;
      spyOn(omniboxController.element, 'focus');

      omniboxController.highlightedChoice = 'one';
      expect(omniboxController.element.focus).toHaveBeenCalled();
    });

    it('should focus the field when highlighting no choice', () => {
      omniboxController.doc.activeElement = omniboxController.element;
      spyOn(omniboxController.fieldElement, 'focus');

      omniboxController.highlightedChoice = null;
      expect(omniboxController.fieldElement.focus).toHaveBeenCalled();
    });
  });
});
