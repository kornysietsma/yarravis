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

d3.json("/water.json", function(data) {
    sampsize = data.length;

    data = assignDefaultValues(data, "pH (pH Units)");

    var heightfn = function(d) { return d[0].elevation; };
    var key = function(d) { if (d === undefined) debugger; return d[0].elevation; };

    var xScale = 250;
    var yScale = 1;
    var padTop = 50;  // should match css
    var padLR = 40;   // should match css
    var padBot = 50;
    // TODO: calculate maxvalx from running distance

    var
        w = window.innerWidth - (padLR * 2),
        h = window.innerHeight - (padTop + padBot),
        maxvalx = 1387.5103013400449,
        minvaly = d3.min(data, heightfn),
        maxvaly = d3.max(data, heightfn),
        x = d3.scale.linear().domain([ 0, maxvalx]).range([0, w]),
        y = d3.scale.linear().domain([ minvaly, maxvaly ]).range([h, 0]);

    var svg = d3.select("#yarra-chart")
     .append("svg")
       .attr("class", "box")
       .attr("width", w)
       .attr("height", h);

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
      .attr("y", y(-10))
      .text("Sea Level");

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
        var yPosition = parseFloat(circle.getAttribute("cy")) + h;
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


   var sitePoints = function(node){
    node.selectAll("circle.site")
       .data(data).enter()
       .append("circle")
        .on("mouseover", hover)
        .on("mouseout", hoverOff)
         .attr("class", "site")
         .attr("cx", function(d) {return x(d[0].distance);})
         .attr("cy", function(d) {return y(d[0].elevation);})
         .attr("r", 5);
   };  

   var area = d3.svg.area()
                .x(function(d)  {return x(d.distance);})
                .y0(function(d) {return y(d.elevation)})
                .y1(function(d) {return y((d.elevation + (d["pH (pH Units)"] * 4)));})
                .interpolate("linear");

   var areas = function(node){
     node.selectAll("path.area")
        .data(data).enter()
        .append("path")
        .attr("d", area)
        .attr("class", "area");
   };

  addDistances(data);
  areas(g);
  riverLines(g);
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

