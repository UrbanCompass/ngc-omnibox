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
}
