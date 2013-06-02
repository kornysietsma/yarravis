var mapOptions = {
    center: new google.maps.LatLng(-34.397, 150.644),
    zoom: 13,
    disableDefaultUI: true,
    mapTypeId: google.maps.MapTypeId.TERRAIN
};
var the_map;

$(function() {
    the_map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);
});

var the_tooltip = $("#tooltip");

d3.json("/water.json", function(data) {
    sampsize = data.length;

    ["pH (pH Units)","Temperature - AIR (° C)","Temperature - WATER (° C)","Turbidity - NTU (NTU)"].forEach(function(key) {
        data = assignDefaultValues(data, key);
    });

    var heightfn = function(d) { return d[0].elevation; };
    var key = function(d) { if (d === undefined) debugger; return d[0].elevation; };

    var xScale = 250;
    var yScale = 1;
    var padTop = 100;  // should match css
    var padLR = 40;   // should match css
    var padBot = 50;
    // TODO: calculate maxvalx from running distance

    var seaSpace = 10; // room for sea line

    var
        w = window.innerWidth - (padLR * 2),
        h = window.innerHeight - (padTop + padBot) - 10,
        maxvalx = 1387.5103013400449,
        minvaly = d3.min(data, heightfn),
        maxvaly = d3.max(data, heightfn),
        x = d3.scale.linear().domain([ 0, maxvalx]).range([0, w]),
        y = d3.scale.linear().domain([ minvaly, maxvaly ]).range([h, 0]);

    var svg = d3.select("#yarra-chart")
     .append("svg")
       .attr("class", "box")
       .attr("width", w)
       .attr("height", h + seaSpace + 10);

     var g = svg.append("g")
       .attr("class", "graph");

    g.append("svg:line")
      .attr("class", "sea-level")
      .attr("x1", x(0))
      .attr("x2", x(maxvalx))
      .attr("y1", y(0))
      .attr("y2", y(0));

    g.append("svg:text")
      .attr("class", "label")
      .attr("x", x(0))
      .attr("y", y(0) + seaSpace + 3)
      .text("Sea Level");

      
    g.append("svg:text")
      .attr("class", "label")
      .attr("x", x(0))
      .attr("y", y(0) + seaSpace + 3)
      .text("Sea Level");

    g.append("svg:text")
      .attr("class", "label")
      .attr("x", x(1200))
      .attr("y", y(10))
      .text("PH level");

    g.append("circle")
      .attr("class", "area")
       .attr("cx", x(1190))
       .attr("cy", y(13))
       .attr("r", 10);

    g.append("svg:text")
      .attr("class", "label")
      .attr("x", x(1200))
      .attr("y", y(20))
      .text("Water Temperature");

    g.append("circle")
      .attr("class", "area2")
       .attr("cx", x(1190))
       .attr("cy", y(23))
       .attr("r", 10);

    g.append("svg:text")
      .attr("class", "label")
      .attr("x", x(1200))
      .attr("y", y(30))
      .text("Air Temperature");


    g.append("circle")
      .attr("class", "area3")
       .attr("cx", x(1190))
       .attr("cy", y(33))
       .attr("r", 10);

   var dy = function(site){
     return Math.random() * 50;
   };

   var distanceBtwPoints = function(x1, y1, x2, y2){
     var dx = (x2 - x1);
     var dy = (y2 - y1);
     
     return Math.sqrt(Math.pow(dx,2), Math.pow(dy,2));
   };

   var addDistances = function(dataPoints){
     var runningX = 0;

     for(var i=0; i<dataPoints.length; i++){
       var d = dataPoints[i];

       var x1 = d[0].Latitude;
       var y1 = d[0].Longitude;
       var x2 = d[1].Latitude;
       var y2 = d[1].Longitude;
       var dxy = distanceBtwPoints(x1,y1,x2,y2) * xScale;

       d[0].distance = runningX;
       d[1].distance = runningX + dxy; 

       runningX += dxy;
     }
   };

   var line = d3.svg.line()
              .x(function(d) {return x(d.distance);})
              .y(function(d) {return y(d.elevation);});

              
    var hover = function(data) {
        var circle = d3.select(this)[0][0];
        var lat = data[0]["Latitude"];
        var long = data[0]["Longitude"];
        console.log(circle);
        var xPosition = parseFloat(circle.getAttribute("cx"));
        var guessedWidth = the_tooltip.width() + 12;
        if (xPosition + guessedWidth > window.innerWidth) {
            xPosition = window.innerWidth - guessedWidth;
        }
        var yPosition = parseFloat(circle.getAttribute("cy")) + 80;
        var guessedHeight = the_tooltip.height() + 60;
        if (yPosition + guessedHeight > window.innerHeight) {
            yPosition = window.innerHeight - guessedHeight;
        }
        console.log("moving hover to", xPosition, yPosition);

        d3.select("#tooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .select("#value")
            .text(data[0]["Site Name"]);
        the_map.setCenter(new google.maps.LatLng(lat,long));
        d3.select("#tooltip").classed("hidden", false);
        google.maps.event.trigger(the_map, "resize");
    };
     var hoverOff = function(data) {
         console.log("unhovering");
         d3.select("#tooltip").classed("hidden", true);
     };

   var riverLines = function(node){
     node.selectAll("path.river")
         .data(data).enter()
         .append("path")
          .attr("d", line)
          .attr("class", "river");
   };


    var subcatchment = function(d) {
        return d["Sub Catchment"];
    };

   var sitePoints = function(node){
    node.selectAll("circle.site")
       .data(data).enter()
       .append("circle")
        .on("mouseover", hover)
        .on("mouseout", hoverOff)
         .attr("class", function(d) {return "site " + d[0]["Sub Catchment"];})
         .attr("cx", function(d) {return x(d[0].distance);})
         .attr("cy", function(d) {return y(d[0].elevation);})
         .attr("r", 5);
   };  

    var ph = function(d) {
        return d["pH (pH Units)"] * 4;
    };

    var airtemp = function(d) {
        return d["Temperature - AIR (° C)"] * 4;
    };

    var watertemp = function(d) {
        return d["Temperature - WATER (° C)"] * 4;
    };

    var turbidity = function(d) {
        return d["Turbidity - NTU (NTU)"] * 3;
    };

  var stacks = [
      {func: ph, class: "area"},
      {func: watertemp, class: "area2"},
      {func: airtemp, class: "area3"},
      {func: turbidity, class: "turbidity"}
  ];

  stacks.forEach(function(stack, ix) {
      stack.prevfns = [];

      for (var j = 0; j < ix; j++) {
          stack.prevfns.push(stacks[j].func);
      }
      stack.y0fn = function(d) {
          var y_result = d.elevation;
          stack.prevfns.forEach(function (fn) {
              y_result = y_result + fn(d);
          });
          return y(y_result);
      };
      stack.y1fn = function(d) {
          var y_result = d.elevation;
          stack.prevfns.forEach(function (fn) {
              y_result = y_result + fn(d);
          });
          y_result = y_result + stack.func(d);
          return y(y_result);
      };

      stack.area = d3.svg.area()
          .x(function(d)  {return x(d.distance);})
          .y0(stack.y0fn)
          .y1(stack.y1fn)
          .interpolate("linear");
  });

    addDistances(data);
    stacks.forEach(function(stack) {
        g.selectAll("path." + stack["class"])
            .data(data).enter()
            .append("path")
            .attr("d", stack.area)
            .attr("class", stack["class"]);
    });
//  riverLines(g);
  sitePoints(g);
});

function assignDefaultValues( dataset, value )
{
    var newData = [];
    var previousValue = "0";
    for(var i = 0 ; i < dataset.length ; ++i){
      if(dataset[i][0][value] === ""){
        dataset[i][0][value] = previousValue;
      }
      if(dataset[i][1][value] === ""){
        dataset[i][1][value] = previousValue;
      }
      newData.push(dataset[i]);
      previousValue = dataset[i][0][value];
    }
      
    return newData;
}

