(function (angular, Fuse) {
  angular
    .module('demoApp', ['ngc.omnibox'])
    .controller('OmniboxExampleController', function ($http, $q) {
      var demo = this;
      var fuse;

      // Loads the remote data and populates the search engine
      function populateSearch() {
        return $q(function (resolve) {
          if (fuse) {
            resolve(fuse);
          } else {
            $http.get('https://www.govtrack.us/api/v2/role?current=true&role_type=senator')
              .then(function (response) {
                fuse = new Fuse(response.data.objects, {
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
        const grouped = {};

        // Populate groups with results
        results.forEach((result) => {
          const groupName = result.state;
          if (!grouped[groupName]) {
            grouped[groupName] = {
              state: result.state,
              children: []
            };
          }

          grouped[groupName].children.push(result);
        });

        return Object.keys(grouped).sort().map((groupName) => grouped[groupName]);
      }

      this.model = [];

      // Only allow items, and not category headers, to be selectable
      this.isSelectable = function (item) {
        return !item.children;
      };

      this.sourceFn = function (query) {
        if (query) {
          return populateSearch().then(function (fuse) {
            const searchResults = fuse.search(query).filter(function (result) {
              return !demo.model.includes(result);
            });
            return $q.resolve(formatResults(searchResults));
          });
        } else {
          return $q.resolve(); // Hides the suggestions
        }
      };
    });
})(window.angular, window.Fuse);
