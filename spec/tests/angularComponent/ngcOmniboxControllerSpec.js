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
      expect(omniboxController.hasSuggestions()).toBe(false);

      omniboxController.suggestions = null;
      expect(omniboxController.hasSuggestions()).toBe(false);

      omniboxController.suggestions = '';
      expect(omniboxController.hasSuggestions()).toBe(false);
    });

    it('should return false for suggestions that aren\'t an Array', () => {
      omniboxController.suggestions = 'false';
      expect(omniboxController.hasSuggestions()).toBe(false);

      omniboxController.suggestions = true;
      expect(omniboxController.hasSuggestions()).toBe(false);

      omniboxController.suggestions = 100;
      expect(omniboxController.hasSuggestions()).toBe(false);

      omniboxController.suggestions = {test: 'me'};
      expect(omniboxController.hasSuggestions()).toBe(false);
    });

    it('should return false for empty Arrays', () => {
      omniboxController.suggestions = [];
      expect(omniboxController.hasSuggestions()).toBe(false);
    });

    it('should return true for non-empty Arrays', () => {
      omniboxController.suggestions = ['test', 'me'];
      expect(omniboxController.hasSuggestions()).toBe(true);
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
});
