import NgcOmniboxSuggestionsController from './ngcOmniboxSuggestionsController.js';

ngcOmniboxSuggestionsDirective.$inject = ['$document', '$templateCache'];
export default function ngcOmniboxSuggestionsDirective($document, $templateCache) {

  /**
   * Takes in the public API template submitted by the app-maker and modifies it to repeat through
   * the data structure of the Omnibox. The template will be different depending on whether it finds
   * an ngc-omnibox-suggestion-category or not.
   *
   * Markup with an ngc-omnibox-suggestion-category:
   *   <div ng-repeat="suggestion in suggestion.children || omnibox.suggestions">
   *     <dl ngc-omnibox-suggestion-category ng-if="suggestion.children">
   *       <dt>
   *         <h5>{{suggestion.sample_category_title}}</h5>
   *       </dt>
   *       <dd>
   *         <div ngc-omnibox-suggestion-item ng-repeat="suggestion in suggestion.children"
   *             ng-include="'category-tmpl-907877373586.4867'">
   *         </div>
   *       </dd>
   *     </dl>
   *     <ngc-omnibox-suggestion-item class="collection-item" ng-if="!suggestion.children">
   *       {{suggestion.sample_item_text}}
   *     </ngc-omnibox-suggestion-item>
   *   </div>
   *
   * Markup with just an ngc-omnibox-suggestion-item:
   *   <ngc-omnibox-suggestion-item  ng-repeat="suggestion in omnibox.suggestions">
   *     {{suggestion.sample_item_text}}
   *   </ngc-omnibox-suggestion-item>
   *
   * @private
   * @param {HTMLElement} element - HTMLElement that contains the template to modify
   * @returns {String} Modified template string
   */
  function getModifiedTemplate(element) {
    const doc = $document[0];
    const templateCacheName = `category-tmpl-${new Date().getTime() * Math.random()}`;

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

  return {
    restrict: 'E',
    require: '^^ngcOmnibox',
    scope: true,
    controller: NgcOmniboxSuggestionsController,
    controllerAs: 'suggestions',
    compile(tElement) {
      tElement.html(getModifiedTemplate(tElement[0]));

      return {
        pre(scope, iElement, iAttrs, omnibox) {
          scope.omnibox = omnibox;
        }
      };
    }
  };
}
