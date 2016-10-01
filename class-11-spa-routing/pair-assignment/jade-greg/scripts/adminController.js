(function(module) {
  var adminController = {};

  Article.fetchAll(articleView.initAdminPage);

  adminController.index = function() {
      $('#about').hide();
      $('#articles').hide();
      $('#admin').show();
  };

  module.adminController = adminController;
})(window);
