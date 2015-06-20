/*global $:false, jQuery:false */

// function definitions
var adjustSize,
    mobileShow,
    textResizer;

// global variables
var SMALL_BREAK_POINT = 768;

$(function () {
    'use strict';
    adjustSize();
});
  
$(window).resize(function () {
    'use strict';
    adjustSize();
    textResizer({"ele": ".title", "size": "full"});
});

function adjustSize() {
    'use strict';
    var windowWidth = $(window).width(),
        navBarWidth = $(".navbar").width(),
        rightSideEle = $("#rightSide");
    
    if (windowWidth < SMALL_BREAK_POINT) {
        rightSideEle.css("width", windowWidth);
        mobileShow(true);
    } else {
        rightSideEle.css("width", windowWidth - navBarWidth);
        mobileShow(false);
    }
}

function mobileShow(pShow) {
    'use strict';
    var mobileMenu = $("#mobileMenu"),
        nav = $('nav'),
        loginButton = $(".loginButton");
    if (pShow) {
        mobileMenu.show();
        nav.hide();
        loginButton.hide();
    } else {
        mobileMenu.hide();
        nav.show();
        loginButton.show();
    }
}

function textResizer(params) {
    'use strict';
    var eleSelector = params.ele || "",
        size = params.size || "",
        parentWidth,
        ele,
        maxSize,
        desiredSize,
        findParentWidth = function () {
            if (ele) {
                parentWidth = ele.parent.width();
            } else {
                // no ele
                return;
            }
        },
        testForMaxSize = function () {
            maxSize = 666;
        };
    
    if (eleSelector) {
        ele = $(eleSelector);
        if (ele) {
            findParentWidth();
            if (size && size === "full") {
                testForMaxSize();
                ele.css("font-size", maxSize + "px");
            } else if (size && size === "half") {
                testForMaxSize();
                if (maxSize !== 0) {
                    desiredSize = maxSize / 2;
                } else {
                    // maxWidth was 0
                    return;
                }
                ele.css("font-size", desiredSize + "px");
            } else {
                // no provided size
                return;
            }
        } else {
            // couldn't find element by the provided selector
            return;
        }
    } else {
        // element selector empty
        return;
    }
}