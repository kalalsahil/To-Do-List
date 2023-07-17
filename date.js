// jshint esversion: 6
exports.getDate = function (){
    const today = new Date();
    var options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    var day = today.toLocaleDateString("en-US",options);
    return day;
};

