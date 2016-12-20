import template from './ngcOmnibox.html';

import NgcOmniboxController from './ngcOmniboxController.js';

export default {
  template,
  controller: NgcOmniboxController,
  controllerAs: 'omnibox',
  transclude: true,
  bindings: {
    ngModel: '=',
    placeholder: '@',
    autofocus: '@',
    ngDisabled: '&'
  }
};
