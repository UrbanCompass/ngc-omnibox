import angular from 'angular';
import NgcOmniboxSuggestionsController from './ngcOmniboxSuggestionsController.js';

ngcOmniboxSuggestionsDirective.$inject = ['$templateCache'];
export default function ngcOmniboxSuggestionsDirective($templateCache) {
  return {
    restrict: 'E',
    require: '^^ngcOmnibox',
    scope: true,
    controller: NgcOmniboxSuggestionsController,
    controllerAs: 'suggestions',
    compile(tElement) {
      const el = tElement[0];
      el.setAttribute('role', 'listbox');

      const categoryEl = el.querySelector(
        'ngc-omnibox-suggestion-category, [ngc-omnibox-suggestion-category]'
      );
      const itemEl = el.querySelector(
        'ngc-omnibox-suggestion-item, [ngc-omnibox-suggestion-item]'
      );

      if (categoryEl) {
        const categoryContainer = angular.element('<div></div>')[0];
        categoryContainer.setAttribute('ng-repeat',
            'suggestion in suggestion.children || omnibox.suggestions');
        categoryEl.setAttribute('ng-if', 'suggestion.children');

        const itemChildrenEl = angular.element('<div></div>')[0];
        itemChildrenEl.setAttribute('ngc-omnibox-suggestion-item', '');
        itemChildrenEl.setAttribute('ng-repeat', 'suggestion in suggestion.children');
        itemChildrenEl.setAttribute('ng-include', '\'category-tmpl\'');
        if (itemEl.hasAttributes()) {
          for (let i = 0; i < itemEl.attributes.length; i++) {
            const attr = itemEl.attributes[i];
            itemChildrenEl.setAttribute(attr.name, attr.value);
          }
        }
        itemEl.parentNode.appendChild(itemChildrenEl);

        categoryContainer.appendChild(categoryEl);
        categoryContainer.appendChild(itemEl);
        itemEl.setAttribute('ng-if', '!suggestion.children');

        $templateCache.put('category-tmpl', categoryContainer.innerHTML);
        tElement.html(categoryContainer.outerHTML);
      } else if (itemEl) {
        itemEl.setAttribute('ng-repeat', 'suggestion in omnibox.suggestions');
        tElement.html(itemEl.outerHTML);
      }

      return {
        pre(scope, iElement, iAttrs, omnibox) {
          scope.omnibox = omnibox;
        }
      };
    }
  };
}
