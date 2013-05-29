### this is a copy script file ###


classInstance =
    "type":"ClassDefinition"
    "fields":
        "public": [
        ]
        "private": [
        ]
    "methods":
        "public": [
        ]
        "private": [
        ]


main = document.getElementById("main")

paper = Raphael(main, 320, 200);

circle = paper.circle(50, 40, 10);

circle.attr("fill", "#f00");

circle.attr('stroke', "#fff");

buildClassRepresentation = (paper)->
