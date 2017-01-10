import angular from 'angular';

import ngcOmniboxComponent from './angularComponent/ngcOmniboxComponent.js';
import ngcOmniboxFieldDirective from './angularComponent/ngcOmniboxFieldDirective.js';
import ngcModifySuggestionsTemplateFactory from './angularComponent/ngcModifySuggestionsTemplateFactory.js';
import ngcOmniboxSuggestionsDirective from './angularComponent/ngcOmniboxSuggestionsDirective.js';
import ngcOmniboxSuggestionItemDirective from './angularComponent/ngcOmniboxSuggestionItemDirective.js';
import ngcOmniboxChoicesDirective from './angularComponent/ngcOmniboxChoicesDirective.js';

export default angular.module('ngc.omnibox', [])
  .component('ngcOmnibox', ngcOmniboxComponent)
  .directive('ngcOmniboxField', ngcOmniboxFieldDirective)
  .factory('ngcModifySuggestionsTemplate', ngcModifySuggestionsTemplateFactory)
  .directive('ngcOmniboxSuggestions', ngcOmniboxSuggestionsDirective)
  .directive('ngcOmniboxSuggestionHeader', ngcOmniboxSuggestionItemDirective)
  .directive('ngcOmniboxSuggestionItem', ngcOmniboxSuggestionItemDirective)
  .directive('ngcOmniboxChoices', ngcOmniboxChoicesDirective)
  .name;
