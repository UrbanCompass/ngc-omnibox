/**
 * Takes in the public API template submitted by the app-maker and modifies it to repeat through
 * the data structure of the Omnibox. The template will be different depending on whether it finds
 * an ngc-omnibox-suggestion-category or not.
 *
 * @param {HTMLElement} element -- HTMLElement that contains the template to modify
 * @param {String} templateCacheName -- Unique string to use as the template cache name for
 *     recursively rendering the template
 * @returns {String} Modified template string
 */
ngcModifySuggestionsTemplateFactory.$inject = ['$document', '$templateCache'];
export default function ngcModifySuggestionsTemplateFactory($document, $templateCache) {
  return function ngcModifySuggestionsTemplate(element,
      templateCacheName = `category-tmpl-${new Date().getTime() * Math.random()}`) {
    const doc = $document[0];

    const categoryEl = element.querySelector(
      'ngc-omnibox-suggestion-category, [ngc-omnibox-suggestion-category]'
    );
    const itemEl = element.querySelector(
      'ngc-omnibox-suggestion-item, [ngc-omnibox-suggestion-item]'
    );
    const loadingEl = element.querySelector(
      'ngc-omnibox-suggestion-loading, [ngc-omnibox-suggestion-loading]'
    );
    const noResultsEl = element.querySelector(
      'ngc-omnibox-suggestion-empty, [ngc-omnibox-suggestion-empty]'
    );

    element.setAttribute('role', 'listbox');

    if (loadingEl) {
      loadingEl.setAttribute('role', 'progressbar');
      loadingEl.setAttribute('ng-if', 'omnibox.showLoadingElement');
    }

    if (noResultsEl) {
      noResultsEl.setAttribute('ng-if', '!omnibox.hasSuggestions && !omnibox.isLoading');
    }

    if (categoryEl) {
      const categoryContainer = doc.createElement('div');
      categoryContainer.setAttribute('ng-repeat',
          'suggestion in suggestion.children || omnibox.suggestions');
      categoryEl.parentNode.insertBefore(categoryContainer, categoryEl);

      categoryEl.setAttribute('ng-if', 'suggestion.children');

      const itemChildrenEl = doc.createElement('div');
      itemChildrenEl.setAttribute('ng-repeat', 'suggestion in suggestion.children');
      itemChildrenEl.setAttribute('ng-include', `'${templateCacheName}'`);

      itemEl.parentNode.appendChild(itemChildrenEl);

      const itemHeader = element.querySelector(
        'ngc-omnibox-suggestion-header, [ngc-omnibox-suggestion-header]'
      );
      if (itemHeader) {
        itemHeader.setAttribute('suggestion', 'suggestion');
        itemHeader.setAttribute('ng-attr-aria-selected', '{{suggestionItem.isHighlighted()}}');
        itemHeader.setAttribute('ng-attr-aria-readonly',
            '{{suggestionItem.isSelectable() === false || undefined}}');
        itemHeader.setAttribute('ng-mouseenter', 'omnibox.highlightItem(suggestion)');
        itemHeader.setAttribute('ng-mouseleave', 'omnibox.highlightNone()');
        itemHeader.setAttribute('ng-click', 'omnibox.choose(suggestion)');
      }

      categoryContainer.appendChild(categoryEl);
      categoryContainer.appendChild(itemEl);
      itemEl.setAttribute('ng-if', '!suggestion.children');
      itemEl.setAttribute('suggestion', 'suggestion');
      itemEl.setAttribute('ng-attr-aria-selected', '{{suggestionItem.isHighlighted()}}');
      itemEl.setAttribute('ng-attr-aria-readonly',
          '{{suggestionItem.isSelectable() === false || undefined}}');
      itemEl.setAttribute('ng-mouseenter', 'omnibox.highlightItem(suggestion)');
      itemEl.setAttribute('ng-mouseleave', 'omnibox.highlightNone()');
      itemEl.setAttribute('ng-click', 'omnibox.choose(suggestion)');

      $templateCache.put(templateCacheName, categoryContainer.innerHTML);

      return element.innerHTML;
    } else if (itemEl) {
      itemEl.setAttribute('ng-repeat', 'suggestion in omnibox.suggestions');
      itemEl.setAttribute('suggestion', 'suggestion');
      itemEl.setAttribute('ng-attr-aria-selected', '{{suggestionItem.isHighlighted()}}');
      itemEl.setAttribute('ng-attr-aria-readonly',
          '{{suggestionItem.isSelectable() === false || undefined}}');
      itemEl.setAttribute('ng-mouseenter', 'omnibox.highlightItem(suggestion)');
      itemEl.setAttribute('ng-mouseleave', 'omnibox.highlightNone()');
      itemEl.setAttribute('ng-click', 'omnibox.choose(suggestion)');

      return element.innerHTML;
    } else {
      throw new Error('An ngcOmniboxSuggestionItem is required.');
    }
  };
}
