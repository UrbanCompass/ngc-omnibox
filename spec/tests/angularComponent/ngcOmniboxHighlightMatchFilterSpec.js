import ngcOmniboxHighlightMatchFilter from '~/angularComponent/ngcOmniboxHighlightMatchFilter.js';

describe('ngcOmnibox.angularComponent.ngcOmniboxHighlightMatchFilter', () => {
  const $injector = {has: () => true};
  const $log = {warn: () => {}};
  const $sce = {trustAsHtml: (str) => str};
  const ngcOmniboxHighlightMatch = ngcOmniboxHighlightMatchFilter($injector, $log, $sce);

  it('should surround a match with strong tags by default', () => {
    expect(ngcOmniboxHighlightMatch('This is my text', 'is my'))
        .toBe('This <strong>is my</strong> text');
  });

  it('should surround a match with arbitrary markup', () => {
    expect(ngcOmniboxHighlightMatch('This is my text', 'is my', '<em class="strong">$&</em>'))
        .toBe('This <em class="strong">is my</em> text');
  });
});
