d3.json("/yarra.json", function(data) {
    sampsize = data.length;

    var heightfn = function(d) { return d.height; };
    var key = function(d) { console.log(d); if (d === undefined) debugger; return d.id; };

    var xScale = 10;
    var yScale = 1;

    var w = 485,
        h = 323,
        maxvalx = d3.max(data, key),
        minvaly = d3.min(data, heightfn),
        maxvaly = d3.max(data, heightfn),
        x = d3.scale.linear().domain([ 0, maxvalx]).range([0, w]),
        y = d3.scale.linear().domain([ minvaly, maxvaly ]).range([h, 0]);

    var svg = d3.select("#yarra-chart")
     .append("svg:svg")
       .attr("class", "box")
       .attr("height", h * 2)
     .append("svg:g")
       .attr("transform", "translate(" + 100 + "," + 300 + ")");

    console.log("Sample size: " + sampsize);

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

    svg.selectAll(".nothing")
      .data(data).enter()
      .append("svg:line")
        .attr("class", "river")
        .attr("x1", function(d) { return d[0].distance * xScale;})
        .attr("x2", function(d) { return d[1].distance * xScale;})
        .attr("y1", function(d) { return d[0].height * yScale * -1;})
        .attr("y2", function(d) { return d[1].height * yScale * -1;});

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
   };

   var getX = function(site, mod){
     return (site.distance * xScale) + mod;
   };

   var dy = function(site){
     return site.location.length * 10;
   };

   svg.selectAll(".nothing")
    .data(data).enter()
    .append("svg:polygon")
    .attr("points", function(d) {return getX(d[0], 0) + "," + getY(d[0], 0)     + " " +
                                        getX(d[0], 0) + "," + getY(d[0], dy(d[0])) + " " +
                                        getX(d[1], 0) + "," + getY(d[1], dy(d[1])) + " " +
                                        getX(d[1], 0) + "," + getY(d[1], 0);});
       
});
