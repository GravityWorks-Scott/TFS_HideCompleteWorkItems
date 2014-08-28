var rowArr = jQuery("tr[id^='taskboard-row-']");
$.each(rowArr, function(index, value)
{
  // console.log(jQuery(value).children()[2].innerHTML);
  // 
  // //console.log(Array.isArray(value.children[2].children)); // == [] && value.children[3].children == []);
  // 
  // //
  if (jQuery(value).children()[2].innerHTML === '' && jQuery(value).children()[3].innerHTML === ''){
    value.children()[0].click();
  }
});
