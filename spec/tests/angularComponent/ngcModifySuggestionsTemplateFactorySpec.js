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
      'suggestion="suggestion" ',
      'ng-attr-aria-selected="{{suggestionItem.isHighlighted() || undefined}}" ',
      'ng-attr-aria-readonly="{{suggestionItem.isSelectable() === false || undefined}}" ',
      'ng-mouseenter="suggestionItem.handleMouseEnter()" ',
      'ng-mouseleave="suggestionItem.handleMouseLeave()" ng-click="suggestionItem.handleClick()">',
    '{{suggestion.sample_item_text}}',
  '</ngc-omnibox-suggestion-item>'
].join('');

const categorizedTemplate = [
  '<div ngc-omnibox-suggestion-category>',
    '<h5 ngc-omnibox-suggestion-header>{{suggestion.sample_category_title}}</h5>',
    '<ngc-omnibox-suggestion-item>',
      '{{suggestion.sample_item_text}}',
    '</ngc-omnibox-suggestion-item>',
  '</div>'
].join('');

const categorizedTemplateOutput = [
  '<div ng-repeat="suggestion in suggestion.children || omnibox.suggestions">',
    '<div ngc-omnibox-suggestion-category="" ng-if="suggestion.children">',
      '<h5 ngc-omnibox-suggestion-header="" suggestion="suggestion" ',
          'ng-attr-aria-selected="{{suggestionItem.isHighlighted() || undefined}}" ',
          'ng-attr-aria-readonly="{{suggestionItem.isSelectable() === false || undefined}}" ',
          'ng-mouseenter="suggestionItem.handleMouseEnter()" ',
          'ng-mouseleave="suggestionItem.handleMouseLeave()" ',
          'ng-click="suggestionItem.handleClick()">',
        '{{suggestion.sample_category_title}}',
      '</h5>',
      '<div ng-repeat="suggestion in suggestion.children" ng-include="\'category-tmpl\'"></div>',
    '</div>',
    '<ngc-omnibox-suggestion-item ng-if="!suggestion.children" suggestion="suggestion" ',
        'ng-attr-aria-selected="{{suggestionItem.isHighlighted() || undefined}}" ',
        'ng-attr-aria-readonly="{{suggestionItem.isSelectable() === false || undefined}}" ',
        'ng-mouseenter="suggestionItem.handleMouseEnter()" ',
        'ng-mouseleave="suggestionItem.handleMouseLeave()" ',
        'ng-click="suggestionItem.handleClick()">',
      '{{suggestion.sample_item_text}}',
    '</ngc-omnibox-suggestion-item>',
  '</div>'
].join('');

const loadingElTemplate = [
  '<ngc-omnibox-suggestion-item>',
    '{{suggestion.sample_item_text}}',
  '</ngc-omnibox-suggestion-item>',
  '<ngc-omnibox-suggestion-loading></ngc-omnibox-suggestion-loading>'
].join('');

const loadingElTemplateOutput = [
  '<ngc-omnibox-suggestion-item ng-repeat="suggestion in omnibox.suggestions" ',
      'suggestion="suggestion" ',
      'ng-attr-aria-selected="{{suggestionItem.isHighlighted() || undefined}}" ',
      'ng-attr-aria-readonly="{{suggestionItem.isSelectable() === false || undefined}}" ',
      'ng-mouseenter="suggestionItem.handleMouseEnter()" ',
      'ng-mouseleave="suggestionItem.handleMouseLeave()" ng-click="suggestionItem.handleClick()">',
    '{{suggestion.sample_item_text}}',
  '</ngc-omnibox-suggestion-item>',
  '<ngc-omnibox-suggestion-loading role="progressbar" ng-if="omnibox.shouldShowLoadingElement">',
  '</ngc-omnibox-suggestion-loading>'
].join('');

const noResultsElTemplate = [
  '<ngc-omnibox-suggestion-item>',
    '{{suggestion.sample_item_text}}',
  '</ngc-omnibox-suggestion-item>',
  '<ngc-omnibox-suggestion-empty></ngc-omnibox-suggestion-empty>'
].join('');

