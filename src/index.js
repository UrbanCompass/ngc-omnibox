import angular from 'angular';

import ngcOmniboxComponent from './angularComponent/ngcOmniboxComponent.js';
import ngcOmniboxSuggestionsDirective from './angularComponent/ngcOmniboxSuggestionsDirective.js';
import ngcOmniboxSuggestionItemDirective from './angularComponent/ngcOmniboxSuggestionItemDirective.js';

export default angular.module('ngc.omnibox', [])
  .component('ngcOmnibox', ngcOmniboxComponent)
  .directive('ngcOmniboxSuggestions', ngcOmniboxSuggestionsDirective)
  .directive('ngcOmniboxSuggestionItem', ngcOmniboxSuggestionItemDirective)
  .name;
