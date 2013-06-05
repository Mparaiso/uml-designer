<!doctype html>
<html lang="en-US" ng-app="UmlDesigner">
<head>
    <meta charset="UTF-8">
    <title>UML DESIGNER</title>
    <link href='http://fonts.googleapis.com/css?family=Ubuntu+Mono:400,700' rel='stylesheet' type='text/css'>
    <link rel="stylesheet/less" type="text/css" href="static/css/uml-designer.less"/>
    <script type="text/javascript" src="static/js/less.min.js"></script>
    <script type="text/javascript" src='static/js/jquery.min.js'></script>
    <script type="text/javascript" src="static/vendor/joint/lib/raphael.js"></script>
    <script type="text/javascript" src="static/vendor/canvg/rgbcolor.js"></script>
    <script type="text/javascript">
        if(typeof(CanvasRenderingContext2D )!== "undefined" ){
        document.write('<script type="text/javascript" src="static/vendor/canvg/canvg.js"><\/script>');
        }
    </script>
    <script type="text/javascript" src="static/vendor/joint/src/joint.js"></script>
    <script type="text/javascript" src="static/vendor/joint/src/joint.arrows.js"></script>
    <script type="text/javascript" src="static/vendor/joint/src/joint.dia.js"></script>
    <script type="text/javascript" src="static/vendor/joint/src/joint.dia.uml.js"></script>
    <script type="text/javascript" src="static/js/angular.min.js"></script>
    <script type="text/javascript" src="static/vendor/uml-designer/uml-designer.js"></script>
</head>
<body>
<div class="container">
    <div id="main">
        <h2>UML Designer
            <small>by mparaiso</small>
        </h2>
        <form class='uml-interface' ng-controller="MenuController">
            <input type="button" value="Add class" id="add-class" name="add-class" ng-click="add()"/>
            <input type="button" value="Delete selected" name="delete-class" id="delete-class"
                   ng-click="delete()"/>
            <input type="button" value="Delete all" ng-click="deleteAll()"/>
            <!--<input type="button" value="Inverse Selection" ng-click='inverseSelection()'/>-->
            <!--<input type="button" value="Toggle Methods" ng-click='toggleMethods()'/>-->
            <!--<input type="button" value="Toggle Properties" ng-click='toggleProperties()'/>-->
            <!--<input type="button" value="Zoom +" ng-click='zoom(0.1)'/>-->
            <!--<input type="button" value="Zoom -" ng-click='zoom(-0.1)'/>-->
            <!--<input type="button" value="Reset zoom" ng-click='zoomReset()'/>-->
            <input type="button" value="Export as an image" ng-click="export()"/>
        </form>
        <div class="separator"></div>

        <div ng-controller="CanvasController" class="uml-left">
            <div id="uml-canvas" class="uml-canvas uml-float-none"
                 data-uml-class-diagram>
            </div>
        </div>
        <div ng-controller="ClassEditController" class="uml-right">
            <div ng-include="'class-edit-partial.html'"></div>
        </div>
    </div>
</div>
</div>
<!-- templates -->
<!-- class edit partial -->
<script type="text/ng-template" id="class-edit-partial.html">
    <h4>Layers</h4>
    <select name="object-layer" size="4" style="width:100%;border:1px solid gray;"
            ng-model="selectionService.lastSelected" id="object-layer"
            ng-options="c as c.type for c in classService.classes"></select>

    <div class="uml-class-edit" ng-show="selectionService.lastSelected!=null">
        <h3 contenteditable="true" ng-model="selectionService.lastSelected.type"></h3>

        <h4>Properties</h4>

        <div ng-repeat="prop in selectionService.lastSelected.properties">
            <div spellcheck='false' class="input-text" contenteditable="true" ng-model="prop.value"></div>
            <input type="button" value="-" ng-click="removeProperty(selectionService.lastSelected,prop)"/>
        </div>
        <div>
            <input type="button" value="Add property" ng-click="addProperty(selectionService.lastSelected)"/>
        </div>

        <h4>Methods</h4>

        <div spellcheck='false' ng-repeat="meth in selectionService.lastSelected.methods">
            <div class="input-text" contenteditable="true" ng-model="meth.value"></div>
            <input type="button" value="-" ng-click="removeMethod(selectionService.lastSelected,meth)"/>
        </div>
        <div>
            <input type="button" value="Add method" ng-click="addMethod(selectionService.lastSelected)"/>
        </div>
        <h4>Relationships</h4>

        <div>
            <input type="button" value="Add relationship"
                   ng-click="addRelationShip(selectionService.lastSelected)"/>
        </div>
        <div class='separator'></div>
        <!-- relationships -->
        <div ng-repeat="rel in selectionService.lastSelected.relations">
            <label for="rel-type-{{$index}}">Type</label>
            <select ng-model="rel.type"
                    id="rel-type-{{$index}}"
                    ng-options="t.value as t.label for t in relationService.types">
            </select>
            <br>
            <label for="rel-target-{{$index}}">Target</label>
            <select ng-model="rel.target"
                    id="rel-target-{{$index}}"
                    ng-options="c.id as c.type for c in classService.classes">
            </select>
            <br>
            <input type="button" value="Remove relationship"
                   ng-click="removeRelationShip(selectionService.lastSelected,rel)"/>

            <div class='separator'></di>
            </div>
        </div>
    </div>
    <div class="separator"></div>

    <!--<div ng-repeat="class in classService.classes">-->
    <!--<a href="#" ng-click="selectClass(class)">{{class.type}}</a>-->
    <!--</div>-->
</script>
</body>
</html>