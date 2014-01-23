/*jslint white:true, browser:true */
/*global angular */
/**
 * UML DESIGNER
 * @copyrights MPARAISO <mparaiso@online.fr>
 *
 * UML designer helps developpers create UML diagrams in the browser.
 * it is built  with HTML5
 * with UML designer , developpers no longer need to use native tools
 * to create diagrams and can design diagrams on any HTML5 ready device
 *
 */
"use strict";
var app = angular.module("UmlDesigner", []);

app.factory("SelectionService", function (StorageService) {
    return {
        selected: [],
        lastSelected: null
    };
});
app.factory("StorageService", function ($window) {
    var storage,ns = "UmlDesigner";
    /** @type {Storage} */
    storage = $window.localStorage;
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
    var typeIndex = 0;
    return{
        isValid: function (relation, name) {
            // FR : vérifie si une relation est valide
            return (typeof(relation.target) !== undefined && relation.target !== null && typeof(relation.type) !== undefined && relation.type !== null);
        },
        types: [
            {value: 0, label: "inherits", name: "INHERITS"},
            {value: 1, label: "implements", name: "IMPLEMENTS"},
            {value: 2, label: "has a (aggregation)", name: "HAS_A"},
            {value: 3, label: "owns a (composition)", name: "OWNS_A"}
        ]
    };
});
app.factory("ConfigService", function (StorageService) {
    return{
        display: {
            showMethods: true,
            showProperties: true,
            zoomFactor: 1
        }
    };
});
app.factory("ExportService", function ($window, $log,JointConfigService, SelectionService) {
    return {
        /**
         * @see https://groups.google.com/forum/?fromgroups#!topic/raphaeljs/ZIP3RTt8AZw
         * @see https://code.google.com/p/canvg/
         * @param {Raphael.paper} paper
         */
        "export": function (paper) {
            if (typeof(CanvasRenderingContext2D ) !== "undefined") {
                SelectionService.lastSelected = null;
                SelectionService.selected.splice(0, SelectionService.selected.length);
                var canvas = document.createElement("CANVAS");
                canvas.width = JointConfigService.paperAttrs.width;
                canvas.height = JointConfigService.paperAttrs.height;
                var _export = canvg(canvas, $("#uml-canvas").html());
                var img = canvas.toDataURL("image/png");
                $window.open(img, "_blank");
                img = null;
                canvas = null;
            }else{
                $log.info("Canvas not supported");
            }
        }
    }
});
app.factory("JointConfigService", function () {
    return {
        paper: null,
        selectedClassAttrs: {},
        paperAttrs: {},
        defaultClassParameters: {
            rect: {
                x: 0,
                y: 0
                /*width: 150*/, height: 200
            },
            attributes: [],
            methods: [],
            shadow: true,
            toolbox: true,
            autoWidth: true,
            autoHeight: true,
            label: "defaultType",
            attrs: {
                fill: "#F9F9F9",
                "font-size": "15"
            },
            labelAttrs: {
                'font-size': "14",
                "font-family": "Verdana",
                "font-weight": "Bold"
            },
            attrAttrs: {
                'font-size': "12"
            },
            methodAttrs: {
                'font-size': "12"
            }
        }
    };
});
app.factory("HelpService", function () {
    return{
        "CELL_EDIT": "Click to edit,click outside to commit the changes",
        "HANDLE": "Drag the handle to move the Class diagram"
    };
});
app.factory("ClassService", function ($window, StorageService, RelationService, ConfigService, SelectionService) {
    var classes = StorageService.getDatas("classes") || [];
    $window.onbeforeunload = function (event) {
        StorageService.saveDatas("config", ConfigService);
        StorageService.saveDatas("classes", classes);
    };
    return {
        classes: classes,
        lastSelectedClass: null,
        _nameIndex: 0,
        _defaultClass: {
            dataType: "class",
            meta: {},
            properties: [
                {value: '+ prop0:String'}
            ],
            methods: [
                {value: '# meth0():String'}
            ],
            relations: []
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
        getClassById: function (id) {
            for (var i = 0; i < this.classes.length; i++) {
                if (this.classes[i].id == id) {
                    return this.classes[i];
                }
            }
        },
        makeId: function () {
            return Date.now();
        },
        makeType: function () {
            // FR : nomme la classe , EN : name the class
            return 'Class' + (this._nameIndex++);
        },
        unselect: function (_class) {
            SelectionService.selected.splice(SelectionService.selected.indexOf(_class), 1);
            SelectionService.lastSelected = null;
        },
        selectById: function (id) {
            var _class = this.getClassById(id);
            if (_class != null) {
                return this.select(_class);
            }
        },
        select: function (_class) {
            var i = SelectionService.selected.indexOf(_class);
            if (i >= 0) {
                SelectionService.selected.splice(i, 1);
            }
            SelectionService.selected.push(_class);
            SelectionService.lastSelected = _class;
            return _class;

        },
        getSelected: function () {
            return SelectionService.selected;
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
app.controller("MenuController", function ($scope, $window, ClassService, ConfigService, JointConfigService, ExportService, SelectionService) {
    $scope.zoom = function (factor) {
        var f = ConfigService.display.zoomFactor;
        if ((f + factor) > 0 && (f + factor) < 2) {
            angular.extend(ConfigService.display, {zoomFactor: (f + factor)});
        }
    };
    $scope.zoomReset = function () {
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
    $scope["delete"] = function () {
        ClassService.classes.splice(ClassService.classes.indexOf(SelectionService.lastSelected), 1);
        SelectionService.lastSelected = null;
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
    $scope['export'] = function () {
        if (JointConfigService.paper != null) {
            ExportService['export'](JointConfigService.paper);
        }
    };
});
app.controller("CanvasController", function ($scope, ClassService, ConfigService) {
    $scope.classService = ClassService;
    $scope.config = ConfigService;
});
app.controller("ClassEditController", function ($scope, ClassService, RelationService, SelectionService) {
    /**
     * FR : Gère le panneau d'édition de classe
     */
    $scope.classService = ClassService;
    $scope.relationService = RelationService;
    $scope.selectionService = SelectionService;
    $scope.layerSelectSize  = ClassService.classes.length;
    $scope.$watch("classService.classes",function(){
        $scope.layerSelectSize = Math.min( ClassService.classes.length,10);
    },true);
    $scope.selectClass = function (_class) {
       ClassService.select(_class);
    };
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
app.directive("umlClassDiagram", function ($timeout, ClassService, JointConfigService, SelectionService) {
    return {
        controller: function ($scope, SelectionService, ClassService, ConfigService) {
            $scope.selectionService = SelectionService;
            $scope.configService = ConfigService;
            $scope.classService = ClassService;
            $scope.selectClass = function (_class) {
                ClassService.select(_class);
            }
        },
        link: function ($scope, element, attr, ctrl) {
            var uml, classes, relations;
            var getDiagramById = function (id) {
                for (var i = 0; i < classes.length; i++) {
                    if (id == classes[i].id) {
                        return classes[i];
                    }
                }
            };
            var findDiagramByTarget = function (target) {
                for (var i = 0; i < classes.length; i++) {
                    if (target == classes[i].yourself()[0]) {
                        return classes[i];
                    }
                }
            };
            // mettre à jour les métadonnées d'une classe à partir de sa représentation
            var updateClassMeta = function (target) {
                var diagram = findDiagramByTarget(target);
                if (typeof(diagram) != undefined && diagram != null) {
                    var _class = ClassService.getClassById(diagram.id);
                    if (_class != null) {
                        _class.meta.x = diagram.getBBox().x;
                        _class.meta.y = diagram.getBBox().y;
                        return _class;
                    }
                }
            };
            // obtenir le type de flèche à partir du type de relation
            var getArrowConfigFromRelationType = function (type) {
                var relation;
                switch (type) {
                    case 0:
                        relation = uml.dependencyArrow;
                        break;
                    case 1:
                        relation = uml.generalizationArrow;
                        break;
                    case 2:
                        relation = uml.compositionReverseArrow;
                        break;
                    default:
                        relation = uml.aggregationReverseArrow;
                        break;
                }
                return relation;
            };
            // vide le diagramme
            var emptyDiagram = function () {
                relations = [];
                classes = [];
                try {
                    JointConfigService.paper.clear();
                } catch (error) {
                }
            };
            // dessine les classes
            var drawClasses = function () {
                classes = [];
                for (var i = 0; i < ClassService.classes.length; i++) {
                    classes[i] = uml.Class.create(
                        angular.extend({},
                            JointConfigService.defaultClassParameters,
                            {
                                rect: {
                                    x: ClassService.classes[i].meta.x || 0,
                                    y: ClassService.classes[i].meta.y || 0,
                                    width: 10, height: 200
                                },
                                attributes: $scope.configService.display.showProperties === false ? [] : ClassService.classes[i].properties.map(
                                    function (p) {
                                        return p.value;
                                    }),
                                methods: $scope.configService.display.showMethods === false ? [] : ClassService.classes[i].methods.map(
                                    function (m) {
                                        return m.value;
                                    }),
                                label: ClassService.classes[i].type
                            }));
                    classes[i].id = ClassService.classes[i].id;
                    if (ClassService.classes[i] in SelectionService.selected) {
                        classes[i].yourself().attr({"stroke": "#33B", "stroke-width": 2})

                    }
                    classes[i].yourself().hover(function (e) {
                        this.attr({"stroke": "#3F3FE9", "stroke-width": 2})
                    }, function (e) {
                        this.attr({"stroke": "#000", "stroke-width": 1})
                    });
                }
            };
            // dessine les relations
            var drawRelations = function () {
                relations = [];
                var _relations = ClassService.getAllValidRelations();
                for (var j = 0; j < _relations.length; j++) {
                    var originId = _relations[j].origin;
                    var targetId = _relations[j].target;
                    var origin = getDiagramById(originId);
                    var target = getDiagramById(targetId);
                    relations[j] = origin.joint(
                        target, $.extend({interactive: false}, getArrowConfigFromRelationType(_relations[j].type)));
                }
            }
            // crée le diagramme
            var createDiagram = function () {
                drawClasses();
                drawRelations();
                Joint.addEvent(element.get(0), "mousedown", function (e) {
                    var _class = updateClassMeta(e.target);
                    if (_class != null) {
                        $scope.selectClass(_class);
                    }
                    return true;

                }, true);
                Joint.addEvent(element.get(0), "mouseup", function (e) {
                    var _class = updateClassMeta(e.target);
                    if (_class != null) {
                        //e.target.yourself().attr("stroke", "#00F")
                        $scope.$apply(function () {
                            $scope.selectClass(_class);
                        });
                    }
                });

            };
            var update = function () {
                emptyDiagram();
                createDiagram();
            };
            // point d'entréé
            $timeout(function () {
                uml = Joint.dia.uml;
                classes = [];
                relations = [];
                JointConfigService.paperAttrs.width = element.width();
                JointConfigService.paperAttrs.width = element.height();
                JointConfigService.paper = Joint.paper(element.get(0), element.width(), element.height());
                createDiagram();
                $scope.$watch("selectionService", function () {
                    update();
                });
                $scope.$watch("classService.classes", function () {
                    update();
                }, true);
                $scope.$watch("configService", function () {
                    update();
                }, true);
            }, 0);
        }
    };

});
app.directive('contenteditable', function ContentEditable() {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            // view -> model

            elm.bind('blur', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(elm.text());
                });
            });

            // model -> view
            ctrl.$render = function () {
                elm.text(ctrl.$viewValue);
            };
            elm.text(ctrl.$viewValue);
        }
    };
});

