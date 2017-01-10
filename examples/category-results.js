angular
  .module('demoApp', ['ngc.omnibox'])
  .config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'http://www.carqueryapi.com/api/0.3/**'
    ]);
  })
  .controller('OmniboxExampleController', function ($http, $q, $scope) {
    var demo = this;
    var fuse;

    // Loads the remote data and populates the search engine
    function populateSearch() {
      return $q(function (resolve) {
        if (fuse) {
          resolve(fuse);
        } else {
          $http.jsonp('http://www.carqueryapi.com/api/0.3/?cmd=getMakes', {
            jsonpCallbackParam: 'callback'
          })
          .then(function (response) {
            fuse = new Fuse(response.data.Makes, {keys: ['make_display'], threshold: 0.3});
            resolve(fuse);
          });
        }
      });
    };

    // Takes results from JSON API and categorizes the results by `make_country`
    function formatResults(results) {
      const grouped = {};

      // Populate groups with results
      results.forEach((result) => {
        const groupName = result.make_country;
        if (!grouped[groupName]) {
          grouped[groupName] = {
            make_country: result.make_country,
            children: []
          };
        }

        grouped[groupName].children.push(result);
      });

      return Object.keys(grouped).map((groupName) => grouped[groupName]);
    };

    this.model = [];

    // Only allow items, and not category headers, to be selectable
    this.isSelectable = function (item) {
      return !item.children;
    };

    // Only show suggestions when at least 2 characters have been entered
    this.shouldShowSuggestions = function (query) {
      return query.length >= 2;
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
