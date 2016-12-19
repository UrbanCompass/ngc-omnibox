import angular from 'angular';

import ngcOmniboxComponent from './angularComponent/ngcOmniboxComponent.js';

export default angular.module('ngc.omnibox', [])
  .component('ngcOmnibox', ngcOmniboxComponent)
  .name;
