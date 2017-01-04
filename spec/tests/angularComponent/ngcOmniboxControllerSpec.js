import NgcOmniboxController from '~/angularComponent/ngcOmniboxController.js';

describe('ngcOmnibox.angularComponent.ngcOmniboxController', () => {
  let omniboxController;

  beforeEach(() => {
    const fakeEl = {removeAttribute: () => {}, setAttribute: () => {}};

    omniboxController = new NgcOmniboxController();
    omniboxController._suggestionElements = [fakeEl, fakeEl, fakeEl, fakeEl];
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

    it('should return false for suggestions that aren\'t Arrays or Objects', () => {
      omniboxController.suggestions = 'false';
      expect(omniboxController.hasSuggestions()).toBe(false);

      omniboxController.suggestions = true;
      expect(omniboxController.hasSuggestions()).toBe(false);

      omniboxController.suggestions = 100;
      expect(omniboxController.hasSuggestions()).toBe(false);
    });

    it('should return false for empty Arrays and Objects', () => {
      omniboxController.suggestions = [];
      expect(omniboxController.hasSuggestions()).toBe(false);

      omniboxController.suggestions = {};
      expect(omniboxController.hasSuggestions()).toBe(false);
    });

    it('should return true for non-empty Arrays and Objects', () => {
      omniboxController.suggestions = ['test', 'me'];
      expect(omniboxController.hasSuggestions()).toBe(true);

      omniboxController.suggestions = {test: 'me'};
      expect(omniboxController.hasSuggestions()).toBe(true);
    });
  });

  describe('when navigating via the keyboard', () => {
    it('should highlight the next suggestion', () => {
      ['test', 'me'].forEach((item) => omniboxController.registerItem(item));

      expect(omniboxController.highlightedIndex).toBe(-1);

      omniboxController.highlightNext();
      expect(omniboxController.highlightedIndex).toBe(0);

      omniboxController.highlightNext();
      expect(omniboxController.highlightedIndex).toBe(1);
    });

    it('should highlight the previous suggestion', () => {
      ['test', 'me', 'too'].forEach((item) => omniboxController.registerItem(item));

      omniboxController.highlightedIndex = 1;

      omniboxController.highlightPrevious();
      expect(omniboxController.highlightedIndex).toBe(0);
    });

    it('should wrap around the selection', () => {
      ['test', 'me', 'again', 'please'].forEach((item) => omniboxController.registerItem(item));
      omniboxController.highlightedIndex = 0;

      omniboxController.highlightPrevious();
      expect(omniboxController.highlightedIndex).toBe(3);

      omniboxController.highlightNext();
      expect(omniboxController.highlightedIndex).toBe(0);
    });
  });
});
