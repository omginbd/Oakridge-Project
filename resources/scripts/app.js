/*global $:false, jQuery:false, devel: true */

// global vars
var RESPONSIVE,
    ASSERT,
    AJAX,
    DEVTOOLS,
    EVENTS;

/***********************************************************************************************************************
* On Load
*   - runs the responsive.adjustSize to accomodate current window size
***********************************************************************************************************************/
$(function () {
    'use strict';
    try {
        DEVTOOLS.attachDevTools();
        RESPONSIVE.adjustSize({"extra": true});
        RESPONSIVE.buildMobileMenu();
        AJAX.initialPageLoad();
        //AJAX.loadPage("Oakridge Country Club");
        AJAX.attachToMenu();
        EVENTS.attachDefaultEvents();
        //The following lines are examples of how to use the assert
        var x = 1;
        ASSERT.assert(x === 2, "", "2 doesn't equal 1");
    } catch (e) {
        DEVTOOLS.addToErrorLog(e.stack);
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
* EVENTS
*   - an app to encapsulate all event binding and handling.
***********************************************************************************************************************/
var EVENTS = (function () {
    'use strict';
    var mobileMenuList = $("#mobileMenuList"),
        mobileMenuPulldownTab = $("#mobileMenuPulldownTab"),
        loginButton = $(".loginButton"),
        loginDialog = $("#loginDialog"),
        attachDefaultEvents = function () {
            mobileMenuPulldownTab.on("click", function () {
                mobileMenuList.slideToggle(100);
            });
            loginButton.on("click", function () {
                loginDialog.slideToggle(100);
            });
        },
        attachMobileHeaderEvent = function (params) {
            var mobile = params.mobile || false,
                headerWell = $(".headerWell");
            if (mobile) {
                if (!headerWell.hasClass("mobile-bind")) {
                    headerWell.addClass("mobile-bind clickable");
                    headerWell.on("click", function () {
                        mobileMenuList.slideToggle(100);
                    });
                }
            } else {
                headerWell.off("click").removeClass("mobile-bind clickable");
            }
        };
    return {
        attachDefaultEvents: function () {
            attachDefaultEvents();
        },
        attachMobileHeaderEvent: function (params) {
            attachMobileHeaderEvent(params);
        }
    };
}());

/***********************************************************************************************************************
* RESPONSIVE
*   - an app to hanldle window sizing.
***********************************************************************************************************************/
var RESPONSIVE = (function () {
    'use strict';
    // responsive variables
    var SMALL_BREAK_POINT = 768,
        previousWindowWidth = $(window).width();
    
    /*******************************************************************************
    * width
    *   - add width property function to the String prototype so that strings can 
    *       get their width
    *   - it's idiotic, but javascript struggles at getting the font something is 
    *       using... so we have to pass it in
    *******************************************************************************/
    String.prototype.width = function (params) {
        var fontFamily = params.fontFamily || "arial",
            fontSize = params.fontSize || "12px",
            font,
            ele,
            width;

        // add "px" if it doesn't already have it
        if (fontSize.toString().indexOf("px") === -1) {
            fontSize += "px";
        }

        font = fontSize + " " + fontFamily;

        // create a temp element to gather the width
        ele = $('<div>' + this + '</div>')
                .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': font})
                .appendTo($('body'));
        width = ele.width();

        ele.remove();

        return width;
    };

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
            EVENTS.attachMobileHeaderEvent({"mobile": true});
            nav.hide();
            loginButton.hide();
        } else {
            EVENTS.attachMobileHeaderEvent({"mobile": false});
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
            sizeLimitMax = params.maxSize || "",
            sizeLimitMin = params.minSize || "",
            ele,
            desiredSize,
            maxSize,
            parentWidth,
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
                    eleParent = ele.parent(),
                    eleWidth = parseInt(eleParent.css("width"), 10),
                    eleMarginLeft = parseInt(eleParent.css("margin-left"), 10),
                    eleMarginRight = parseInt(eleParent.css("margin-right"), 10),
                    elePaddingLeft = parseInt(eleParent.css("padding-left"), 10),
                    elePaddingRight = parseInt(eleParent.css("padding-right"), 10),
                    eleCalculatedWidth = eleWidth - elePaddingLeft - elePaddingRight - eleMarginLeft - eleMarginRight,
                    currentSize = 12,
                    fontFamily = "arial",
                    testWidth,
                    inc;
                
                // loop through and check increments (starting at 10) of the font size to see if they fit
                for (inc = 10; inc !== 0; inc = Math.floor(inc / 2)) {
                    testEle.css("font-size", currentSize + "px");
                    testWidth = testEle.text().width({fontSize: currentSize, fontFamily: fontFamily});
                    while (testWidth < eleCalculatedWidth) {
                        currentSize += inc;
                        testEle.css("font-size", currentSize + "px");
                        testWidth = testEle.text().width({fontSize: currentSize, fontFamily: fontFamily});
                    }
                    currentSize -= inc;
                }
                
                // apply limiters
                if (currentSize < sizeLimitMin) {
                    currentSize = sizeLimitMin;
                } else if (currentSize > sizeLimitMax) {
                    currentSize = sizeLimitMax;
                }
                maxSize = currentSize;
            };

        // check all parameters, find the maximum size that will fit, apply the correct size
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
            extra = params.extra || false;
        
        windowWidthAdjusted = windowWidth;
        rightSideHeight = rightSideEle.height(); // get current window width
        if (rightSideHeight > windowHeight) {
            windowWidthAdjusted += 15; // default scrollbar width needs to be subtracted
        }
        
        if (windowWidthAdjusted < SMALL_BREAK_POINT) {
            // do smaller settings
            rightSideEle.css("width", windowWidth + "px");
            mobileShow(true);
            textResizer({"ele": "#pageTitle", "size": "full", "maxSize": "80", "minSize": "12"});
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
        var allMenuItems = $(".menu-items a").clone(),
            mobileMenuList = $("#mobileMenuList"),
            mobileMenuContainer = mobileMenuList.find("ul"),
            loginButton = $(".loginButtonInner").clone(),
            homeButton = $("<a href=\"#\"><div class=\"menu-item homeButton\">Home</div></a>");
        
        mobileMenuContainer.empty();
        
        // create home button for mobile
        // mobileMenuContainer.append(homeButton);
        
        // loop through all the menu items and add them to the mobile menu
        allMenuItems.each(function (i, obj) {
            var ele = obj;
            mobileMenuContainer.append(ele);
        });
        
        // create login button for mobile
        loginButton.addClass("menu-item mobileLogin");
        loginButton.removeClass("buttonInner");
        loginButton.show();
        mobileMenuContainer.append(loginButton);
        loginButton.wrap("<a href='#'></a>");
        
        // hide the list
        mobileMenuList.hide();
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
    var assert = function (condition, func, message) {
        if (!condition) {
            if (func) {
                func(); // execute the callback function if it's passed in
            }
            message = message || "Assertion failed on: " + condition;
            if (typeof Error !== "undefined") {
                throw new Error(message); // use JavaScript's error object -- only supported in newer browsers
            }
            throw message; // fallback
        }
    };
    
    return {
        assert: function (condition, func, message) {
            assert(condition, func, message);
        }
    };
}());

/***********************************************************************************************************************
* AJAX
*   - an app to handle ajaxing pages when the user clicks in the navigation.
***********************************************************************************************************************/
var AJAX = (function () {
    'use strict';
    
    var load404;
    
    /*******************************************************************************
    * mapPageName()
    *   - takes the string of the clicked item, and passes back the html page path
    *       that it maps to
    *******************************************************************************/
    function mapPageName(pageName) {
        // Todo, This is horrible, this should be written out to file so they can easily change it
        var pageNames = {
            "oakridge country club": "home.html",
            "home": "home.html",
            "membership": "membership.html",
            "golf": "golf.html",
            "restaurant": "restaurant.html",
            "pool": "pool.html",
            "pro shop": "proshop.html",
            "business office": "businessoffice.html",
            "clubhouse": "clubhouse.html",
            "contact": "contact.html",
            "login": "login.html",
            "404": "404.html",
            "events": "events.html",
            "club history": "home.html"
        };
        
        // return the page if found, or return 404 page
        if (pageNames[pageName.toLocaleLowerCase()]) {
            return pageNames[pageName.toLocaleLowerCase()];
        } else {
            return "404.html";
        }
    }
    
    /*******************************************************************************
    * writeAjaxToURL()
    *   - appends the ajaxed page to the url so the user can see / link
    *******************************************************************************/
    function writeAjaxToURL(pagePath) {
        var adjustedPath = pagePath.replace(".html", "");
        window.location.hash = adjustedPath;
    }
    
    /*******************************************************************************
    * writePathToTitle()
    *   - writes the page name into the title
    *******************************************************************************/
    function writePathToTitle(pageName) {
        // todo, this is horrible.  This should be written out to a file so they can easily change it
        if (pageName.toLocaleLowerCase() === "home") {
            pageName = "Oakridge Country Club";
        } else if (pageName.toLocaleLowerCase() === "club history") {
            pageName = "Oakridge Country Club";
        }
        var title = $("#pageTitle");
        title.text(pageName);
    }
    
    /*******************************************************************************
    * getPageToLoad()
    *   - Assist page load to open the linked hash
    *******************************************************************************/
    function getPageToLoad() {
        return window.location.hash;
    }
    
    /*******************************************************************************
    * loadPage()
    *   - takes a page name, uses mapPageName() to convert it to it's respective 
    *       path, and loads that page into the main content div.
    *******************************************************************************/
    function loadPage(pageName) {
        var pagePath = mapPageName(pageName),
            mobileMenu = $("#mobileMenu"),
            mainContentDiv = $(".mainContent"),
            loginDialog = $("#loginDialog");
        mainContentDiv.empty();
        mobileMenu.hide();
        loginDialog.hide();
        mainContentDiv.load(pagePath, function (response, status, xhr) {
            ASSERT.assert(status === "success", load404, "Assertion failed on loading ajax: " + pagePath);
            RESPONSIVE.adjustSize({"extra": false}); // some strangeness was happening with the rightside header width, this resolves it
        });
        writeAjaxToURL(pagePath);
        writePathToTitle(pageName);
    }
    
    /*******************************************************************************
    * load404()
    *   - used as a callback in assert on failed loads, this will load the 404 page.
    *******************************************************************************/
    load404 = function () {
        loadPage("404");
    };
    
    /*******************************************************************************
    * initialPageLoad()
    *   - Assist page load to open the linked hash
    *******************************************************************************/
    function initialPageLoad() {
        var hash = getPageToLoad();
        if (hash === "") {
            hash = "home";
        }
        hash = hash.replace("#", "");
        loadPage(hash);
    }
    
    /*******************************************************************************
    * attachToMenu()
    *   - attaches on clicks to all the menu items so that they will do ajax
    *******************************************************************************/
    function attachToMenu() {
        //for each menu item, make on click use load Page
        var menuItems = $(".menu-item"),
            mobileMenuList = $("#mobileMenuList"),
            logo = $(".logo");
        menuItems.each(function (menuItem) {
            var item = $(menuItems[menuItem]),
                itemText = item.html();
            item.on("click", function () {
                loadPage(itemText);
                mobileMenuList.hide();
            });
        });
        logo.on("click", function () {
            loadPage("Oakridge Country Club");
        });
        
    }
    
    return {
        loadPage: function (pageName) {
            loadPage(pageName);
        },
        attachToMenu: function () {
            attachToMenu();
        },
        initialPageLoad: function () {
            initialPageLoad();
        }
    };
        
}());

/***********************************************************************************************************************
* DEVTOOLS
*   - an app to encapsulate all the dev tools
***********************************************************************************************************************/
var DEVTOOLS = (function () {
    'use strict';
    
    var addToErrorLog,
        attachDevTools,
        body = $("body"),
        BUILD = "0.01",
        buildObj = $("<h1 class=\"BUILD DEVTOOLS\" style=\"position: absolute; bottom: 0; right: 0; background-color: red;\">Build #" + BUILD + "</h1>"),
        clearErrorLog,
        displayErrorLog,
        errorLogFront = "<h1 class=\"LOG DEVTOOLS\" style=\"position: absolute; bottom: 0; right: 0; background-color: red;\">",
        errorLog,
        errorLogBack = "</h1>",
        execute,
        keys = "",
        keyCapture;
    
    /*******************************************************************************
    * displayErrorLog()
    *   - prints the error log to the page
    *******************************************************************************/
    displayErrorLog = function () {
        body.append(errorLogFront + errorLog + errorLogBack);
    };
    
    /*******************************************************************************
    * clearErrorLog()
    *   - clears what is in the current error log
    *******************************************************************************/
    clearErrorLog = function () {
        errorLog = "";
    };
    
    /*******************************************************************************
    * addToErrorLog()
    *   - adds an error to the error log
    *******************************************************************************/
    addToErrorLog = function (error) {
        var errorString = "<div>" + error + "</div>";
        errorLog += errorString;
    };
    
    /*******************************************************************************
    * attachDevTools()
    *   - attaches the on(click) to the page to allow access to dev tools
    *******************************************************************************/
    attachDevTools = function () {
        body.on("keydown", function (e) {
            keyCapture(e);
        });
    };
    
    /*******************************************************************************
    * keyCapture()
    *   - takes the event and determines the letter that was pressed, calls execute()
    *******************************************************************************/
    keyCapture = function (e) {
        var back = 8,
            esc = 27,
            keycode = e.keyCode,
            key = String.fromCharCode(keycode);

        if (keycode === esc) {
            keys = ""; // clear the stored keys
        } else if (keycode === back) {
            keys = keys.substring(0, keys.length - 1);
        } else {
            keys += key; // add a key
        }

        execute();
    };
    
    /*******************************************************************************
    * execute()
    *   - If the correct keys have been pressed, execute the appropriate command
    *******************************************************************************/
    execute = function () {
        var build = "BUILD",
            log = "LOG",
            deleteLog = "DELETE";
        
        // check for match
        if (keys === build) {
            body.append(buildObj);
            keys = "";
        } else if (keys === log) {
            displayErrorLog();
            keys = "";
        } else if (keys === deleteLog) {
            clearErrorLog();
            keys = "";
        } else if (keys === "") {
            $(".DEVTOOLS").each(function (i, obj) {
                obj.remove();
            });
            keys = "";
        }
    };
    
    return {
        addToErrorLog: function (error) {
            addToErrorLog(error);
        },
        attachDevTools: function () {
            attachDevTools();
        }
        
    };
}());