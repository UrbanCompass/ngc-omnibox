import NgcOmniboxController from './ngcOmniboxController.js';

export default {
  controller: NgcOmniboxController,
  controllerAs: 'omnibox',
  bindings: {
    source: '&',
    ngModel: '=',
    ngDisabled: '&',
    multiple: '<?',
    hideOnBlur: '@',
    isSelectable: '&',
    canShow: '&'
  }
};
