import template from './ngcOmnibox.html';

import NgcOmniboxController from './ngcOmniboxController.js';

export default {
  template,
  controller: NgcOmniboxController,
  controllerAs: 'omnibox',
  transclude: {
    omniboxSuggestions: 'ngcOmniboxSuggestions',
    omniboxSelections: '?ngcOmniboxSelections'
  },
  bindings: {
    ngModel: '=',
    placeholder: '@',
    autofocus: '@',
    ngDisabled: '&',
    isSelectable: '&',
    multiple: '<',
    source: '&'
  }
};
