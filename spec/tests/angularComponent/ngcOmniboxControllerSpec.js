import NgcOmniboxController from '~/angularComponent/ngcOmniboxController.js';

describe('ngcOmnibox.angularComponent.ngcOmniboxController', () => {
  let omniboxController, document;

  beforeEach(() => {
    const fakeEl = {
      addEventListener() {},
      removeEventListener() {},
      removeAttribute() {},
      setAttribute() {},
      querySelector() {},
      querySelectorAll() {}
    };

    document = Object.assign({}, fakeEl);
    document.styleSheets = [{insertRule: jasmine.createSpy(() => {})}];

    omniboxController = new NgcOmniboxController([document], [fakeEl], {$apply() {}});
    omniboxController._suggestionElements = [fakeEl, fakeEl, fakeEl, fakeEl];
    omniboxController.isSelectable = () => {};
  });

  it('should inject $document, $element, and $scope', () => {
    expect(NgcOmniboxController.$inject.join(',')).toBe('$document,$element,$scope');
  });

  it('should remove the focus ring when the component is focused', () => {
    expect(document.styleSheets[0].insertRule)
        .toHaveBeenCalledWith('ngc-omnibox:focus {outline: none}', 0);
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

  describe('when navigating via the keyboard', () => {
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
});
