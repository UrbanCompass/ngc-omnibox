import jsdom from 'jsdom';

import ngcModifySuggestionsTemplateFactory from '~/angularComponent/ngcModifySuggestionsTemplateFactory.js';

/* eslint-disable indent */

const noItemTemplate = '<ngc-omnibox-suggestions></ngc-omnibox-suggestions>';

const unCategorizedTemplate = [
  '<ngc-omnibox-suggestions-item>',
    '{{suggestion.sample_item_text}}',
  '</ngc-omnibox-suggestions-item>'
].join('');

const unCategorizedTemplateOutput = [
  '<ngc-omnibox-suggestions-item ng-repeat="suggestion in omnibox.suggestions" ',
      'suggestion="suggestion" ',
      'ng-attr-aria-selected="{{suggestionItem.isHighlighted() || undefined}}" ',
      'ng-attr-aria-readonly="{{suggestionItem.isSelectable() === false || undefined}}" ',
      'ng-mouseenter="suggestionItem.handleMouseEnter()" ',
      'ng-mouseleave="suggestionItem.handleMouseLeave()" ng-click="suggestionItem.handleClick()">',
    '{{suggestion.sample_item_text}}',
  '</ngc-omnibox-suggestions-item>'
].join('');

const categorizedTemplate = [
  '<div ngc-omnibox-suggestions-category>',
    '<h5 ngc-omnibox-suggestions-header>{{suggestion.sample_category_title}}</h5>',
    '<ngc-omnibox-suggestions-item>',
      '{{suggestion.sample_item_text}}',
    '</ngc-omnibox-suggestions-item>',
  '</div>'
].join('');

const categorizedTemplateOutput = [
  '<div ng-repeat="suggestion in suggestion.children || omnibox.suggestions">',
    '<div ngc-omnibox-suggestions-category="" ng-if="suggestion.children">',
      '<h5 ngc-omnibox-suggestions-header="" suggestion="suggestion" ',
          'ng-attr-aria-selected="{{suggestionItem.isHighlighted() || undefined}}" ',
          'ng-attr-aria-readonly="{{suggestionItem.isSelectable() === false || undefined}}" ',
          'ng-mouseenter="suggestionItem.handleMouseEnter()" ',
          'ng-mouseleave="suggestionItem.handleMouseLeave()" ',
          'ng-click="suggestionItem.handleClick()">',
        '{{suggestion.sample_category_title}}',
      '</h5>',
      '<div ng-repeat="suggestion in suggestion.children" ng-include="\'category-tmpl\'"></div>',
    '</div>',
    '<ngc-omnibox-suggestions-item ng-if="!suggestion.children" suggestion="suggestion" ',
        'ng-attr-aria-selected="{{suggestionItem.isHighlighted() || undefined}}" ',
        'ng-attr-aria-readonly="{{suggestionItem.isSelectable() === false || undefined}}" ',
        'ng-mouseenter="suggestionItem.handleMouseEnter()" ',
        'ng-mouseleave="suggestionItem.handleMouseLeave()" ',
        'ng-click="suggestionItem.handleClick()">',
      '{{suggestion.sample_item_text}}',
    '</ngc-omnibox-suggestions-item>',
  '</div>'
].join('');

const loadingElTemplate = [
  '<ngc-omnibox-suggestions-item>',
    '{{suggestion.sample_item_text}}',
  '</ngc-omnibox-suggestions-item>',
  '<ngc-omnibox-suggestions-loading></ngc-omnibox-suggestions-loading>'
].join('');

const loadingElTemplateOutput = [
  '<ngc-omnibox-suggestions-item ng-repeat="suggestion in omnibox.suggestions" ',
      'suggestion="suggestion" ',
      'ng-attr-aria-selected="{{suggestionItem.isHighlighted() || undefined}}" ',
      'ng-attr-aria-readonly="{{suggestionItem.isSelectable() === false || undefined}}" ',
      'ng-mouseenter="suggestionItem.handleMouseEnter()" ',
      'ng-mouseleave="suggestionItem.handleMouseLeave()" ng-click="suggestionItem.handleClick()">',
    '{{suggestion.sample_item_text}}',
  '</ngc-omnibox-suggestions-item>',
  '<ngc-omnibox-suggestions-loading role="progressbar" ng-if="omnibox.shouldShowLoadingElement">',
  '</ngc-omnibox-suggestions-loading>'
].join('');

const noResultsElTemplate = [
  '<ngc-omnibox-suggestions-item>',
    '{{suggestion.sample_item_text}}',
  '</ngc-omnibox-suggestions-item>',
  '<ngc-omnibox-suggestions-empty></ngc-omnibox-suggestions-empty>'
].join('');

const noResultsElTemplateOutput = [
  '<ngc-omnibox-suggestions-item ng-repeat="suggestion in omnibox.suggestions" ',
      'suggestion="suggestion" ',
      'ng-attr-aria-selected="{{suggestionItem.isHighlighted() || undefined}}" ',
      'ng-attr-aria-readonly="{{suggestionItem.isSelectable() === false || undefined}}" ',
      'ng-mouseenter="suggestionItem.handleMouseEnter()" ',
      'ng-mouseleave="suggestionItem.handleMouseLeave()" ng-click="suggestionItem.handleClick()">',
    '{{suggestion.sample_item_text}}',
  '</ngc-omnibox-suggestions-item>',
  //                                                            vv I think this is a bug in jsdom
  '<ngc-omnibox-suggestions-empty ng-if="!omnibox.hasSuggestions &amp;&amp; !omnibox.isLoading">',
  '</ngc-omnibox-suggestions-empty>'
].join('');

/* eslint-enable indent */

describe('ngcOmnibox.angularComponent.ngcModifySuggestionsTemplateFactory', () => {
  const templateCache = {put: () => {}};
  let ngcModifySuggestionsTemplate;

  it('should throw an error if there is no ngc-omnibox-suggestions-item element', () => {
    const document = jsdom.jsdom(noItemTemplate).defaultView.document;
    const element = document.querySelector('ngc-omnibox-suggestions');

    ngcModifySuggestionsTemplate = ngcModifySuggestionsTemplateFactory([document], templateCache);
    expect(() => ngcModifySuggestionsTemplate(element))
      .toThrowError('An ngcOmniboxSuggestionsItem is required.');
  });

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
        <ngc-omnibox-suggestions-item></ngc-omnibox-suggestions-item>
        <ngc-omnibox-suggestions-item></ngc-omnibox-suggestions-item>
      </ngc-omnibox-suggestions>
    `;
    const document = jsdom.jsdom(elementTemplate).defaultView.document;
    const element = document.querySelector('ngc-omnibox-suggestions');

    ngcModifySuggestionsTemplate = ngcModifySuggestionsTemplateFactory([document], templateCache);
    expect(() => ngcModifySuggestionsTemplate(element))
      .toThrowError('Cannot include more than one instance of \'ngc-omnibox-suggestions-item\'');
  });
});
