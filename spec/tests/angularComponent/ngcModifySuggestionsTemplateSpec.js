import jsdom from 'jsdom';

import ngcModifySuggestionsTemplateFactory from '~/angularComponent/ngcModifySuggestionsTemplateFactory.js';

/* eslint-disable indent */

const unCategorizedTemplate = [
  '<ngc-omnibox-suggestion-item>',
    '{{suggestion.sample_item_text}}',
  '</ngc-omnibox-suggestion-item>'
].join('');

const unCategorizedTemplateOutput = [
  '<ngc-omnibox-suggestion-item ng-repeat="suggestion in omnibox.suggestions" ',
      'suggestion="suggestion">',
    '{{suggestion.sample_item_text}}',
  '</ngc-omnibox-suggestion-item>'
].join('');

const categorizedTemplate = [
  '<div ngc-omnibox-suggestion-category>',
    '<h5>{{suggestion.sample_category_title}}</h5>',
    '<ngc-omnibox-suggestion-item>',
      '{{suggestion.sample_item_text}}',
    '</ngc-omnibox-suggestion-item>',
  '</div>'
].join('');

const categorizedTemplateOutput = [
  '<div ng-repeat="suggestion in suggestion.children || omnibox.suggestions">',
    '<div ngc-omnibox-suggestion-category="" ng-if="suggestion.children">',
      '<h5>{{suggestion.sample_category_title}}</h5>',
      '<div ng-repeat="suggestion in suggestion.children" ng-include="\'category-tmpl\'"></div>',
    '</div>',
    '<ngc-omnibox-suggestion-item ng-if="!suggestion.children" suggestion="suggestion">',
      '{{suggestion.sample_item_text}}',
    '</ngc-omnibox-suggestion-item>',
  '</div>'
].join('');

/* eslint-enable indent */

describe('ngcOmnibox.angularComponent.ngcModifySuggestionsTemplateFactory', () => {
  const templateCache = {put: () => {}};
  let ngcModifySuggestionsTemplate;

  it('should modify an un-categorized element', () => {
    const elementTemplate =
        `<ngc-omnibox-suggestions>${unCategorizedTemplate}</ngc-omnibox-suggestions>`;
    const document = jsdom.jsdom(elementTemplate).defaultView.document;
    const element = document.querySelector('ngc-omnibox-suggestions');

    ngcModifySuggestionsTemplate = ngcModifySuggestionsTemplateFactory([document], templateCache);
    expect(ngcModifySuggestionsTemplate(element)).toBe(unCategorizedTemplateOutput);
  });

  it('should modify a categorized element', () => {
    const elementTemplate =
        `<ngc-omnibox-suggestions>${categorizedTemplate}</ngc-omnibox-suggestions>`;
    const document = jsdom.jsdom(elementTemplate).defaultView.document;
    const element = document.querySelector('ngc-omnibox-suggestions');

    ngcModifySuggestionsTemplate = ngcModifySuggestionsTemplateFactory([document], templateCache);
    expect(ngcModifySuggestionsTemplate(element, 'category-tmpl')).toBe(categorizedTemplateOutput);
  });
});
