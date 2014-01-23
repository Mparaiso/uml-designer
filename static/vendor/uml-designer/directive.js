var zoomable = {
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
    }
}

var collapsr = function (scope, element, attrs) {
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

var ClassController = function ($scope, ClassService, HelpService) {
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
}

var umlClass = function ($log, $timeout, ClassService) {
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
}
