function hideFinishedTasks(){
    var rowArr = jQuery("tr[id^='taskboard-row-']");
        jQuery.each(rowArr, function(index, value){
            if (jQuery(value).children()[2].innerHTML === '' && jQuery(value).children()[3].innerHTML === ''){
                value.children[0].click();
            }
        });
}
