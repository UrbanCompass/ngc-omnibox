import NgcOmniboxController from './ngcOmniboxController.js';

export default {
  controller: NgcOmniboxController,
  controllerAs: 'omnibox',
  bindings: {
    ngModel: '=',
    placeholder: '@',
    autofocus: '@',
    hideOnBlur: '@',
    ngDisabled: '&',
    isSelectable: '&',
    canShow: '&',
    multiple: '<',
    source: '&'
  }
};
