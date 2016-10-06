Handlebars.registerHelper("formatDate", function(date){
    var date = new Date(date);
    // This guard is needed to support Blog Posts without date
    // the takeway point is that custom helpers parameters must be present on the context used to render the templates
    // or JS error will be launched
    if (typeof(date) == "undefined") {
        return "Unknown";
    }
    console.log(date);
    // These methods need to return a String
    return (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();
});
