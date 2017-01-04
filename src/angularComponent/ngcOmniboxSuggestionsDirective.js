import NgcOmniboxSuggestionsController from './ngcOmniboxSuggestionsController.js';

ngcOmniboxSuggestionsDirective.$inject = ['$document', '$templateCache'];
export default function ngcOmniboxSuggestionsDirective($document, $templateCache) {

  return {
    restrict: 'E',
    require: '^^ngcOmnibox',
    scope: true,
    controller: NgcOmniboxSuggestionsController,
    controllerAs: 'suggestions',
    compile(tElement) {
      tElement.html(getModifiedTemplate(tElement[0], $document, $templateCache));

      return {
        pre(scope, iElement, iAttrs, omnibox) {
          scope.omnibox = omnibox;
        }
      };
    }
  };
}

/**
 * Takes in the public API template submitted by the app-maker and modifies it to repeat through
 * the data structure of the Omnibox. The template will be different depending on whether it finds
 * an ngc-omnibox-suggestion-category or not.
 *
 * @private
 * @param {HTMLElement} element -- HTMLElement that contains the template to modify
 * @param {jQLiteElement} $document
 * @param {Object} $templateCache
 * @param {String} templateCacheName -- Unique string to use as the template cache name for
 *     recursively rendering the template
 * @returns {String} Modified template string
 */
export function getModifiedTemplate(element, $document, $templateCache,
    templateCacheName = `category-tmpl-${new Date().getTime() * Math.random()}`) {
  const doc = $document[0];

  const categoryEl = element.querySelector(
    'ngc-omnibox-suggestion-category, [ngc-omnibox-suggestion-category]'
  );
  const itemEl = element.querySelector(
    'ngc-omnibox-suggestion-item, [ngc-omnibox-suggestion-item]'
  );

  element.setAttribute('role', 'listbox');

  if (categoryEl) {
    const categoryContainer = doc.createElement('div');
    categoryContainer.setAttribute('ng-repeat',
        'suggestion in suggestion.children || omnibox.suggestions');
    categoryEl.setAttribute('ng-if', 'suggestion.children');

    const itemChildrenEl = doc.createElement('div');
    itemChildrenEl.setAttribute('ng-repeat', 'suggestion in suggestion.children');
    itemChildrenEl.setAttribute('ng-include', `'${templateCacheName}'`);
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
    itemEl.setAttribute('suggestion', 'suggestion');

    $templateCache.put(templateCacheName, categoryContainer.innerHTML);
    return categoryContainer.outerHTML;
  } else if (itemEl) {
    itemEl.setAttribute('ng-repeat', 'suggestion in omnibox.suggestions');
    itemEl.setAttribute('suggestion', 'suggestion');
    return itemEl.outerHTML;
  } else {
    throw new Error('ngcOmniboxSuggestions requires an ngcOmniboxSuggestionItem');
  }
}
