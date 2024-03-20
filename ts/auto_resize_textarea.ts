(() => {
    /**
     * Author and copyright: Stefan Haack (https://shaack.com)
     * Repository: https://github.com/shaack/auto-resize-textarea
     * License: MIT, see file 'LICENSE'
     */
    var autoResizeTextarea = function (querySelector: any, options: any) {
        var config: any = {
            maxHeight: Infinity
        }
        for (var option in options) {
            config[option] = options[option]
        }
        for (var i = 0; i < querySelector.length; i++) {
            forEachElement(querySelector[i])
        }
        function elementHeight(element: any) {
            return parseFloat(getComputedStyle(element, null).height.replace("px", ""))
        }
        function initInternal(element: any) {
            var initialDisplay = element.style.display
            element.style.display = "block" // prevent display="none"
            element.autoResizeTextarea.initialHeight = elementHeight(element)
            element.autoResizeTextarea.initialScrollHeight = parseFloat(element.scrollHeight)
            if (element.autoResizeTextarea.initialScrollHeight > element.autoResizeTextarea.initialHeight) {
                element.autoResizeTextarea.initialHeight = element.autoResizeTextarea.initialScrollHeight + 2
            }
            element.style.height = element.autoResizeTextarea.initialHeight + "px"
            element.style.display = initialDisplay
        }
        function init(element: any) {
            element.autoResizeTextarea = {}
            initInternal(element)
            updateElement(element)
            if (!element.autoResizeTextarea.initialHeight) {
                // try again, element might take longer to render
                setTimeout(function () {
                    initInternal(element)
                    updateElement(element)
                }, 500)
            }
        }
        function updateElement(element: any) {
            element.style.height = element.autoResizeTextarea.initialHeight + "px"
            var newHeight = element.autoResizeTextarea.initialHeight + element.scrollHeight - element.autoResizeTextarea.initialScrollHeight
            newHeight = Math.max(newHeight, element.autoResizeTextarea.initialHeight)
            element.style.height = Math.min(newHeight, config.maxHeight) + "px"
        }
        function forEachElement(element: any) {
            init(element)
            element.addEventListener("input", function () {
                updateElement(element)
            })
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        autoResizeTextarea(document.querySelectorAll('textarea.auto-resize'), { maxHeight: 320 })
    })

})()
