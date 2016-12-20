import angular from 'angular';

import ngcOmniboxComponent from './angularComponent/ngcOmniboxComponent.js';
import ngcOmniboxSuggestionsDirective from './angularComponent/ngcOmniboxSuggestionsDirective.js';
import ngcOmniboxSuggestionItemComponent from './angularComponent/ngcOmniboxSuggestionItemComponent.js';

export default angular.module('ngc.omnibox', [])
  .component('ngcOmnibox', ngcOmniboxComponent)
  .directive('ngcOmniboxSuggestions', ngcOmniboxSuggestionsDirective)
  .component('ngcOmniboxSuggestionItem', ngcOmniboxSuggestionItemComponent)
  .name;
