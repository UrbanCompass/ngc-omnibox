export default class NgcOmniboxSuggestionsTemplateService {
  static get $inject() {
    return ['$document', '$templateCache'];
  }

  constructor($document, $templateCache) {
    this.$document = $document;
    this.$templateCache = $templateCache;
  }

  /**
   * Takes in the public API template submitted by the app-maker and modifies it to repeat through
   * the data structure of the Omnibox. The template will be different depending on whether it finds
   * an ngc-omnibox-suggestion-category or not.
   *
   * @private
   * @param {HTMLElement} element -- HTMLElement that contains the template to modify
   * @param {String} templateCacheName -- Unique string to use as the template cache name for
   *     recursively rendering the template
   * @returns {String} Modified template string
   */
  getModifiedTemplate(element,
      templateCacheName = `category-tmpl-${new Date().getTime() * Math.random()}`) {
    const doc = this.$document[0];

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

      this.$templateCache.put(templateCacheName, categoryContainer.innerHTML);
      return categoryContainer.outerHTML;
    } else if (itemEl) {
      itemEl.setAttribute('ng-repeat', 'suggestion in omnibox.suggestions');
      itemEl.setAttribute('suggestion', 'suggestion');
      return itemEl.outerHTML;
    } else {
      throw new Error('An ngcOmniboxSuggestionItem is required.');
    }
  }

}
