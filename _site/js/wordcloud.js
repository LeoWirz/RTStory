
var theme;
var year;

// load json data
var json_data;

d3.json("themes_by_year.json", function (data) {
    json_data = data;

    // populate drobdown menu
    var possible_themes = Object.keys(json_data);
    var select = document.getElementById("themes_drop");
    for (var i = 0; i < possible_themes.length; i++) {
        var option = document.createElement('option');
        option.text = option.value = possible_themes[i];
        select.add(option, 0);
    }
    theme = select.options[select.selectedIndex].value;

    showNewWords(myWordCloud, theme, 2000);
});

// populate the options for the slider (1900 to 2017)
var options="";

for(var i = 1900; i <= 2017; i++)
{
    // adds the label every 10 years
    if(i%10 == 0){
        options += "<option value=\""+i+"\" label=\""+i+"\">";
    }
    else{
        options += "<option value=\""+i+"\">";
    }
}

document.getElementById('tickmarks').innerHTML = options;

//Create a new instance of the word cloud visualisation.
var myWordCloud = wordCloud('#cloud_container');

// was the slider used?
d3.select("#year").on("input", function () {
    console.log(this.value)
    year = this.value;
    showNewWords(myWordCloud, theme, year);
    document.getElementById('range_value').innerHTML=year; 
    //d3.select("h2").text(d3.select("#year").node().value);
});

// set the onchange function for the dropdown
d3.select('#themes_drop')
.on("change", function () {
    var sect = document.getElementById("themes_drop");
    theme = sect.options[sect.selectedIndex].value;
    showNewWords(myWordCloud, theme, year);
});

// updadate the vis with new words
function showNewWords(vis, theme, year) {
    vis.update(getWord(theme, year));
}

function getWord(theme, year) {
    try {
        w = Object.keys(json_data[theme][year]);
        s = Object.values(json_data[theme][year]);
    }
    catch(err){
        //no word to display
        w = [""]
        s = [100]
    }
    return w.map(function (d, i) {
        return {
            text: d,
            //size: Math.log(s[i]) / Math.log(1.1)
            size: s[i]
        };
    });
}

// Encapsulate the word cloud functionality
function wordCloud(selector) {

    var fill = d3.scaleOrdinal(d3.schemeCategory20);

    //Construct the word cloud's SVG element
    var svg = d3.select(selector).append("svg")
    .attr("width", 900)
    .attr("height", 500)
    .append("g")
    .attr("transform", "translate(450,250)");

    svg.on("click", function() {
        console.log("rect");
        showNewWords(myWordCloud, theme, year);
    });

    //Draw the word cloud
    function draw(words) {
        var cloud = svg.selectAll("g text")
        .data(words, function (d) { return d.text; });

        //Entering words
        cloud.enter()
        .append("text")
        .style("font-family", "Impact")
        .style("fill", function (d, i) { return fill(i); })
        .style("font-size", function (d) { return d.size + "px"; })
        .attr("text-anchor", "middle")
        .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function (d) { return d.text; })
        ;

        //Entering and exiting words
        cloud
        .transition()
        .duration(1000)
        .style("font-size", function (d) { return d.size + "px"; })
        .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .style("fill-opacity", 1);

        //Exiting words
        cloud.exit()
        .transition()
        .duration(1000)
        .style('fill-opacity', 1e-6)
        .attr('font-size', 1)
        .remove();
    }


    //Use the module pattern to encapsulate the visualisation code. We'll
    // expose only the parts that need to be public.
    return {

        //Recompute the word cloud for a new set of words. This method will
        // asycnhronously call draw when the layout has been computed.
        //The outside world will need to call this function, so make it part
        // of the wordCloud return value.
        update: function (words) {
            console.log("here are the words")
            console.log(words);
            d3.layout.cloud().size([900, 500])
            .words(words)
            .padding(0)
            .rotate(0)
            .font("Impact")
            .fontSize(function (d) { return d.size; })
            .spiral("archimedean")
            .on("end", draw)
            .start();
        }
    };
}



function set_cloud(new_year, type){
    document.getElementById("year").value = new_year;
    document.getElementById("range_value").innerHTML = new_year;
    year = new_year;
    theme = type;
    document.getElementById("themes_drop").value = type;
    showNewWords(myWordCloud, type, new_year);
}

// animation for when we go to the worcloud
$(document).on('click', 'a[href^="#"]', function (event) {
    event.preventDefault();

    $('html, body').animate({
        scrollTop: $($.attr(this, 'href')).offset().top
    }, 500);
});