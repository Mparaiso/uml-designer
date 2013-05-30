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
var app = angular.module("UmlDesigner", []);
/** FR : gère la persistance des données */
app.factory("StorageService", function ($window) {
    var ns = "UmlDesigner";
    /** @type {Storage} */
    var storage = $window.localStorage
    return{
        clearDatas: function () {
            storage.clear();
        },
        saveDatas: function (key, datas) {
            storage.setItem(
                ns + "-" + key, JSON.stringify(datas));
        },
        getDatas: function (key) {
            return JSON.parse(
                storage.getItem(ns + "-" + key));
        }
    };
});
app.factory("RelationService", function () {
    var INHERITS = "inherits";
    var IMPLEMENTS = "implements";
    var HAS_A = "has a";
    var typeIndex=0;
    return{
        // FR trouve un type par valeur
        getTypeFromValue: function (value) {
            for (var i = 0; i < this.types.length; i++) {
                if (value === this.types[i].value) {
                    return this.types[i];
                }
            }
        },
        types: [
            {value: ++typeIndex, label: INHERITS},
            {value: ++typeIndex, label: IMPLEMENTS},
            {value: ++typeIndex, label: HAS_A}
        ]
    }
});
app.factory("ConfigService", function () {
    return{
        display: {
            showMethods: true,
            showProperties: true
        }
    }
});
/**
 * FR : gère les classes<br>
 * EN : manage classes
 */
app.factory("HelpService", function () {
    return{
        "CELL_EDIT": "Click to edit,click outside to commit the changes",
        "HANDLE": "Drag the handle to move the Class diagram"
    }
});
/**
 * ClassService
 * manage classes
 * @name App.ClassService
 */
app.factory("ClassService", function ($window, StorageService) {
    var classes = StorageService.getDatas("classes") || [];
    $window.onbeforeunload = function (event) {
        StorageService.saveDatas("classes", classes);
    };
    return {
        classes: classes,
        lastSelectedClass: null,
        _nameIndex: 0,
        _defaultClass: {
            meta: {
                selected: false,
                zindex: 0
            },
            properties: [
                {value: '+ prop0:String'},
                {value: '# prop1:Array'}
            ],
            methods: [
                {value: '# meth0:String'},
                {value: '+ meth1:Array'}
            ],
            relations: []
        },
        makeId: function () {
            //
            return Date.now();
        },
        makeType: function () {
            // FR : nomme la classe , EN : name the class
            return 'Class' + (this._nameIndex++);
        },
        getLastSelected: function () {
            for (var i = 0; i < this.classes.length; i++) {
                if (this.classes[i].meta['class'] === "front") {
                    return this.classes[i];
                }
            }
        },
        getSelected: function () {
            return this.classes.filter(function (cls) {
                return cls.selected === "selected";
            });
        },
        addNew: function () {
            this.classes.push($.extend(true, {
                id: this.makeId(),
                type: this.makeType()
            }, this._defaultClass));
            return this;
        },
        addProp: function (_class) {
            _class.properties.push({value: "- prop" + _class.properties.length + ":Type"});
        },
        addMeth: function (_class) {
            _class.methods.push({value: "- meth" + _class.methods.length + ":Type"});

        },
        removeProp: function (_class, prop) {
            _class.properties.splice(_class.properties.indexOf(prop), 1);
        }, removeMeth: function (_class, meth) {
            _class.methods.splice(_class.methods.indexOf(meth), 1);
        }
    };
});
/**
 * @name  App.MenuController
 */
app.controller("MenuController", function ($scope, $log, $window, ClassService, ConfigService) {
    $scope.add = function () {
        ClassService.addNew();
    }
    $scope.inverseSelection = function () {
        var classes = ClassService.classes;
        for (var i in classes) {
            classes[i].meta.selected = !classes[i].meta.selected;
        }
    }
    $scope.delete = function () {
        for (var i = 0; i < ClassService.classes.length; i++) {
            if (ClassService.classes[i].meta.selected === true) {
                ClassService.classes.splice(i, 1);
                i--;
            }
        }
    };
    $scope.deleteAll = function () {
        if ($window.confirm("Delete All Classes ? ") === true) {
            ClassService.classes.splice(0, ClassService.classes.length);
        }
    }
    $scope.toggleProperties = function () {
        ConfigService.display.showProperties = !ConfigService.display.showProperties;
    }
    $scope.toggleMethods = function () {
        ConfigService.display.showMethods = !ConfigService.display.showMethods


    }
});
/**
 * @name App.CanvasController
 * FR : zone ou les classes sont affichées
 * EN : where the classes are displayed
 */
app.controller("CanvasController", function ($scope, ClassService, ConfigService) {
    $scope.classService = ClassService;
    $scope.config = ConfigService;
});
app.controller("ClassEditController", function ($scope, ClassService, RelationService) {
    $scope.classService = ClassService;
    $scope.relationService = RelationService;
    $scope.addRelationShip = function (_class) {
        console.log(_class);
        if (!_class.relations)
            _class.relations = [];
        _class.relations.push({type: null, target: null, description: null});
    };
    $scope.removeRelationShip = function (_class, _relation) {
        _class.relations.splice(_class.relations.indexOf(_relation), 1);
    }
});
/**
 * @name App.ClassController
 * EN : each class instance has a class controller
 */
app.controller("ClassController", function ($scope, ClassService, HelpService) {
    $scope.helpService = HelpService;
    $scope.pushFront = function (_class) {
        var classes = ClassService.classes;
        for (var i = 0; i < classes.length; i++) {
            classes[i].meta['class'] = "back";
        }
        _class.meta['class'] = "front";
    }
    $scope.addProp = function (_class) {
        ClassService.addProp(_class);
    };
    $scope.addMeth = function (_class) {
        ClassService.addMeth(_class);
    }
    $scope.removeProp = function (prop) {
        ClassService.removeProp($scope.class, prop);
    }
    $scope.removeMeth = function (meth) {
        ClassService.removeMeth($scope.class, meth);
    }
});
/**
 * @name App.Directive.UmlCanvas
 */
app.directive("umlCanvas", function ($log) {
    return function (scope, element, attrs) {
        $log.info("make uml canvas");
    };
});
/**
 * Class Directive
 */
app.directive("umlClass", function ($log, $timeout, ClassService) {
    return function (scope, element, attrs) {
        $timeout(function (event) {
            element.data("draggabilly",
                new Draggabilly(element.get(0), {
                    containment: "#uml-canvas",
                    handle: ".uml-class-handle"
                })
            );
            if (typeof(scope.class.meta.x) != undefined
                && typeof(scope.class.meta.y) != undefined) {
                element.css({
                        "top": scope['class'].meta.y,
                        "left": scope['class'].meta.x}
                );
            }
            element.data("draggabilly").on("dragMove", function (instance) {
                scope['class'].meta.x = instance.position.x
                scope['class'].meta.y = instance.position.y
            });
        }, 0);
    };
});
/**
 * Content editable
 * @see http://docs.angularjs.org/guide/forms
 */
app.directive('contenteditable', function ContentEditable() {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            // view -> model

            elm.bind('blur', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(elm.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                elm.html(ctrl.$viewValue);
            };
            elm.html(ctrl.$viewValue);
        }
    }
});
