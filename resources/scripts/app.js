/*global $:false, jQuery:false */

// global vars
var RESPONSIVE;

/***********************************************************************************************************************
* On Load
*   - runs the responsive.adjustSize to accomodate current window size
***********************************************************************************************************************/
$(function () {
    'use strict';
    RESPONSIVE.adjustSize();
    //RESPONSIVE.textResizer({"ele": ".title", "size": "full"});
});

/***********************************************************************************************************************
* On Resize
*   - runs the responsive.adjustSize to accomodate current window size
***********************************************************************************************************************/
$(window).resize(function () {
    'use strict';
    RESPONSIVE.adjustSize();
    RESPONSIVE.textResizer({"ele": ".title", "size": "full"});
});

/***********************************************************************************************************************
* RESPONSIVE
*   - an app to hanldle window sizing.
***********************************************************************************************************************/
var RESPONSIVE = (function () {
    'use strict';
    // responsive variables
    var SMALL_BREAK_POINT = 768;

    /*******************************************************************************
    * mobileShow()
    *   - shows and hides neccessary compontents for mobile-sized useage
    *******************************************************************************/
    function mobileShow(pShow) {
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
    
    /*******************************************************************************
    * adjustSize()
    *   - measures window width, and calls the appropriate functions to adjust the
    *       view for the user
    *******************************************************************************/
    function adjustSize() {
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

    /*******************************************************************************
    * textResizer()
    *   - accepts an element and desired size type, and scales text accordingly
    *   - Size Types are:
    *       full - largest size possible without going onto two lines
    *       half - half of full
    *   - future params:
    *       breakSize - if it can't fit this specified size, allow two(multi) lines
    *******************************************************************************/
    function textResizer(params) {
        var eleSelector = params.ele || "",
            size = params.size || "",
            parentWidth,
            ele,
            maxSize,
            desiredSize,
            findParentWidth = function () {
                if (ele) {
                    parentWidth = ele.parent().width();
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
                        console.log("maxWidth was 0");
                        return;
                    }
                    ele.css("font-size", desiredSize + "px");
                } else {
                    // no provided size
                    console.log("no provided size");
                    return;
                }
            } else {
                // couldn't find element by the provided selector
                console.log("couldn't find element by the provided selector");
                return;
            }
        } else {
            // element selector empty
            console.log("element selector empty");
            return;
        }
    }
    
    // return the functions that need public access
    return {
        adjustSize: function () {
            adjustSize();
        },
        textResizer: function (params) {
            textResizer(params);
        }
    };
}());
