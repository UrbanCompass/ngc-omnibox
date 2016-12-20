export default class NgcOmniboxController {
  static get $inject() {
    return [];
  }

  constructor() {

  }

  onInputChange() {
    this.updateSuggestions();
  }

  updateSuggestions() {
    this.source({query: this.ngModel}).then((suggestions) => {
      this.suggestions = suggestions;
    });
  }

  hasSuggestions() {
    const suggestions = this.suggestions;

    if (!suggestions || (!Array.isArray(suggestions) && typeof suggestions !== 'object')) {
      return false;
    } else if (Array.isArray(suggestions) && !suggestions.length) {
      return false;
    } else if (typeof suggestions === 'object' && !Object.keys(suggestions).length) {
      return false;
    }

    return true;
  }
}
