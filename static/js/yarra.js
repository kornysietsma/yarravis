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
     .append("svg:svg")
       .attr("class", "box")
       .attr("width", w)
       .attr("height", h)
     .append("svg:g")
       .attr("transform", "translate(" + 100 + "," + 300 + ")");

    svg.append("svg:line")
      .attr("class", "sea-level")
      .attr("x1", -10)
      .attr("x2", w * 2)
      .attr("y1", 0)
      .attr("y2", 0);

    svg.append("svg:text")
      .attr("class", "label")
      .attr("x", -70)
      .attr("y", 3)
      .text("Sea Level");


<<<<<<< HEAD
    svg.selectAll(".nothing")
      .data(data).enter()
      .append("svg:circle")
        .attr("class", "site")
        .attr("x", function(d) { return d[0].distance * xScale; })
        .attr("y", function(d) { return d[0].height * yScale * -1 - 5;})
        .attr("width", 10)
        .attr("height", 10);


//    svg.selectAll(".nothing")
//      .data(data).enter()
//      .append("svg:text")
//        .attr("class", "site-label")
//        .attr("x", function(d) { return d[0].distance * xScale; })
//        .attr("y", function(d) { return d[0].height * yScale * -1 - 15;})
//        .text(function(d) { return d[0].location; })
//        .attr("transform", "rotate(-5)");
        

   var getY = function(site, mod) {
     return (site.height * yScale + mod) * -1;
=======
   var convertY = function(site, offset) {
     return (site.elevation * yScale + offset) * -1;
>>>>>>> b4e7e74d7d3d6afff1ee7cedcae131b8b81dd12c
   };

   var dy = function(site){
     return site["pH (pH Units)"] * 10;
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

   var riverLines = function(node){
     node.selectAll(".nothing")
         .data(data).enter()
         .append("svg:line")
          .attr("class", "river")
          .attr("x1", function(d) {return d[0].distance;})
          .attr("x2", function(d) {return d[1].distance;})
          .attr("y1", function(d) {return convertY(d[0], 0);})
          .attr("y2", function(d) {return convertY(d[1], 0);});
   };

   var sitePoints = function(node){
    svg.selectAll(".nothing")
       .data(data).enter()
       .append("svg:circle")
         .attr("class", "site")
         .attr("cx", function(d) {return d[0].distance;})
         .attr("cy", function(d) {return convertY(d[0], 0);})
         .attr("r", 5);
   };  

   var areas = function(node){
     svg.selectAll(".nothing")
        .data(data).enter()
        .append("svg:polygon")
        .attr("points", function(d) {
              return d[0].distance + "," + convertY(d[0], 0) + " " +
                     d[0].distance + "," + convertY(d[0], dy(d[0])) + " " +
                     d[1].distance + "," + convertY(d[1], dy(d[1])) + " " +
                     d[1].distance + "," + convertY(d[1], 0);
        });
   };

  addDistances(data);
  riverLines(svg);
  sitePoints(svg);
  areas(svg);
});
