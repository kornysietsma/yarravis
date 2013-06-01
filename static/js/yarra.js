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
       .attr("width", w * 5)
       .attr("height", h * 2)
     .append("svg:g")
       .attr("transform", "translate(" + 20 + "," + 300 + ")");

    console.log("Sample size: " + sampsize);

    svg.selectAll(".line")
      .data(data).enter()
      .append("svg:line")
        .attr("class", "river")
        .attr("stroke", "black")
        .attr("x1", function(d) { return d[0].distance * xScale;})
        .attr("x2", function(d) { return d[1].distance * xScale;})
        .attr("y1", function(d) { return d[0].height * yScale * -1;})
        .attr("y2", function(d) { return d[1].height * yScale * -1;});
});
