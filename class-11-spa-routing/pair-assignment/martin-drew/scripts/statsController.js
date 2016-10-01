(function(module) {
  var statsController = {};

  Article.fetchAll(articleView.initAdminPage);

  // DONE(Stretch): Created statsController.js to control route for stats 
  statsController.index = function() {
    $('#about').hide();
    $('#articles').hide();
    $('#blog-stats').show();


  };

  module.statsController = statsController;
})(window);
