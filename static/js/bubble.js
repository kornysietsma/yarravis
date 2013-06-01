
d3.json("/bubble.json", function(data) { 
    /* Read JSON data file: first row =>  state,murder,forcible_rape,robbery,aggravated_assault,burglary,larceny_theft,motor_vehicle_theft,population,pop100k,state_type  */
    var maxvalx = 0, minvalx = 1000000,
        maxvaly = 0, minvaly = 1000000,
        sampsize = 0;
    var label_array = new Array(),
        val_array = new Array();

    sampsize = data.length;

    for (var i=0; i < sampsize; i++) {
       label_array[i] = data[i].state;
       val_array[i] = { label: label_array[i], x: parseFloat(data[i].murder), y: parseFloat(data[i].burglary), size: parseFloat(data[i].pop100k), color: data[i].state_type  };
       maxvalx = Math.max(maxvalx, parseFloat(data[i].murder) );
       maxvaly = Math.max(maxvaly, parseFloat(data[i].burglary) );
       minvalx = Math.min(minvalx, parseFloat(data[i].murder) );
       minvaly = Math.min(minvaly, parseFloat(data[i].burglary) );
       //document.write('<p>Label: ' + label_array[i] + '</p>');
     }

     maxvalx = (1 + Math.floor(maxvalx / 10)) * 10;   
     maxvaly = (10 + Math.floor(maxvaly / 10)) * 10;
     minvalx = (Math.floor(minvalx / 10)) * 10;   
     minvaly = (Math.floor(minvaly / 10)) * 10 - 100; 
     //document.write('<p>Max X: ' + minvalx + '</p>'); 
     //document.write('<p>Max Y: ' + minvaly + '</p>');


   
    var w = 815,
        h = 500,
        p = 80,
        x = d3.scale.linear().domain([ 0, maxvalx]).range([0, w]),
        y = d3.scale.linear().domain([ minvaly, maxvaly ]).range([h, 0]);

    var vis = d3.select("#scatter-bubble-chart")
       .data([val_array])
     .append("svg:svg")
       .attr("width", w + p * 2)
       .attr("height", h + p * 2)
     .append("svg:g")
       .attr("transform", "translate(" + p + "," + p + ")");


    var rules = vis.selectAll("g.rule")
      .data(x.ticks(10))
     .enter().append("svg:g")
       .attr("class", "rule");

   // Draw grid lines
   rules.append("svg:line")
    .attr("x1", x)
    .attr("x2", x)
    .attr("y1", 0)
    .attr("y2", h - 1);

   rules.append("svg:line")
    .attr("class", function(d) { return d ? null : "axis"; })
    .data(y.ticks(10))
    .attr("y1", y)
    .attr("y2", y)
    .attr("x1", 0)
    .attr("x2", w - 10);

   // Place axis tick labels
   rules.append("svg:text")
    .attr("x", x)
    .attr("y", h + 15)
    .attr("dy", ".71em")
    .attr("text-anchor", "middle")
    .text(x.tickFormat(10))
    .text(String);

   rules.append("svg:text")
    .data(y.ticks(12))
    .attr("y", y)
    .attr("x", -10)
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .text(y.tickFormat(5));


    // Draw xy scatterplot
    vis.selectAll("circle.line")
       .data(val_array)
     .enter().append("svg:circle")
       .attr("class", "line")
       .attr("fill", function(d) { return d.color; } )
       .attr("cx", function(d) { return x(d.x); })
       .attr("cy", function(d) { return y(d.y) - 5; })
       .attr("r", function(d) { return Math.sqrt( 5*d.size / Math.PI); });

    // add bubble labels: in two steps
    vis.selectAll("g.rule")
        .data(val_array)
      .append("svg:text")
         .attr("text-anchor", "middle")
         .attr("x", function(d) { return x(d.x); })
         .attr("y", function(d) { return y(d.y) + Math.sqrt( 5*d.size / Math.PI) + 4; })
         .attr("dy", ".3em")
         .attr("fill", "black")
         .attr("clip", "inherit")
         .text(function(d) { return d.label; });

     vis.selectAll("g.rule")
        .data(val_array)
       .enter().append("svg:text")
         .attr("text-anchor", "middle")
         .attr("x", function(d) { return x(d.x); })
         .attr("y", function(d) { return y(d.y) + Math.sqrt( 5*d.size / Math.PI) + 4; })
         .attr("dy", ".3em")
         .attr("fill", "black")
         .attr("clip", "inherit")
         .text(function(d) { return d.label; });

     
});
