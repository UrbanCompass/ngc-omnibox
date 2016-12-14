import NgcOmniboxController from './ngcOmniboxController.js';

export default {
  bindings: {
    ngModel: '<',
    ngDisabled: '&',
    multiple: '<',
    placeholder: '<',
    accessoryText: '<',
    autofocus: '<',
    onShowSuggestions: '&',
    onHideSuggestions: '&'
  },
  controller: NgcOmniboxController,
  controllerAs: 'omnibox'
};
