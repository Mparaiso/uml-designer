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
    var typeIndex = 0;
    return{
        isValid: function (relation) {
            // FR : vérifie si une relation est valide
            return (typeof(relation.target) != undefined && relation.target != null
                && typeof(relation.type) != undefined && relation.type != null);
        },
        getTypeFromValue: function (value) {
            // FR trouve un type par valeur
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
            showProperties: true,
            zoomFactor: 1
        }
    }
});
app.factory("HelpService", function () {
    return{
        "CELL_EDIT": "Click to edit,click outside to commit the changes",
        "HANDLE": "Drag the handle to move the Class diagram"
    }
});
app.factory("ClassService", function ($window, StorageService, RelationService) {
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
        isClassOnTop: function (c1, c2) {
            var i = parseInt;
            var predicat = (i(c1.meta.y) + i(c1.meta.height)) < c2.meta.y
            return predicat;
        },
        isClassOnTheLeft: function (class1, class2) {
            return class1.meta.x < class2.meta.x;
        },
        getAllValidRelations: function () {
            var that = this;
            var relations = this.getAllRelations().filter(function (relation) {
                return RelationService.isValid(relation);
            });
            return relations;
        },
        getAllRelations: function () {
            var allRelations = [];
            var relations;
            for (var i = 0; i < this.classes.length; i++) {
                relations = this.classes[i].relations;
                if (relations instanceof Array) {
                    allRelations = allRelations.concat(relations);
                }
            }
            return allRelations;
        },
        getTopAnchor: function (_class) {
            var i = parseInt;
            var meta = _class.meta;
            return [i(meta.x) + i(meta.width) / 2, i(meta.y)];
        },
        getBottomAnchor: function (_class) {
            var i = parseInt;
            var meta = _class.meta;
            return [i(meta.x) + i(meta.width) / 2, i(meta.y) + i(meta.height)];
        },
        getRightSideAnchor: function (_class) {
            var i = parseInt;
            var meta = _class.meta;
            //return {x: i(meta.x) + i(meta.width), y: i(meta.y) + i(meta.height / 2)}
            r = [i(meta.x) + i(meta.width), i(meta.y) + i(meta.height / 2)];
            // console.log(r);
            return r;
        },
        getLeftSideAnchor: function (_class) {
            var i = parseInt;
            var meta = _class.meta;
            // return {x: i(meta.x), y: i(meta.y) + i(meta.height / 2)};
            r = [i(meta.x), i(meta.y) + i(meta.height / 2)];
            //  console.log(r);
            return r;
        },
        getClassById: function (id) {
            for (var i = 0; i < this.classes.length; i++) {
                if (this.classes[i].id == id) {
                    return this.classes[i];
                }
            }
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
        },
        removeMeth: function (_class, meth) {
            _class.methods.splice(_class.methods.indexOf(meth), 1);
        }
    };
});
app.controller("MenuController", function ($scope, $log, $window, ClassService, ConfigService) {
    $scope.zoom = function (factor) {
        var f = ConfigService.display.zoomFactor;
        if ((f + factor) > 0 && (f + factor) < 2) {
            angular.extend(ConfigService.display, {zoomFactor: (f + factor)});
        }
    };
    $scope.zoomReset = function(){
        ConfigService.display.zoomFactor = 1;
    }
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
    };
    $scope.toggleProperties = function () {
        ConfigService.display.showProperties = !ConfigService.display.showProperties;
    }
    $scope.toggleMethods = function () {
        ConfigService.display.showMethods = !ConfigService.display.showMethods


    }
});
app.controller("CanvasController", function ($scope, ClassService, ConfigService) {
    $scope.classService = ClassService;
    $scope.config = ConfigService;
});
app.controller("ClassEditController", function ($scope, ClassService, RelationService) {
    /**
     * FR : Gère le panneau d'édition de classe
     */
    $scope.classService = ClassService;
    $scope.relationService = RelationService;
    $scope.addProperty = function (_class) {
        ClassService.addProp(_class);
        return _class;
    };
    $scope.addMethod = function (_class) {
        ClassService.addMeth(_class);
    }
    $scope.removeProperty = function (_class, prop) {
        ClassService.removeProp(_class, prop);
    };
    $scope.removeMethod = function (_class, meth) {
        ClassService.removeMeth(_class, meth);
    };
    $scope.addRelationShip = function (_class) {
        if (!_class.relations)
            _class.relations = [];
        _class.relations.push({type: null, target: null, description: null, origin: _class.id});
    };
    $scope.removeRelationShip = function (_class, _relation) {
        _class.relations.splice(_class.relations.indexOf(_relation), 1);
    }
});
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
app.directive("umlCanvas", function ($timeout, $log, ClassService, $compile) {
    return function (scope, element, attrs) {
        var timeoutId;
        var lines = [];// les lignes à dessiner
        var strokeColor = attrs['stroke-color'] || "black";
        var $canvas;
        // FR : créer une ligne
        var makeLine = function (x1, y1, x2, y2) {
            var p1 = new paper.Point(x1, y1);
            var p2 = new paper.Point(x2, y2);
            var line = new paper.Path.Line(p1, p2);
            ///line.strokeColor = strokeColor;
            line.selected = true;
            return line
        }
        var updateLine = function (line, x1, y1, x2, y2) {
            var segs = line.getSegments();
            segs[0].getPoint().setX(x1);
            segs[0].getPoint().setY(y1);
            segs[1].getPoint().setX(x2);
            segs[1].getPoint().setY(y2);
            return line;
        }

        var removeLines = function (lines) {
            for (var i = 0; i < lines.length; i++) {
                lines[i].remove();
            }
        }
        var createLines = function (relations) {
            removeLines(lines);
            lines = [];
            for (var i = 0; i < relations.length; i++) {
                var relation = relations[i];
                var originClass = ClassService.getClassById(relation.origin);
                var relatedClass = ClassService.getClassById(relation.target);
                if (ClassService.isClassOnTop(originClass, relatedClass)) {
                    lines.push(makeLine.apply(null, [].concat(
                        ClassService.getTopAnchor(relatedClass),
                        ClassService.getBottomAnchor(originClass)
                    )));
                } else if (ClassService.isClassOnTop(relatedClass, originClass)) {
                    lines.push(makeLine.apply(null, [].concat(
                        ClassService.getTopAnchor(originClass),
                        ClassService.getBottomAnchor(relatedClass)
                    )));
                }
                else if (ClassService.isClassOnTheLeft(originClass, relatedClass)) {
                    lines.push(makeLine.apply(null, [].concat(
                        ClassService.getRightSideAnchor(originClass),
                        ClassService.getLeftSideAnchor(relatedClass)
                    )));
                } else {
                    lines.push(makeLine.apply(null, [].concat(
                        ClassService.getRightSideAnchor(relatedClass),
                        ClassService.getLeftSideAnchor(originClass)
                    )));
                }
            }
        };
        var updateLines = function (relations) {
            if (lines.length <= 0)return;
            for (var i = 0; i < relations.length; i++) {
                var relation = relations[i];
                var originClass = ClassService.getClassById(relation.origin);
                var relatedClass = ClassService.getClassById(relation.target);
                if (ClassService.isClassOnTop(originClass, relatedClass)) {
                    updateLine.apply(null, [lines[i]].concat(
                        ClassService.getTopAnchor(relatedClass),
                        ClassService.getBottomAnchor(originClass)
                    ));
                } else if (ClassService.isClassOnTop(relatedClass, originClass)) {
                    updateLine.apply(null, [lines[i]].concat(
                        ClassService.getTopAnchor(originClass),
                        ClassService.getBottomAnchor(relatedClass)
                    ));
                }
                else if (ClassService.isClassOnTheLeft(originClass, relatedClass)) {
                    // la classe d'origine est sur la gauche

                    updateLine.apply(null, [lines[i]].concat(
                        ClassService.getRightSideAnchor(originClass),
                        ClassService.getLeftSideAnchor(relatedClass)
                    ));
                } else {
                    // la classe d'origine est sur la droite
                    updateLine.apply(null, [lines[i]].concat(
                        ClassService.getRightSideAnchor(relatedClass),
                        ClassService.getLeftSideAnchor(originClass)
                    ));
                }
            }
        };

        timeoutId = $timeout(function () {
            $canvas = $('<canvas/>').attr("width", element.width())
                .attr('height', element.height()).attr("data-zoomable", true);
            //var fn = $compile($canvas);
            //fn(scope);
            element.append($canvas);
            paper.setup($canvas.get(0));
            createLines(ClassService.getAllValidRelations());
            paper.view.onFrame = function (d) {
                if (d.count % 3 == 0) {
                    updateLines(ClassService.getAllValidRelations());
                }
            };
            scope.$watch("classService.classes", function (value) {
                createLines(ClassService.getAllValidRelations());
            }, true);

        }, 0);
    }
});
app.directive("collapsr", function ($timeout) {
    return function (scop, element, attrs) {
        var $target = $(attrs['collapsr']);
        var collapsed = attrs['collapsed'] || false;
        $timeout(function () {
            if ($target != null) {
                element.on('click', function (e) {
                    if (collapsed == false) {
                        $target.hide();
                        element.trigger("hidden", {target: $target});
                    } else {
                        $target.show();
                        element.trigger("visisble", {target: $target});

                    }
                    collapsed = !collapsed;
                });
            }
        }, 0);
    };
});
app.directive("zoomable", function ($timeout, $log, ConfigService) {
    return{
        controller: function ($scope, ConfigService) {
            $scope.configService = ConfigService;
        },
        link: function (scope, element, attrs, ctrl) {
            $timeout(function () {
                scope.$watch("configService", function (val) {
                    $log.info('zoom', arguments);
                    element.css("zoom", val.display.zoomFactor);
                }, true);
            }, 0);
        }};
});
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
            scope.$watch("class", function () {
                scope['class'].meta.width = element.width();
                scope['class'].meta.height = element.height();
            }, true);
            element.data("draggabilly").on("dragMove", function (instance) {
                scope['class'].meta.x = instance.position.x
                scope['class'].meta.y = instance.position.y
            });
        }, 0);
    };
});
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
    };
});
