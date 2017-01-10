import NgcOmniboxController from '~/angularComponent/ngcOmniboxController.js';

describe('ngcOmnibox.angularComponent.ngcOmniboxController', () => {
  let omniboxController;

  beforeEach(() => {
    const fakeEl = {removeAttribute: () => {}, setAttribute: () => {}};

    omniboxController = new NgcOmniboxController();
    omniboxController._suggestionElements = [fakeEl, fakeEl, fakeEl, fakeEl];
    omniboxController.isSelectable = () => {};
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

    it('should return false for suggestions that aren\'t an Array', () => {
      omniboxController.suggestions = 'false';
      expect(omniboxController.hasSuggestions).toBe(false);

      omniboxController.suggestions = true;
      expect(omniboxController.hasSuggestions).toBe(false);

      omniboxController.suggestions = 100;
      expect(omniboxController.hasSuggestions).toBe(false);

      omniboxController.suggestions = {test: 'me'};
      expect(omniboxController.hasSuggestions).toBe(false);
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

      omniboxController.highlightNext();
      expect(omniboxController.highlightedIndex).toBe(0);

      omniboxController.highlightNext();
      expect(omniboxController.highlightedIndex).toBe(1);
    });

    it('should highlight the previous suggestion', () => {
      omniboxController.suggestions = ['test', 'me', 'too'];

      omniboxController.highlightedIndex = 1;

      omniboxController.highlightPrevious();
      expect(omniboxController.highlightedIndex).toBe(0);
    });

    it('should wrap around the selection', () => {
      omniboxController.suggestions = ['test', 'me', 'again', 'please'];
      omniboxController.highlightedIndex = 0;

      omniboxController.highlightPrevious();
      expect(omniboxController.highlightedIndex).toBe(3);

      omniboxController.highlightNext();
      expect(omniboxController.highlightedIndex).toBe(0);
    });
  });

  describe('suggestion visibility', () => {
    beforeEach(() => {
      omniboxController.isLoading = false;
      omniboxController.query = '';
      omniboxController.canShow = () => false;
    });

    it('should not be determined just by if the suggestions are loading', () => {
      expect(omniboxController.shouldShowSuggestions()).toBe(false);

      omniboxController.isLoading = true;
      expect(omniboxController.shouldShowSuggestions()).toBe(false);
    });

    it('should not be determined by just the presence of a query', () => {
      expect(omniboxController.shouldShowSuggestions()).toBe(false);

      omniboxController.query = 'my query';
      expect(omniboxController.shouldShowSuggestions()).toBe(false);
    });

    it('should not be controllable by just the canShow binding function', () => {
      expect(omniboxController.shouldShowSuggestions()).toBe(false);

      omniboxController.canShow = () => true;
      expect(omniboxController.shouldShowSuggestions()).toBe(false);
    });

    it('should be determined by loading state, query, and canShow binding', () => {
      omniboxController.isLoading = true;
      omniboxController.query = 'my query';
      omniboxController.canShow = () => true;
      expect(omniboxController.shouldShowSuggestions()).toBe(true);
    });

    it('should be visible when done loading if query and canShow pass', () => {
      omniboxController.isLoading = false;
      omniboxController.query = 'a real query';
      omniboxController.canShow = () => true;
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
      expect(omniboxController.shouldShowChoices).toBe(true);

      omniboxController.ngModel = [];
      expect(omniboxController.shouldShowChoices).toBe(false);
    });

    it('should require the component to be set to multiple', () => {
      expect(omniboxController.shouldShowChoices).toBe(true);

      omniboxController.multiple = false;

      // Multiple will never get updated out of band like this, so just forcing the update here for
      // the test
      omniboxController._onNgModelChange();

      expect(omniboxController.shouldShowChoices).toBe(false);
    });
  });
});
