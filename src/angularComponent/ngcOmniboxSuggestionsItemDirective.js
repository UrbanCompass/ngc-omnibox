import ngcOmniboxSuggestionsItemController from './ngcOmniboxSuggestionsItemController.js';

/**
 * Omnibox Suggestion Item Directive
 *
 * The Suggestion Item Directive is a sub-component of the Suggestions Direct that links a single
 * suggestion data item to its behavior in the suggestion UI list. A suggestion item can be either a
 * single suggestion without any children, or the header of a category that has children. It has
 * access to the suggestions and omnibox controllers, and has a single binding that links it to its
 * original data item.
 *
 * Because this directive has no template, all markup placed inside it will be maintained. The
 * markup has access to an `omnibox` object that is a refernece to the base Omnibox Controller,
 * as well to a `suggestion` object that is the data item for that suggestion. The type of data
 * this object has depends on the data passed in the source function.
 *
 * Sample usage:
 *     <ngc-omnibox source="myController.getSuggestions(query)" ng-model="myController.choices">
 *       <ngc-omnibox-suggestions>
 *         <ngc-omnibox-sugestion-item>
 *           {{suggestion.title}} - {{suggestion.summary}}
 *         <ngc-omnibox-suggestions-item>
 *       </ngc-omnibox-suggestions>
 *     </ngc-omnibox>
 *
 * Sample usage for optional category header suggestion item:
 *
 *     <ngc-omnibox source="myController.getSuggestions(query)" ng-model="myController.choices">
 *       <ngc-omnibox-suggestions>
 *         <ngc-omnibox-category>
 *           <ngc-omnibox-suggestions-header>
 *             {{suggestion.categoryTitle}}
 *           </ngc-omnibox-suggestions-header>
 *
 *           <ngc-omnibox-sugestion-item>
 *             {{suggestion.title}} - {{suggestion.summary}}
 *           <ngc-omnibox-suggestions-item>
 *         </ngc-omnibox-category>
 *       </ngc-omnibox-suggestions>
 *     </ngc-omnibox>
 *
 * @returns {Object}
 */
export default function ngcOmniboxSuggestionsItemDirective() {
  return {
    restrict: 'AE',
    require: {
      omnibox: '^^ngcOmnibox',
      suggestions: '^^ngcOmniboxSuggestions'
    },
    scope: true,
    bindToController: {
      suggestion: '<'
    },
    controller: ngcOmniboxSuggestionsItemController,
    controllerAs: 'suggestionItem',
    compile(tElement) {
      tElement.attr('role', 'option');

      return {
        pre(scope, iElement, iAttrs, {omnibox}) {
          scope.omnibox = omnibox;
        }
      };
    }
  };
}
