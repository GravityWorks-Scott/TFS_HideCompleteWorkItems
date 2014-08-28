// ==UserScript==
// @name       TFS Layout Enhancements
// @version    7
// @description  Layout Fixes for TFS
// @include    http://*/tfs/*/TaskBoard*
// @include    */tfs/*/_workitems*
// @include    */tfs/*/_backlogs*
// @include    */tfs/*/*/_boards
// @match      [YOUR TFS URLPATH]
// @namespace  COMDSPDSA
// ==/UserScript==

function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

addGlobalStyle('.ui-corner-top { float: left; }');
addGlobalStyle('.content .column { padding-right: 1em; }');
addGlobalStyle('.witID { cursor:pointer; }');
addGlobalStyle('.wit-font-size-small { display:none; }');
addGlobalStyle('.taskboard-parent .icon-add { float:left; }');
addGlobalStyle('.tbPivotItem .witTitle strong { float:right; }');
addGlobalStyle('.tbPivotItem br { display:none; }');

var createTriggers = false; // so we only add link-click override functions once
var pageReady = false;
var TIMEOUT = 500;
var MAXTIMEOUT = 5000;
var resizeDefectMax = MAXTIMEOUT / TIMEOUT;
var resizeModalDefMax = MAXTIMEOUT / TIMEOUT;
var resizeRequirementMax = MAXTIMEOUT / TIMEOUT;
var addIDMax = MAXTIMEOUT / TIMEOUT;

setTimeout(resizeDefect, TIMEOUT);
setTimeout(resizeModalDef, TIMEOUT);
setTimeout(resizeRequirement, TIMEOUT);
setTimeout(addID, TIMEOUT);
setTimeout(hideFinishedTasks, TIMEOUT);
setTimeout(highlightDataExists, MAXTIMEOUT); // ugh.

function processMouseClick() {
    clearTimeout(resizeModalDef);
    clearTimeout(resizeRequirement);
    clearTimeout(resizeDefect);
    clearTimeout(addID);
    clearTimeout(hideFinishedTasks, TIMEOUT);

    setTimeout(resizeModalDef, TIMEOUT);
    setTimeout(resizeRequirement, TIMEOUT);
    setTimeout(resizeDefect, TIMEOUT);
    setTimeout(addID, TIMEOUT);
}

function hideFinishedTasks(){
    var rowArr = jQuery("tr[id^='taskboard-row-']");
        jQuery.each(rowArr, function(index, value){
            if (jQuery(value).children()[2].innerHTML === '' && jQuery(value).children()[3].innerHTML === ''){
                value.children[0].click();
            }
        });
}


function resizeDefect()
{
    resizeDefectMax--;
    var items = document.getElementsByClassName('richeditor-container');
    if (items.length == 0 && resizeDefectMax > 0) {
        setTimeout(resizeDefect, TIMEOUT);
    }
    else {

        if ($('.richeditor-editarea').eq(0)) {
            $('.richeditor-editarea').each(function( index ) {
                switch(index)
                {
                    case 2: // root cause details
                        var minHeight = Math.max($(this).height(), ($(window).height() - $(this).offset().top) / 2);
                        $(this).parent().css('height', minHeight + 'px');
                        break;
                    case 4: // history-comments
                        // do not resize
                        break;
                    default:
                        $(this).parent().css('height', $(window).height() - $(this).offset().top + 'px');
                }
            });
        }
    }
}

