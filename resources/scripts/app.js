$(function(){
    $("#rightSide").css("width",($(document).width() - $(".navbar").width()) + "px");
});
  
$( window ).resize(function() {
  $("#rightSide").css("width",($(document).width() - $(".navbar").width()) + "px");
});
 