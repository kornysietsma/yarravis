d3.json("/yarra.json", function(data) {
    sampsize = data.length;

    var heightfn = function(d) { return d.height; };
    var key = function(d) { console.log(d); if (d === undefined) debugger; return d.id; };

    var scale = 3;

    var w = 485 ,
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


    var line = d3.svg.line()
               .interpolate("basis")
               .x(function(d) { return x(d.distance); })
               .y(function(d) { return y(d.height); });
    

    svg.selectAll(".line")
      .data(data,key).enter()
      .append("svg:line")
        .attr("stroke", "black")
        .attr("x1", function(d) { return x(d.distance); })
        .attr("x2", function(d) { return x(d.distance + 10); })
        .attr("y1", function(d) { return y(d.height); })
        .attr("y2", function(d) { return y(d.height + 10); });
});
