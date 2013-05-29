/**
 * UML DESIGNER
 * @copyrights MPARAISO <mparaiso@online.fr>
 * @dependencies :
 * less
 * underscore
 * jquery
 */
/** crée une représentation de class UML **/
var exemple_de_model = {
    type: "nom du type",
    position: {x: 0, y: 0},
    properties: ["- prop1", "+ prop2", "# prop3"],
    methods: ["- method1", "+ method2", "# method3"]
};
var UD = {};

UD.umlClassTemplate = "<div  class='uml-class'>\
<div class='uml-class-handle'>&nbsp;</div>\
    <div class='uml-class-inner'>\
        <div class='uml-header'>\
       <%=model.type%>\
        </div>\
        <ul class='uml-property-list'>\
        <%for(prop in model.properties){%>\
            <li class='uml-cell uml-private'>\
            <%=prop%>\
            </li>\
            <% } %>\
        </ul>\
        <ul class='uml-method-list'>\
        <% for(method in model.methods){%>\
            <li class='uml-cell uml-public'>\
            <%=method%>\
            </li>\
            <% } %>\
        </ul>\
    </div>\
</div>";
UD.compiledUmlClassTemplate = _.template(UD.umlClassTemplate);

jQuery.fn.umlClass = (function (window, $, undefined, tpl) {
    "use strict";
    var defaultParams = {
        type: 'Class',
        position: {x: 0, y: 0},
        properties: [],
        methods: []
    };
    /**
     * @param {{type: String, position:{x:Number,y:Number},properties: String[], methods: String[] }} params
     * @returns {*}
     */
    var umlClass = function (params) {
        params = $.extend({}, defaultParams, params);
        $.each(this, function () {
            var $this = this;
            $this.html = tpl({model: params});
        });
        return this;
    }
    return umlClass;
})
    (window, $, undefined, UD.compiledUmlClassTemplate);
/**
 * transform les cells en elements éditables
 */
jQuery.fn.umlCell = (function (window, $, undefined) {
    "use strict";
    /**
     * FR : crée une zone éditable
     * @param {{editCallback:Function,uneditCallback:Function}} params
     * @returns {*}
     */
    var cell = function (params) {
        params = params || {};
        $.each(this, function () {
            var editmode = false,
                val,
                $input,
                $this = $(this);
            $this.on("click", function () {
                if (editmode === false) {
                    $this.emit
                    val = $this.text();
                    $input = $("<input type='text'>");
                    $input.val(val.trim());
                    $this.html($input);
                    editmode = true;
                    $input.focus();
                    $input.on("blur", function (event) {
                        if (editmode === true) {
                            $this.html($input.val());
                            editmode = false;
                            event.preventDefault();
                            $input.off("blur");
                            $input = null;
                            $this.trigger("cellunedit", $this, val);
                        }
                    });
                    $this.trigger("celledit", $this, val);
                }
            });
            if (typeof(params.editCallback) != undefined) {
                $this.on("celledit", params.editCallback);
            }
            if (typeof(params.uneditCallback) != undefined) {
                $this.on("cellunedit", params.uneditCallback);
            }
        });

        return this;
    }

    return cell;
})(window, jQuery, undefined);
$(function () {
    $(".uml-cell").umlCell({
        editCallback: function () {
            console.log("edit")
        },
        uneditCallback: function () {
            console.log("unedit")
        }
    });
    var umlClass1 = document.querySelector("#uml-class1");
    var draggie = new Draggabilly(umlClass1, {
        containment: true,
        handle: ".uml-class-handle"
    });


})
;


