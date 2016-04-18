d3.json("data.json", function(data) {
    console.log(data)

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        //.html(function(d) { return 'charity: ' + '<span>' + d.name + '</span>' + '<br>' + '<span>' +'$'+ d.value + '</span>' + ' raised' + '<br>' + d.category })
        //.html(function(d) { return d.name; })
        .html(function(d) { return 'name: ' + '<span>' + d.name + '</span>' + '<br>' + d.region + '<br>' + d.category + '<br>' + d.month})
        .offset([-12, 0]);

    var buttonAll = d3.select("#buttons")
        .append("input")
        //.attr("class", "btn btn-large btn-block btn-primary")
        //.attr("class", "btn btn-xs btn-info")
        .attr("class", "button")
        .attr("id", "button_all")
        .attr("type","button")
        .attr("value", "All Names");

    var buttonWeekly = d3.select("#buttons")
        .append("input")
        //.attr("class", "btn btn-default btn-xs")
        .attr("class", "button")
        .attr("id", "button_weekly")
        .attr("type","button")
        .attr("value", "Generations");

    var buttonCategory = d3.select("#buttons")
        .append("input")
        //.attr("class", "btn btn-xs")
        .attr("class", "button")
        .attr("id", "button_category")
        .attr("type","button")
        .attr("value", "Regions");

    var buttonTime = d3.select("#buttons")
        .append("input")
        //.attr("class", "btn btn-xs")
        .attr("class", "button")
        .attr("id", "button_time")
        .attr("type","button")
        .attr("value", "Time of Workouts");

    var width = 1000,
    	height = 550,
    	layout_gravity = -0.01,
    	damper = 0.1,
    	nodes = [],
    	vis, force, circles, radius_scale;

    var center = {x: width / 2, y: height / 2};

    var center_all = {x: 450, y: 250};

    var month_centers = {
        "GI Generation": {x: 175, y: 175},
        "Silent Generation": {x: 425, y: 175},
        "Baby Boomers": {x: 670, y: 175},
        "Generation X": {x: 175, y: 400},
        "Millenials": {x: 425, y: 400},
        "Generation Z": {x: 670, y: 400}
    };

    var category_centers = {
        "Northeast": {x: 200, y: 175},
        "Southeast": {x: 450, y: 175},
        "Southwest": {x: 680, y: 175},
        "Midwest": {x: 325, y: 400},
        "West": {x: 575, y: 400}
    };

    var time_centers = {
        "M": {x: 200, y: 250},
        "F": {x: 700, y: 250}
    };

    var decade_centers = {
        "The Tens": {},
        "Roaring Twenties": {x: 175, y: 175},
        "Threadbare Thirties": {x: 425, y: 175},
        "Flying Forties": {x: 670, y: 175},
        "Fabulous Fifties": {x: 140, y: 400},
        "Swingin' Sixties": {x: 350, y: 400},
        "Disco Era": {x: 525, y: 400},
        "Greedy Eighties": {x: 140, y: 400},
        "the Nineties": {x: 350, y: 400},
        "the 2000s": {x: 525, y: 400}
    }

    var fill_color = d3.scale.ordinal()
    	.domain(["core & abs", "stretch & yoga", "chest, shoulder & triceps", "back and biceps", "legs"])
    	.range(["#85144b","#14898a", "black", "#ddd", "#144b85",]);

    //var max_amount = d3.max(data, function(d) {return parseInt(d.donation, 10); });
    var max_amount = d3.max(data, function(d) {return d.Occurrence;});

    //var radius_scale = d3.scale.pow().exponent(0.5)
    var radius_scale = d3.scale.linear()
    	.domain([0, max_amount])
    	.range([2, 30]);

    data.forEach(function(d) {
    	node = {
    		id: d.Name,
            date: d.date,
            gender: d.Max_Gender,
    		radius: radius_scale(parseInt(d.Occurrence, 10)),
            //radius: 6,
            value: d.Occurrence,
    		name: d.Name,
    		//group: d.group,
    		//year: d.start_year,
    		x: Math.random() * 900,
    		y: Math.random() * 800,
            region: d.Region,
            //meetup: d.event_id,
            time: d.Decade,
            month: d.Generation,
            category: d.Max_Gender
    	};
    	nodes.push(node);
    });

    nodes.sort(function(a,b) {return b.value - a.value; });

    vis = d3.select("#vis").append("svg")
        .attr('width', width)
        .attr('height', height)
        .attr('id', 'svg_vis');

    var pone = vis.call(tip);

    circles = vis.selectAll('circle')
    	.data(nodes, function(d) {return d.id; });

    circles.enter()
    	.append('circle')
    	.attr('r', function(d) {return d.radius})
    	.attr('fill', function(d) {return fill_color(d.category); })
    	.attr('stroke-width', 2)
    	.attr('stroke', function(d) {return d3.rgb(fill_color(d.category)).darker(); });

    //circles.on("mouseover", myMouseOverFunction)

    /*
    circles.on("mouseover", function(d) {
        var circle = d3.select(this);
            //circle.attr("stroke", "red");
            if (d.id == 1) {
                return circle.attr("stroke", "red")}
             //   else {return "yellow"}
    })
        .on("mouseout", myMouseOutFunction);
    */

    function charge(d) {
    	return -Math.pow(d.radius * 4, 2.0) / 60;
        //return -Math.pow(50, 2.0) / 60;
    }

    force = d3.layout.force()
    	.nodes(nodes)
    	.size([width, height]);

    circles.call(force.drag);

    force.gravity(-0.01)
    	.charge(charge)
    	.friction(0.9)
    	.on('tick', function(e) {
    			force.nodes().forEach(function(d) {
                    //var target = center
                    var target = month_centers[d.month]
    				d.x = d.x + (target.x - d.x) * (damper + 0.02) * e.alpha;
    				d.y = d.y + (target.y - d.y) * (damper + 0.02) * e.alpha;
    			})
    			vis.selectAll('circle')
    				.attr('cx', function(d) {return d.x;})
    				.attr('cy', function(d) {return d.y;});
    	});

    //column labeling
    var meetups_x = {"GI Generation": 200 - 100, "Silent Generation": 430 - 20, "Baby Boomers": 720, "Generation X": 200 - 100, "Millenials": 430, "Generation Z": 720};
    var meetups_y = {"GI Generation": 60, "Silent Generation": 50, "Baby Boomers": 50, "Generation X": 320, "Millenials": 320, "Generation Z": 320};
    var meetups_x_data = d3.keys(meetups_x)
    //var meetups_y_data = d3.keys(meetups_y)
    var columnlabels = vis.selectAll("body")
        .data(meetups_x_data);

    columnlabels.enter().append("text")
        .attr("class", "years")
        .attr("x", function(d) { return meetups_x[d]; })
        .attr("y", function(d) { return meetups_y[d]; })
        .attr("text-anchor", "middle")
        .text(function(d) { return d; });

    //start
    force.start();

    //first button, show all weeks together
    buttonAll
        .on("click", function() {
            force//.gravity(-0.01)
            //.charge(charge)
            //.friction(0.9)
            .on('tick', function(e) {
                    force.nodes().forEach(function(d) {
                        var target = center_all
                        //var target = meetup_centers[d.meetup]
                        d.x = d.x + (target.x - d.x) * (damper + 0.02) * e.alpha;
                        d.y = d.y + (target.y - d.y) * (damper + 0.02) * e.alpha;
                    })
                    vis.selectAll('circle')
                        .attr('cx', function(d) {return d.x;})
                        .attr('cy', function(d) {return d.y;});
            });

            //hide years
            vis.selectAll(".years").remove();
            //vis.selectAll(".years").transition().duration(1000).remove();
            //hide rows
            vis.selectAll(".rows").remove();

            //labels
            var meetups_x = {"All Names": width / 2 - 60};
            var meetups_y = {"All Names": 50};
            var meetups_x_data = d3.keys(meetups_x)
            //var meetups_y_data = d3.keys(meetups_y)
            var columnlabels = vis.selectAll("body")
                .data(meetups_x_data);

            columnlabels.enter().append("text")
                .attr("class", "years")
                .attr("x", function(d) { return meetups_x[d]; })
                .attr("y", function(d) { return meetups_y[d]; })
                .attr("text-anchor", "middle")
                .text(function(d) { return d; });

            //start
            force.start();
        })

    //second button, break up by week
    buttonWeekly
        .on("click", function() {
            force//.gravity(-0.01)
            //.charge(charge)
            //.friction(0.9)
            .on('tick', function(e) {
                force.nodes().forEach(function(d) {
                    //var target = center
                    var target = month_centers[d.month]
                    d.x = d.x + (target.x - d.x) * (damper + 0.02) * e.alpha;
                    d.y = d.y + (target.y - d.y) * (damper + 0.02) * e.alpha;
                })
                vis.selectAll('circle')
                    .attr('cx', function(d) {return d.x;})
                    .attr('cy', function(d) {return d.y;});
        });

            //hide years
            vis.selectAll(".years").remove();
            //vis.selectAll(".years").transition().duration(1000).remove();
            //hide rows
            vis.selectAll(".rows").remove();

            //column labeling
    var meetups_x = {"M": 200 - 75, "Tu": 430 - 20, "W": 700, "Th": 140 - 50, "F": 325, "Sa": 523, "Su": 750};
    var meetups_y = {"M": 60, "Tu": 50, "W": 50, "Th": 320, "F": 320, "Sa": 320, "Su": 320};
            var meetups_x_data = d3.keys(meetups_x)
            //var meetups_y_data = d3.keys(meetups_y)
            var columnlabels = vis.selectAll("body")
                .data(meetups_x_data);

            columnlabels.enter().append("text")
                .attr("class", "years")
                .attr("x", function(d) { return meetups_x[d]; })
                .attr("y", function(d) { return meetups_y[d]; })
                .attr("text-anchor", "middle")
                .text(function(d) { return d; });
            //start
            force.start();
        }) //end of buttonWeekly

    //third button, break up by category
    buttonCategory
        .on("click", function() {
            force//.gravity(-0.01)
            //.charge(charge)
            //.friction(0.9)
            .on('tick', function(e) {
                force.nodes().forEach(function(d) {
                    //var target = center
                    var target = category_centers[d.region]
                    d.x = d.x + (target.x - d.x) * (damper + 0.02) * e.alpha;
                    d.y = d.y + (target.y - d.y) * (damper + 0.02) * e.alpha;
                })
                vis.selectAll('circle')
                    .attr('cx', function(d) {return d.x;})
                    .attr('cy', function(d) {return d.y;});
        });

            //hide years
            vis.selectAll(".years").remove();
            //vis.selectAll(".years").transition().duration(1000).remove();
            //hide rows
            vis.selectAll(".rows").remove();

            //column labeling
            var meetups_x = {"Northeast": 200 - 55, 
                            "Southeast": 450 - 10, 
                            "Southwest": 710, 
                            "Midwest": 300, 
                            "West": 590};

            var meetups_y = {"Northeast": 165 - 90, 
                            "Southeast": 165 - 90, 
                            "Southwest": 165 - 90, 
                            "Midwest": 400 - 60, 
                            "West": 400 - 60};

            var meetups_x_data = d3.keys(meetups_x)
            //var meetups_y_data = d3.keys(meetups_y)
            var columnlabels = vis.selectAll("body")
                .data(meetups_x_data);

            columnlabels.enter().append("text")
                .attr("class", "years")
                .attr("x", function(d) { return meetups_x[d]; })
                .attr("y", function(d) { return meetups_y[d]; })
                .attr("text-anchor", "middle")
                .text(function(d) { return d; });
            //start
            force.start();
        }) //end of buttonWeekly

    //fourth button, break up by time of day
    buttonTime
        .on("click", function() {
            force//.gravity(-0.01)
            //.charge(charge)
            //.friction(0.9)
            .on('tick', function(e) {
                force.nodes().forEach(function(d) {
                    //var target = center
                    var target = time_centers[d.time]
                    d.x = d.x + (target.x - d.x) * (damper + 0.02) * e.alpha;
                    d.y = d.y + (target.y - d.y) * (damper + 0.02) * e.alpha;
                })
                vis.selectAll('circle')
                    .attr('cx', function(d) {return d.x;})
                    .attr('cy', function(d) {return d.y;});
        });

            //hide years
            vis.selectAll(".years").remove();
            //vis.selectAll(".years").transition().duration(1000).remove();
            //hide rows
            vis.selectAll(".rows").remove();

            //column labeling
            var meetups_x = {"AM": 160, 
                            "Lunch": 460, 
                            "PM": 730};

            var meetups_y = {"AM": 110, 
                            "Lunch": 110, 
                            "PM": 110};

            var meetups_x_data = d3.keys(meetups_x)
            //var meetups_y_data = d3.keys(meetups_y)
            var columnlabels = vis.selectAll("body")
                .data(meetups_x_data);

            columnlabels.enter().append("text")
                .attr("class", "years")
                .attr("x", function(d) { return meetups_x[d]; })
                .attr("y", function(d) { return meetups_y[d]; })
                .attr("text-anchor", "middle")
                .text(function(d) { return d; });
            //start
            force.start();
        }) //end of buttonWeekly

    //initialize tooltips
    circles.on('mouseover', tip.show);
    circles.on('mouseout', tip.hide);

}); //end of d3.json