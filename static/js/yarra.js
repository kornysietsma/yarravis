d3.json("/water.json", function(data) {
    sampsize = data.length;

    var heightfn = function(d) { return d.height; };
    var key = function(d) { console.log(d); if (d === undefined) debugger; return d.id; };

    var xScale = 250;
    var yScale = 1;

    var w = 1024,
        h = 800,
        maxvalx = d3.max(data, key),
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
       .attr("class", "graph")
       .attr("transform", "translate(" + 100 + "," + 700 + ")");

    g.append("svg:line")
      .attr("class", "sea-level")
      .attr("x1", -10)
      .attr("x2", w * 2)
      .attr("y1", 0)
      .attr("y2", 0);

    g.append("svg:text")
      .attr("class", "label")
      .attr("x", -70)
      .attr("y", 3)
      .text("Sea Level");


   var convertY = function(site, offset) {
     return (site.elevation * yScale + offset) * -1;
   };

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
              .x(function(d) {return d.distance;})
              .y(function(d) {return convertY(d,0);});

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
         .attr("class", "site")
         .attr("cx", function(d) {return d[0].distance;})
         .attr("cy", function(d) {return convertY(d[0],0);})
         .attr("r", 5);
   };  

   var area = d3.svg.area()
                .x(function(d)  {return d.distance;})
                .y0(function(d) {return d.elevation * -1})
                .y1(function(d) {return (d.elevation + (d["pH (pH Units)"] * 4)) * -1;})
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
