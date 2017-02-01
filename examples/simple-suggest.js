(function (angular, FuzzySearch) {
  angular
    .module('demoApp', ['ngc.omnibox'])
    .controller('OmniboxExampleController', function ($http, $q) {
      var searcher;

      // Loads the remote data and populates the search engine
      function populateSearch() {
        return $q(function (resolve) {
          if (searcher) {
            resolve(searcher);
          } else {
            $http.get('https://www.govtrack.us/api/v2/role?current=true&role_type=senator')
              .then(function (response) {
                searcher = new FuzzySearch(response.data.objects, ['person.name']);
                resolve(searcher);
              });
          }
        });
      }

      this.model = '';

      // Only show suggestions when at least 2 characters have been entered
      this.shouldShowSuggestions = function (query) {
        return query.length >= 2;
      };

      /**
       * Searches through our dataset using Fuse and returns a Promise that resolves to a list of
       * suggested Senators, grouped by State.
       *
       * @param {String} query
       * @returns {Promise}
       */
      this.sourceFn = function (query) {
        return populateSearch().then(function (searcher) {
          if (query) {
            var results = searcher.search(query);

            if (results && results.length) {
              // Search through our suggestions for a Senator whose name starts with our query. If
              // our query is the beginning of the name, then we can hint as to the rest of its name
              var hintMatch = results.filter(function (suggestion) {
                var name = suggestion.person.firstname + ' ' + suggestion.person.lastname;
                return name.toLowerCase().indexOf(query.toLowerCase()) === 0;
              })[0];

              if (hintMatch) {
                return $q.resolve({
                  suggestions: results,
                  hint: hintMatch.person.firstname + ' ' + hintMatch.person.lastname
                });
              }
            }

            return $q.resolve(results);
          } else {
            return $q.resolve(); // Hides the suggestions
          }
        });
      };
    });
})(window.angular, window.FuzzySearch);
