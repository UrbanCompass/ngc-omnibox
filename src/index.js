import angular from 'angular';

import ngcOmniboxComponent from './angularComponent/ngcOmniboxComponent.js';
import ngcModifySuggestionsTemplateFactory from './angularComponent/ngcModifySuggestionsTemplateFactory.js';
import ngcOmniboxSuggestionsDirective from './angularComponent/ngcOmniboxSuggestionsDirective.js';
import ngcOmniboxSuggestionItemDirective from './angularComponent/ngcOmniboxSuggestionItemDirective.js';

export default angular.module('ngc.omnibox', [])
  .component('ngcOmnibox', ngcOmniboxComponent)
  .factory('ngcModifySuggestionsTemplate', ngcModifySuggestionsTemplateFactory)
  .directive('ngcOmniboxSuggestions', ngcOmniboxSuggestionsDirective)
  .directive('ngcOmniboxSuggestionHeader', ngcOmniboxSuggestionItemDirective)
  .directive('ngcOmniboxSuggestionItem', ngcOmniboxSuggestionItemDirective)
  .name;
