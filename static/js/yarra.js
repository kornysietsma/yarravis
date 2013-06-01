d3.json("/yarra.json", function(data) {
    sampsize = data.length;

    var heightfn = function(d) { return d.height; };
    var key = function(d) { console.log(d); if (d === undefined) debugger; return d.id; };

    var scale = 3;

    var w = 4850 ,
        h = 323,
        p = 20,
        maxvalx = d3.max(data, key),
        minvaly = d3.min(data, heightfn),
        maxvaly = d3.max(data, heightfn),
        x = d3.scale.linear().domain([ 0, maxvalx]).range([0, w]),
        y = d3.scale.linear().domain([ minvaly, maxvaly ]).range([h, 0]);

    var svg = d3.select("#yarra-chart")
     .append("svg:svg")
       .attr("width", w + p * 2)
       .attr("height", h + p * 2)
     .append("svg:g")
       .attr("transform", "translate(" + p + "," + p + ")");

    console.log("Sample size: " + sampsize);

    svg.selectAll(".line")
      .data(data).enter()
      .append("svg:line")
        .attr("class", "river")
        .attr("stroke", "black")
        .attr("x1", function(d) { return d[0].distance;})
        .attr("x2", function(d) { return d[1].distance;})
        .attr("y1", function(d) { return d[0].height;})
        .attr("y2", function(d) { return d[1].height;});
});
