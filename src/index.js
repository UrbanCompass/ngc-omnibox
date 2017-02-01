import angular from 'angular';

import ngcOmniboxComponent from './angularComponent/ngcOmniboxComponent.js';
import ngcOmniboxHighlightMatchFilter from './angularComponent/ngcOmniboxHighlightMatchFilter.js';
import ngcModifySuggestionsTemplateFactory from './angularComponent/ngcModifySuggestionsTemplateFactory.js';
import ngcOmniboxFieldDirective from './angularComponent/ngcOmniboxFieldDirective.js';
import ngcOmniboxSuggestionsDirective from './angularComponent/ngcOmniboxSuggestionsDirective.js';
import ngcOmniboxSuggestionsItemDirective from './angularComponent/ngcOmniboxSuggestionsItemDirective.js';
import ngcOmniboxChoicesDirective from './angularComponent/ngcOmniboxChoicesDirective.js';

export default angular.module('ngc.omnibox', [])
  .component('ngcOmnibox', ngcOmniboxComponent)
  .factory('ngcModifySuggestionsTemplate', ngcModifySuggestionsTemplateFactory)
  .filter('ngcOmniboxHighlightMatch', ngcOmniboxHighlightMatchFilter)
  .directive('ngcOmniboxField', ngcOmniboxFieldDirective)
  .directive('ngcOmniboxSuggestions', ngcOmniboxSuggestionsDirective)
  .directive('ngcOmniboxSuggestionsHeader', ngcOmniboxSuggestionsItemDirective)
  .directive('ngcOmniboxSuggestionsItem', ngcOmniboxSuggestionsItemDirective)
  .directive('ngcOmniboxChoices', ngcOmniboxChoicesDirective)
  .name;
