/*global $:false, jQuery:false, devel: true */

// global vars
var RESPONSIVE,
    ASSERT;

/***********************************************************************************************************************
* On Load
*   - runs the responsive.adjustSize to accomodate current window size
***********************************************************************************************************************/
$(function () {
    'use strict';
    try {
        RESPONSIVE.adjustSize({"extra": true});
        RESPONSIVE.buildMobileMenu();
        //The following lines are examples of how to use the assert
//        var x = 1;
//        ASSERT.assert(x === 1);
    } catch (e) {
        console.error(e);
    }
});

/***********************************************************************************************************************
* On Resize
*   - runs the responsive.adjustSize to accomodate current window size
***********************************************************************************************************************/
$(window).resize(function () {
    'use strict';
    RESPONSIVE.adjustSize({"extra": false});
});

/***********************************************************************************************************************
* RESPONSIVE
*   - an app to hanldle window sizing.
***********************************************************************************************************************/
var RESPONSIVE = (function () {
    'use strict';
    // responsive variables
    var SMALL_BREAK_POINT = 768,
        mobileMenuList = $("#mobileMenuList"),
        mobileMenuPulldownTab = $("#mobileMenuPulldownTab");
    mobileMenuPulldownTab.on("click", function () {
        mobileMenuList.slideToggle(100);
    });

    /*******************************************************************************
    * mobileShow()
    *   - shows and hides neccessary compontents for mobile-sized useage
    *******************************************************************************/
    function mobileShow(pShow) {
        var mobileMenu = $("#mobileMenu"),
            mobileMenuList = $("#mobileMenuList"),
            nav = $('nav'),
            loginButton = $(".loginButton");
        if (pShow) {
            mobileMenu.show();
            mobileMenuList.hide();
            nav.hide();
            loginButton.hide();
        } else {
            mobileMenu.hide();
            mobileMenuList.hide();
            nav.show();
            loginButton.show();
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
                var testEle = ele.clone(),
                    testEleHeight,
                    testEleWidth = parseInt(ele.parent().css("width"), 10),
                    testElePaddingLeft = parseInt(ele.parent().css("padding-left"), 10),
                    testEleMarginLeft = parseInt(ele.parent().css("margin-left"), 10),
                    testElePaddingRight = parseInt(ele.parent().css("padding-right"), 10),
                    testEleMarginRight = parseInt(ele.parent().css("margin-right"), 10),
                    previousTestEleHeight,
                    done = false,
                    currentSize = 1;
                testEle.css("font-size", currentSize + "px");
                testEle.css("position", "absolute");
                testEle.css("z-index", "-1000"); // so the test element doesn't show
                
                testEle.attr("id", "fontResizeTestElement");
                $("body").append(testEle);
                testEle = $("#fontResizeTestElement");
                testEle.css("width", testEleWidth - testEleMarginLeft - testEleMarginRight - testElePaddingLeft -
                            testElePaddingRight + "px");
                testEleHeight = testEle.height();
                
                previousTestEleHeight = testEleHeight;
                while (!done) {
                    testEle.css("font-size", currentSize + "px");
                    testEleHeight = testEle.height();
                    if ((testEleHeight / 2) > previousTestEleHeight) {
                        done = true;
                        currentSize -= 1;
                        testEle.css("font-size", currentSize + "px");
                    } else {
                        currentSize += 1;
                        previousTestEleHeight = testEleHeight;
                    }
                }
                
                testEle.remove();
                
                maxSize = currentSize;
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
//                        console.log("maxWidth was 0");
                        return;
                    }
                    ele.css("font-size", desiredSize + "px");
                } else {
                    // no provided size
//                    console.log("no provided size");
                    return;
                }
            } else {
                // couldn't find element by the provided selector
//                console.log("couldn't find element by the provided selector");
                return;
            }
        } else {
            // element selector empty
//            console.log("element selector empty");
            return;
        }
    }
    
    /*******************************************************************************
    * adjustSize()
    *   - measures window width, and calls the appropriate functions to adjust the
    *       view for the user
    *******************************************************************************/
    function adjustSize(params) {
        var windowWidth = $(window).width(),
            windowHeight = $(window).height(),
            navBarWidth = $(".navbar").width(),
            windowWidthAdjusted,
            rightSideEle = $("#rightSide"),
            mobileMenuList = $("#mobileMenuList"),
            rightSideHeight,
            extra = params.extra;
        
        windowWidthAdjusted = windowWidth;
        rightSideHeight = rightSideEle.height(); // get current window width
        if (rightSideHeight > windowHeight) {
            windowWidthAdjusted += 15; // default scrollbar width needs to be subtracted
        }
        
        if (windowWidthAdjusted < SMALL_BREAK_POINT) {
            // do smaller settings
            rightSideEle.css("width", windowWidth + "px");
            mobileShow(true);
            textResizer({"ele": "#pageTitle", "size": "full"});
            mobileMenuList.css("width", windowWidth + "px");
        } else {
            // do larger settings
            rightSideEle.css("width", windowWidth - navBarWidth);
            mobileShow(false);
            $("#pageTitle").css("font-size", ""); // use css font-size specs
        }
        
        if (extra) {
            adjustSize({"extra": false}); // this helps resolve an issue on load to remove the horizontal scrollbar
        }
    }
    
    /*******************************************************************************
    * buildMobileMenu()
    *   - This copies the menu from the left side nav, and puts it in the mobile
    *       menu.
    *   - This makes it so we don't need to duplicate our menu in the HTML
    *******************************************************************************/
    function buildMobileMenu() {
        // get all elements from main menu
        // paste them in mobile menu
        var i = 1;
        var allMenuItems = $(".menu-items a").clone(),
            mobileMenuContainer = $("#mobileMenuList ul");
        mobileMenuContainer.empty();
        allMenuItems.each(function (i, obj) {
            i++;
            var ele = obj;
            mobileMenuContainer.append(ele);
        });
        
        var loginButton = $(".loginButtonInner").clone();
        loginButton.addClass("menu-item");
        loginButton.addClass("mobileLogin");
        loginButton.removeClass("buttonInner");
        loginButton.show();
        mobileMenuContainer.append(loginButton);
        loginButton.wrap("<a href='#'></a>");
    }
    
    // return the functions that need public access
    return {
        adjustSize: function (params) {
            adjustSize(params);
        },
        textResizer: function (params) {
            textResizer(params);
        },
        buildMobileMenu: function () {
            buildMobileMenu();
        }
    };
}());

/***********************************************************************************************************************
* ASSERT
*   - an app to simulate asserts.
***********************************************************************************************************************/
var ASSERT = (function () {
    'use strict';
    var assert = function (condition, message) {
        if (!condition) {
            message = message || "Assertion failed on: " + condition;
            if (typeof Error !== "undefined") {
                throw new Error(message); // use JavaScript's error object -- only supported in newer browsers
            }
            throw message; // fallback
        }
    };
    
    return {
        assert: function (condition, message) {
            assert(condition, message);
        }
    };
}());