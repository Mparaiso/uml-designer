/**
 * UML DESIGNER
 * @copyrights MPARAISO <mparaiso@online.fr>
 * @dependencies :
 * less
 * underscore
 * jquery
 * angularjs
 */
/** crée une représentation de class UML **/
var app = angular.module("umlDesigner",{});
app.controller("menu",function($scope){});
app.controller("canvas",function($scope){});
var exemple_de_model = {
    type: "nom du type",
    position: {x: 0, y: 0},
    properties: ["- prop1", "+ prop2", "# prop3"],
    methods: ["- method1", "+ method2", "# method3"]
};
var UD = {};

UD.umlClassTemplate = "\
<div class='uml-class-handle'>&nbsp;</div>\
    <div class='uml-class-inner'>\
        <div class='uml-header'>\
       <%=model.type%>\
       </div>\
       <div class='uml-class-select'><input type='checkbox'/></div>\
       <div class='clear'></div>\
        <ul class='uml-property-list'>\
        <%for(prop in model.properties){%>\
            <li class='uml-cell uml-private'>\
            <%=model.properties[prop]%>\
            </li>\
            <% } %>\
        </ul>\
        <ul class='uml-method-list'>\
        <% for(method in model.methods){%>\
            <li class='uml-cell uml-public'>\
            <%=model.methods[method]%>\
            </li>\
            <% } %>\
        </ul>\
    </div>";

UD.compiledUmlClassTemplate = _.template(UD.umlClassTemplate);
/**
 * jQuery.umlClass plugin
 */
(function ($, tpl) {
    "use strict";
    var defaultParams = {
        type: 'Class',
        //position: {x: 0, y: 0},
        properties: [],
        methods: []
    };
    var setUmlModel = function (model) {
        $(this).data("_model", model);
        this.trigger("model:update", model);
    }
    var getUmlModel = function () {
        return $(this).data("_model");
    }
    var renderUmlModel = function (event, model) {
        var $this = $(this);
        $this.cleanUmlCell();
        $this.html(tpl({model: model}));
        $(".uml-cell", $this).umlCell();
        $(".uml-header", $this).umlCell();
        $this.draggabilly({
            containment: true,
            handle: ".uml-class-handle"
        });
        if (!(this in umlClasses)) {
            umlClasses.push(this);
        }
    }
    var umlClasses = [];
    var umlClass = function (params) {
        params = $.extend(defaultParams, params);
        $.each(this, function () {
            var $this = $(this);
            $this.addClass("uml-class");
            $this.on("model:update", $this.renderUmlModel);
            $this.setUmlModel(params);

        });
        return this;
    };
    $.extend($.fn, {umlClass: umlClass,
        getUmlModel: getUmlModel,
        setUmlModel: setUmlModel,
        renderUmlModel: renderUmlModel
    });
    $.getUmlClasses = function () {
        return umlClasses;
    };
})($, UD.compiledUmlClassTemplate);
/**
 * jQuery.umlCell plugin
 * transform les cells en elements éditables
 */
(function ($) {
    "use strict";
    /**
     * FR : crée une zone éditable
     * @param {{editCallback:Function,uneditCallback:Function}} params
     * @returns {*}
     */

    var cleanUmlCell = function () {
        $.each(this, function () {
            var $this = $(this);
            $this.off('click');
            $this.off('blur');
            $this.off('celledit');
            $this.off("cellunedit");
        });
    };
    var umlCell = function (params) {
        params = params || {};
        $.each(this, function () {
            var editmode = false,
                val,
                $this = $(this);
            $this.on("click", function () {
                if (editmode === false) {
                    $this.attr('contenteditable', true);
                    editmode = true;
                    $this.focus();
                    $this.on("blur", function (event) {
                        if (editmode === true) {
                            $this.attr('contenteditable', false)
                            editmode = false;
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
    $.extend($.fn, {umlCell: umlCell, cleanUmlCell: cleanUmlCell});
})(jQuery);
/**
 * jQuery.draggabilly plugin
 */
(function ($) {
    var defaultParams = {};
    var getDraggabilly = function () {
        if (typeof(this._draggabilly) != undefined && this._draggabilly instanceof Draggabilly) {
            return this._draggabilly;
        }
    };
    var draggabilly = function (params) {
        $.extend(defaultParams, params);
        $.each(this, function () {
            this._draggabilly = new Draggabilly(this, params);
        });
        return this;
    }
    $.extend($.fn, {draggabilly: draggabilly, getDraggabilly: getDraggabilly});
})(jQuery);

$(function () {
    var totalClass = 0;
    var defaultModel = {
        get type() {
            return 'Class' + (totalClass++);
        },
        properties: ['+ prop1:String', '# prop2:Array', '- prop3:Int'],
        methods: ['# method1:String', '+ method2:Array', '- method3:Int']
    }
    var $addClassButton = $('#add-class');
    var $canvas = $("#uml-canvas");
    var classes = [];
    $addClassButton.on('click', function () {
        var $class = $('<div class="uml-class">');
        $class.umlClass(defaultModel);
        $canvas.append($class);
        classes.push($class);
        $class.css("z-index", 10);
        $class.on('mousedown', function () {
            $.each(classes, function () {
                this.css("z-index", 0);
            });
            $(this).css('z-index', 10);
        });
    });
    $(".uml-class").umlClass(defaultModel);
});


