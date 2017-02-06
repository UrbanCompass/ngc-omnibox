import ngcOmniboxHighlightMatchFilter from '~/angularComponent/ngcOmniboxHighlightMatchFilter.js';

describe('ngcOmnibox.angularComponent.ngcOmniboxHighlightMatchFilter', () => {
  describe('When highlighting santized HTML', () => {
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

  describe('When highlighting un-sanitized HTML', () => {
    const $injector = {has: () => false};
    const $log = {warn: jasmine.createSpy(() => {})};
    const $sce = {trustAsHtml: jasmine.createSpy((str) => str)};
    const ngcOmniboxHighlightMatchUnsafe = ngcOmniboxHighlightMatchFilter($injector, $log, $sce);

    it('should santize plain text', () => {
      ngcOmniboxHighlightMatchUnsafe('This is my text');
      expect($sce.trustAsHtml).toHaveBeenCalled();
    });

    it('should warn if ngSanitize isn\'t used with HTML', () => {
      ngcOmniboxHighlightMatchUnsafe('This is my text');
      expect($log.warn).not.toHaveBeenCalled();

      ngcOmniboxHighlightMatchUnsafe('<div>This is my text</div>');
      expect($log.warn).toHaveBeenCalled();
    });
  });

});