const noResultsElTemplateOutput = [
  '<ngc-omnibox-suggestion-item ng-repeat="suggestion in omnibox.suggestions" ',
      'suggestion="suggestion" ',
      'ng-attr-aria-selected="{{suggestionItem.isHighlighted() || undefined}}" ',
      'ng-attr-aria-readonly="{{suggestionItem.isSelectable() === false || undefined}}" ',
      'ng-mouseenter="suggestionItem.handleMouseEnter()" ',
      'ng-mouseleave="suggestionItem.handleMouseLeave()" ng-click="suggestionItem.handleClick()">',
    '{{suggestion.sample_item_text}}',
  '</ngc-omnibox-suggestion-item>',
  //                                                            vv I think this is a bug in jsdom
  '<ngc-omnibox-suggestion-empty ng-if="!omnibox.hasSuggestions &amp;&amp; !omnibox.isLoading">',
  '</ngc-omnibox-suggestion-empty>'
].join('');

/* eslint-enable indent */

describe('ngcOmnibox.angularComponent.ngcModifySuggestionsTemplateFactory', () => {
  const templateCache = {put: () => {}};
  let ngcModifySuggestionsTemplate;

  it('should modify an un-categorized subcomponent', () => {
    const elementTemplate =
        `<ngc-omnibox-suggestions>${unCategorizedTemplate}</ngc-omnibox-suggestions>`;
    const document = jsdom.jsdom(elementTemplate).defaultView.document;
    const element = document.querySelector('ngc-omnibox-suggestions');

    ngcModifySuggestionsTemplate = ngcModifySuggestionsTemplateFactory([document], templateCache);
    expect(ngcModifySuggestionsTemplate(element)).toBe(unCategorizedTemplateOutput);
  });

  it('should modify a categorized subcomponent', () => {
    const elementTemplate =
        `<ngc-omnibox-suggestions>${categorizedTemplate}</ngc-omnibox-suggestions>`;
    const document = jsdom.jsdom(elementTemplate).defaultView.document;
    const element = document.querySelector('ngc-omnibox-suggestions');

    ngcModifySuggestionsTemplate = ngcModifySuggestionsTemplateFactory([document], templateCache);
    expect(ngcModifySuggestionsTemplate(element, 'category-tmpl')).toBe(categorizedTemplateOutput);
  });

  it('should modify a loading subcomponent', () => {
    const elementTemplate =
        `<ngc-omnibox-suggestions>${loadingElTemplate}</ngc-omnibox-suggestions>`;
    const document = jsdom.jsdom(elementTemplate).defaultView.document;
    const element = document.querySelector('ngc-omnibox-suggestions');

    ngcModifySuggestionsTemplate = ngcModifySuggestionsTemplateFactory([document], templateCache);
    expect(ngcModifySuggestionsTemplate(element)).toBe(loadingElTemplateOutput);
  });

  it('should modify a no-results subcomponent', () => {
    const elementTemplate =
        `<ngc-omnibox-suggestions>${noResultsElTemplate}</ngc-omnibox-suggestions>`;
    const document = jsdom.jsdom(elementTemplate).defaultView.document;
    const element = document.querySelector('ngc-omnibox-suggestions');

    ngcModifySuggestionsTemplate = ngcModifySuggestionsTemplateFactory([document], templateCache);
    expect(ngcModifySuggestionsTemplate(element)).toBe(noResultsElTemplateOutput);
  });

  it('should only allow one instance of a subcomponent', () => {
    const elementTemplate = `
      <ngc-omnibox-suggestions>
        <ngc-omnibox-suggestion-item></ngc-omnibox-suggestion-item>
        <ngc-omnibox-suggestion-item></ngc-omnibox-suggestion-item>
      </ngc-omnibox-suggestions>
    `;
    const document = jsdom.jsdom(elementTemplate).defaultView.document;
    const element = document.querySelector('ngc-omnibox-suggestions');

    ngcModifySuggestionsTemplate = ngcModifySuggestionsTemplateFactory([document], templateCache);
    expect(() => ngcModifySuggestionsTemplate(element))
        .toThrowError('Cannot include more than one instance of \'ngc-omnibox-suggestion-item\'');
  });
});
