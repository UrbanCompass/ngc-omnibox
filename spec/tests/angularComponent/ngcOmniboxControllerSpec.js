import NgcOmniboxController from '~/angularComponent/ngcOmniboxController.js';

describe('ngcOmnibox.angularComponent.ngcOmniboxController', () => {
  let omniboxController;

  beforeEach(() => {
    omniboxController = new NgcOmniboxController();
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
});