function highlightDataExists() {
    var highlightThisTab = false,
        flagThisTab = false,
        tabsToCheck = [ 'Repro Steps', 'System Info', 'Root Cause Details', 'Fix', 'Other', 'User Defined Fields' ],
        fieldsToIgnore = [ 'SOA Worked', 'Interlocks tracking Defect', 'Requires Review:', 'Requires Test:', 'User Acceptance Test' ],
        ignoreThisField = false;

    tabsToCheck.forEach(function(thisTab) {
        highlightThisTab = false;
        flagThisTab = false;
        if ($('div[rawtitle="' + thisTab + '"] iframe').contents().find('body').text().length > 0) {
            highlightThisTab = true;
        }
        $('div[rawtitle="' + thisTab + '"] input').each(function(thisField) {
            me = $('div[rawtitle="' + thisTab + '"] input').eq(thisField);
            if (me.attr('title') != undefined && me.attr('title').length > 0) {
                ignoreThisField = false;
                $.each(fieldsToIgnore, function( eachIndex, eachValue ) {
                    if (me.parent().parent().parent().parent().prev().find('label').text() === eachValue) {
                        ignoreThisField = true;
                    }
                });
                if (!ignoreThisField) {
                    highlightThisTab = true;
                }
            }
            if (me.parent().parent().hasClass('invalid')) {
                flagThisTab = true;
            }
        });
        if (highlightThisTab) {
            $('a[rawtitle="' + thisTab + '"]').parent().css('border-top', '2px dotted black')
        } else {
            $('a[rawtitle="' + thisTab + '"]').parent().css('border-top', 'inherit')
        }
        if (flagThisTab) {
            $('a[rawtitle="' + thisTab + '"]').parent().css('border-top', '2px dotted red')
        } else {
            if (highlightThisTab) {
                $('a[rawtitle="' + thisTab + '"]').parent().css('border-color', 'inherit');
            } else {
                $('a[rawtitle="' + thisTab + '"]').parent().css('border-top', 'inherit');
            }
        }
    });

    // deal with Task Board Enhancer conflicts; although in a loop, only processes initially
    $('.tbPivotItem ._tspPatched').remove();
    $('._tspPatched:not(.witID)').each(function() {
        var $thisOne = $(this);
        $thisOne.attr('title', $thisOne.text());
        $thisOne.addClass('witID');
        var thisText = $thisOne.parent().text().replace(/\[(.*?)\]/gi, '');
        $thisOne.parent().text(thisText);
    });

    if ($('.refreshMonkey').length === 0) {
        $('.work-item-form:visible .toolbar .menu-bar').append('<li class="menu-item icon-only refreshMonkey" title="Resize this work item to fit the window."><span class="icon icon-play"></span></li>');
        $('.refreshMonkey').unbind('mouseup');
        $('.refreshMonkey').on( "mouseup", function() { processMouseClick(); });
    }

    setTimeout(highlightDataExists, MAXTIMEOUT); // double ugh. I SHOULD figure out how to gracefully process this once but these scripts are done quickly.
}

function resizeModalDef()
{
    resizeModalDefMax--;
    var items = document.getElementsByClassName('ui-dialog')
    if (items.length == 0 && resizeModalDefMax > 0) {
        setTimeout(resizeModalDef, TIMEOUT);
    }
    else {
        resizeModal();
        if ($('.ui-dialog .richeditor-container').offset() !== undefined) {
            $('.ui-dialog .richeditor-container').css("height", $(window).height() - $('.ui-dialog .richeditor-container').offset().top + "px"); // maximize detail text area (for defects) on modals
        }
    }
}

function resizeRequirement()
{
    resizeRequirementMax--;
    var items = document.getElementsByClassName('plaintextcontrol');
    if (items.length == 0 && resizeRequirementMax > 0) {
        setTimeout(resizeRequirement, TIMEOUT);
    }
    else {
        resizeModal();
        if ($('.plaintextcontrol').offset() !== undefined) {
            $('.plaintextcontrol').css("height", $(window).height() - $('.plaintextcontrol').offset().top + "px"); // maximize detail text area (for requirements) on modals
        }
    }
}

function resizeModal() {
    $('.dialog').parent().css('left', '5%');
    $('.dialog').parent().css('width', '90%');
    $('.work-item-form').parent().css('width', '100%');
}

function copyToClipboard(text) {
    window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
}

function goPeeps (dir) {
    thesePeople = $('.filters div[title=\"Person\"] .sub-menu li');
    firstPerson = thesePeople.eq(0);
    lastPerson = thesePeople.eq(thesePeople.length-1);
    thisPerson = $('.filters div[title=\"Person\"] .selected').eq(0).text();
    thisLI = $('.filters div[title=\"Person\"] .sub-menu li[title=\"' + thisPerson + '\"]');
    if (dir === 'next') {
        if (thisLI.next().length > 0) {
            thisLI.next().click();
        } else {
            firstPerson.click();
        }
    } else {
        if (thisLI.prev().length > 0) {
            thisLI.prev().click();
        } else {
            lastPerson.click();
        }
    }
}

