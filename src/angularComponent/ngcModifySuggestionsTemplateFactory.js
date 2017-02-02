/**
 * Takes in the public API template submitted by the app-maker and modifies it to repeat through
 * the data structure of the Omnibox. The template will be different depending on whether it finds
 * an ngc-omnibox-suggestions-category or not.
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

    const categoryEl = getSubcomponent(element, 'ngc-omnibox-suggestions-category');
    const itemEl = getSubcomponent(element, 'ngc-omnibox-suggestions-item');
    const loadingEl = getSubcomponent(element, 'ngc-omnibox-suggestions-loading');
    const noResultsEl = getSubcomponent(element, 'ngc-omnibox-suggestions-empty');

    element.setAttribute('role', 'listbox');

    if (loadingEl) {
      loadingEl.setAttribute('role', 'progressbar');
      loadingEl.setAttribute('ng-if', 'omnibox.shouldShowLoadingElement');
    }

    if (noResultsEl) {
      noResultsEl.setAttribute('ng-if', '!omnibox.hasSuggestions && !omnibox.isLoading');
    }

    if (!itemEl) {
      throw new Error('An ngcOmniboxSuggestionsItem is required.');
    } else if (categoryEl) {
      const categoryContainer = doc.createElement('div');
      categoryContainer.setAttribute('ng-repeat',
          'suggestion in suggestion.children || omnibox.suggestions');
      categoryEl.parentNode.insertBefore(categoryContainer, categoryEl);

      categoryEl.setAttribute('ng-if', 'suggestion.children');

      const itemChildrenEl = doc.createElement('div');
      itemChildrenEl.setAttribute('ng-repeat', 'suggestion in suggestion.children');
      itemChildrenEl.setAttribute('ng-include', `'${templateCacheName}'`);

      itemEl.parentNode.appendChild(itemChildrenEl);

      const itemHeader = getSubcomponent(element, 'ngc-omnibox-suggestions-header');
      if (itemHeader) {
        itemHeader.setAttribute('suggestion', 'suggestion');
        itemHeader.setAttribute('ng-attr-aria-selected',
            '{{suggestionItem.isHighlighted() || undefined}}');
        itemHeader.setAttribute('ng-attr-aria-readonly',
            '{{suggestionItem.isSelectable() === false || undefined}}');
        itemHeader.setAttribute('ng-mouseenter', 'suggestionItem.handleMouseEnter()');
        itemHeader.setAttribute('ng-mouseleave', 'suggestionItem.handleMouseLeave()');
        itemHeader.setAttribute('ng-click', 'suggestionItem.handleClick()');
      }

      categoryContainer.appendChild(categoryEl);
      categoryContainer.appendChild(itemEl);
      itemEl.setAttribute('ng-if', '!suggestion.children');
      itemEl.setAttribute('suggestion', 'suggestion');
      itemEl.setAttribute('ng-attr-aria-selected',
          '{{suggestionItem.isHighlighted() || undefined}}');
      itemEl.setAttribute('ng-attr-aria-readonly',
          '{{suggestionItem.isSelectable() === false || undefined}}');
      itemEl.setAttribute('ng-mouseenter', 'suggestionItem.handleMouseEnter()');
      itemEl.setAttribute('ng-mouseleave', 'suggestionItem.handleMouseLeave()');
      itemEl.setAttribute('ng-click', 'suggestionItem.handleClick()');

      $templateCache.put(templateCacheName, categoryContainer.innerHTML);

      return element.innerHTML;
    } else {
      itemEl.setAttribute('ng-repeat', 'suggestion in omnibox.suggestions');
      itemEl.setAttribute('suggestion', 'suggestion');
      itemEl.setAttribute('ng-attr-aria-selected',
          '{{suggestionItem.isHighlighted() || undefined}}');
      itemEl.setAttribute('ng-attr-aria-readonly',
          '{{suggestionItem.isSelectable() === false || undefined}}');
      itemEl.setAttribute('ng-mouseenter', 'suggestionItem.handleMouseEnter()');
      itemEl.setAttribute('ng-mouseleave', 'suggestionItem.handleMouseLeave()');
      itemEl.setAttribute('ng-click', 'suggestionItem.handleClick()');

      return element.innerHTML;
    }
  };
}

/**
 * Queries a container for an element reference of a subcomponent, either via a custom element or
 * via an attribute.
 *
 * @private
 * @param {HTMLElement} container
 * @param {String} directive
 * @returns {HTMLElement}
 */
function getSubcomponent(container, directive) {
  const element = container.querySelectorAll(`${directive}, [${directive}]`);

  if (element.length > 1) {
    throw new Error('Cannot include more than one instance of \'' + directive + '\'');
  } else if (!element.length) {
    return null;
  }

  return element[0];
}
