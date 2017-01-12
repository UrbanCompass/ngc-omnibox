(function (angular, Fuse) {
  angular
    .module('demoApp', ['ngc.omnibox'])
    .controller('OmniboxExampleController', function ($http, $q) {
      var fuse;

      // Loads the remote data and populates the search engine
      function populateSearch() {
        return $q(function (resolve) {
          if (fuse) {
            resolve(fuse);
          } else {
            $http.get('https://api.github.com/emojis').then(function (response) {
              var emoji = Object.keys(response.data).map(function (id) {
                return {
                  id,
                  url: response.data[id]
                };
              });

              fuse = new Fuse(emoji, {keys: ['id'], threshold: 0.3});
              resolve(fuse);
            });
          }
        });
      }

      this.model = '';

      this.sourceFn = function (query) {
        return populateSearch().then(function (fuse) {
          if (query) {
            var results = fuse.search(query);
            return $q.resolve(results);
          } else {
            return $q.resolve(); // Hides the suggestions
          }
        });
      };
    });
})(window.angular, window.Fuse);