function goGroup (dir) {
    theseGroups = $('.filters div[title=\"Group by\"] .sub-menu li');
    firstGroup = theseGroups.eq(0);
    lastGroup = theseGroups.eq(theseGroups.length-1);
    thisGroup = $('.filters div[title=\"Group by\"] .selected').eq(0).text();
    thisLI = $('.filters div[title=\"Group by\"] .sub-menu li[title=\"' + thisGroup + '\"]');
    if (dir === 'next') {
        if (thisLI.next().length > 0) {
            thisLI.next().click();
        } else {
            firstGroup.click();
        }
    } else {
        if (thisLI.prev().length > 0) {
            thisLI.prev().click();
        } else {
            lastGroup.click();
        }
    }
}

function goReset() {
    theseGroups = $('.filters div[title=\"Group by\"] .sub-menu li');
    firstGroup = theseGroups.eq(0);
    thesePeople = $('.filters div[title=\"Person\"] .sub-menu li');
    firstPerson = thesePeople.eq(0);
    firstGroup.click();
    firstPerson.click();
}

function toggleBurndown() {
    if (!$('.large-chart-container').is(":visible")) {$('.burndown-chart img.clickable').click();} else { $('.ui-dialog .ui-button').click() }
}

function addID()
{
    addIDMax--;
    var items = document.getElementsByClassName('witTitle')
    if (items.length == 0 && addIDMax > 0) {
        setTimeout(addID, TIMEOUT);
    }
    else {
        requirements = $('.taskboard-parent-wrapper'); // TODO: finish up adding ID spans to requirement boxes (rows)
        rows = requirements.parent().parent();

        $(requirements).each(function( index ) {
            toDisplay = $(this).text();
            var justID = $(rows[index]).attr('id').replace('taskboard-table_p', '');
            // don't mess with the contents of $(this)! FYI.
            if (toDisplay.indexOf(justID) === -1) {
                var seekText = $(this).find('.witTitle').text();
                var replaceDiv = $('div').find('span:contains("' + seekText + '")');
                $(replaceDiv).each(function( index ) {
                    if($(this).text() == seekText ) {
                        $(this).before('<span class="witID" title="' + justID + '">[' + justID + ']</span> ');
                    }
                });
            }
        });

        links = $('.tbTile .witTitle');
        boxes = $('.tbTile .witTitle').parent().parent();

        $( links ).each(function( index ) {
            toDisplay = $(this).text();
            var justID = $(boxes[index]).attr('id').replace('tile-', '');
            if (toDisplay.indexOf(justID) === -1) {
                pageReady = true;
                if (toDisplay.length > 72) {
                    $(this).css({'line-height': '.95em', 'font-size': '.9em'});
                }
                $(this).html('<span class="witID" title="' + justID + '">[' + justID + ']</span> ' + toDisplay);
            }
        });

        if (pageReady) { // note this only happens in board view
            $('.witID').unbind('mouseup');
            $('.tbTile').unbind('mouseup');
            $('.ui-button').unbind('mouseup');
            $('.search-box').unbind('mouseup');
            $(document).unbind('keyup');

            $('.witID').mouseup(function(e) {
                if( e.which === 3 ) {
                    copyToClipboard($(this).attr('title'));
                    e.preventDefault();
                    e.stopPropagation();
                }
            });

            $('.tbTile').on( "mouseup", function() { processMouseClick(); });
            $('.ui-button').on( "mouseup", function() { processMouseClick(); });
            $('.search-box').on( "mouseup", function() { processMouseClick(); });

            $(document).keyup(function(e) {
                if (e.keyCode == 27) { processMouseClick(); }   // esc
                if (!$('.ui-dialog').is(':visible') && e.keyCode == 37 && e.ctrlKey) { goGroup('prev'); } // Ctrl-Left
                if (!$('.ui-dialog').is(':visible') && e.keyCode == 39 && e.ctrlKey) { goGroup('next'); } // Ctrl-Right
                if (!$('.ui-dialog').is(':visible') && e.keyCode == 38 && e.ctrlKey) { goPeeps('prev'); } // Ctrl-Up
                if (!$('.ui-dialog').is(':visible') && e.keyCode == 40 && e.ctrlKey) { goPeeps('next'); } // Ctrl-Down
                if (!$('.ui-dialog').is(':visible') && e.keyCode == 46 && e.ctrlKey) { goReset(); } // Ctrl-Delete
                if (e.keyCode == 45 && e.ctrlKey) { toggleBurndown(); } // Ctrl-Insert
            });

            $('.dropdown[title="Group by"] a').click().next().css('display', 'none');
            $('.dropdown[title="Person"] a').click().next().css('display', 'none');

        }
    }
}
