'use strict';

$(document).ready(function(){
    $('#updatebutton').click(function () {
      console.log('clicked');
      $(this).hide();
      $('#deleteFromMain').toggle();
    });
  
  });
  