(function (angular, FuzzySearch) {
  angular
    .module('demoApp', ['ngc.omnibox'])
    .controller('OmniboxExampleController', function ($http, $q) {
      var demo = this;
      var searcher, states;

      // Loads the remote data and populates the search engine
      function populateSearch() {
        return $q(function (resolve) {
          if (searcher) {
            resolve(searcher);
          } else {
            $q.all([
              /* eslint-disable max-len, lines-around-comment */
              $http.get('https://rawgit.com/mshafrir/2646763/raw/8b0dbb93521f5d6889502305335104218454c2bf/states_hash.json'),
              /* eslint-enable max-len, lines-around-comment */
              $http.get('https://www.govtrack.us/api/v2/role?current=true&role_type=senator')
            ])
              .then(function (responses) {
                states = responses[0].data;
                searcher = new FuzzySearch(responses[1].data.objects,
                  ['party', 'person.firstname', 'person.lastname']);

                resolve(searcher);
              });
          }
        });
      }

      // Takes results from JSON API and categorizes the results by `state`
      function formatResults(results) {
        var grouped = {};

        // Populate groups with results
        results.forEach(function (result) {
          var groupName = result.state;
          if (!grouped[groupName]) {
            grouped[groupName] = {
              state: states[result.state],
              children: []
            };
          }

          grouped[groupName].children.push(result);
        });

        return Object.keys(grouped).sort().map(function (groupName) {
          return grouped[groupName];
        });
      }

      function filterOutChosen(result) {
        return demo.model.indexOf(result) === -1;
      }

      this.model = [];

      // Only allow items, and not category headers, to be selectable
      this.isSelectable = function (item) {
        return !item.children;
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
          var results = searcher.haystack.filter(filterOutChosen); // Default to showing all results

          if (query) {
            results = searcher.search(query).filter(filterOutChosen);
          }

          results = formatResults(results);

          if (results && results.length) {
            // Search through our suggestions to try and find a Senator's full name that starts with
            // our query. If our query is the beginning of someone's name, then we can hint as to
            // the rest of their name.
            var hintMatch;
            results.forEach(function (category) {
              if (hintMatch) {
                return;
              }

              var personMatch = category.children.filter(function (item) {
                var person = item.person;
                var name = person.firstname + ' ' + person.lastname;

                // We can hint the full name if the query is the beginning of their name
                return name.toLowerCase().indexOf(query.toLowerCase()) === 0;
              })[0];

              if (personMatch) {
                hintMatch = personMatch;
              }
            });

            if (hintMatch) {
              return $q.resolve({
                suggestions: results,
                hint: hintMatch.person.firstname + ' ' + hintMatch.person.lastname
              });
            }
          }

          return $q.resolve(results);
        });
      };
    });

})(window.angular, window.FuzzySearch);
