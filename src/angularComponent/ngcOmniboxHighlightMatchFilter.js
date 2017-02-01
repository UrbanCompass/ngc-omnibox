/**
 * Filter for surrounding text in a suggestion with HTML for highlighting. This is mostly based
 * on a similar filter in the uib-typeahead project https://github.com/angular-ui/bootstrap
 *
 * Usage:
 *   <ngc-omnibox-suggestions-item
 *       ng-bind-html="suggestion.title | ngcOmniboxHighlightMatch:omnibox.query">
 *   </ngc-omnibox-suggestions-item>
 */
ngcOmniboxHighlightMatchFilter.$inject = ['$injector', '$log', '$sce'];
export default function ngcOmniboxHighlightMatchFilter($injector, $log, $sce) {

  /**
   * Angular Filter for surrounding text with HTML. This is useful for highlighting text in a
   * suggestion to note what is being matched against.
   *
   * @param {String} matchItem -- Entire item of text that can contain a match inside it
   * @param {String} query -- The query we're trying to highlight in the matchItem
   * @param {String} replacement -- String replacement pattern to surround the highlighted query
   *     with HTML. It defaults to '<strong>$&</strong>'.
   *
   * @returns {Function}
   */
  return function ngcOmniboxHighlightMatch(matchItem, query, replacement = '<strong>$&</strong>') {
    const isSanitizePresent = $injector.has('$sanitize');

    if (!isSanitizePresent && containsHtml(matchItem)) {
      $log.warn('Unsafe use, please use ngSanitize');
    }

    // Replaces the capture string with a the same string inside of a "strong" tag
    if (query) {
      matchItem = matchItem.replace(new RegExp(escapeRegexp(query), 'gi'), replacement);
    }

    // If $sanitize is not present, pack the string in a $sce object for the ng-bind-html directive
    if (!isSanitizePresent) {
      matchItem = $sce.trustAsHtml(matchItem);
    }

    return matchItem;
  };
}

/**
 * Regex: capture the whole query string and replace it with the string that will be used to match
 * the results, for example if the capture is "a" the result will be \a
 *
 * @param {String} queryToEscape
 * @returns {String}
 */
function escapeRegexp(queryToEscape) {
  return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
}

/**
 * Whether the string contains HTML tags.
 *
 * @param {String} str
 * @returns {Boolean}
 */
function containsHtml(str) {
  return /<.*>/g.test(str);
}
