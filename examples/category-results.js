(function (angular, Fuse) {
  angular
    .module('demoApp', ['ngc.omnibox'])
    .controller('OmniboxExampleController', function ($http, $q) {
      var demo = this;
      var fuse, states;

      // Loads the remote data and populates the search engine
      function populateSearch() {
        return $q(function (resolve) {
          if (fuse) {
            resolve(fuse);
          } else {
            $q.all([
              /* eslint-disable max-len, lines-around-comment */
              $http.get('https://rawgit.com/mshafrir/2646763/raw/8b0dbb93521f5d6889502305335104218454c2bf/states_hash.json'),
              /* eslint-enable max-len, lines-around-comment */
              $http.get('https://www.govtrack.us/api/v2/role?current=true&role_type=senator')
            ])
            .then(function (responses) {
              states = responses[0].data;
              fuse = new Fuse(responses[1].data.objects, {
                keys: ['party', 'person.name'],
                threshold: 0.3
              });

              resolve(fuse);
            });
          }
        });
      }

      // Takes results from JSON API and categorizes the results by `state`
      function formatResults(results) {
        var grouped = {};

        // Populate groups with results
        results.forEach((result) => {
          var groupName = result.state;
          if (!grouped[groupName]) {
            grouped[groupName] = {
              state: states[result.state],
              children: []
            };
          }

          grouped[groupName].children.push(result);
        });

        return Object.keys(grouped).sort().map((groupName) => grouped[groupName]);
      }

      function filterOutChosen(result) {
        return !demo.model.includes(result);
      }

      this.model = [];

      // Only allow items, and not category headers, to be selectable
      this.isSelectable = function (item) {
        return !item.children;
      };

      this.sourceFn = function (query) {
        return populateSearch().then(function (fuse) {
          var results = fuse.list.filter(filterOutChosen); // Default to showing all results

          if (query) {
            results = fuse.search(query).filter(filterOutChosen);
          }

          return $q.resolve(formatResults(results));
        });
      };
    });
})(window.angular, window.Fuse);
