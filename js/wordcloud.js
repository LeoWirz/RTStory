
var theme = "Genra";
var year = 1800;
var maxSize;
var minSize;
var range_max = 100;
var w;
var s;

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

    set_cloud(2000, theme);
    //showNewWords(myWordCloud, theme, 2000);
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
d3.select("#year").on("mouseup", function () {
    console.log(this.value)
    year = this.value;
    showNewWords(myWordCloud, theme, year);
    document.getElementById('range_value').innerHTML=year; 
    //d3.select("h2").text(d3.select("#year").node().value);
});

d3.select("#year").on("keyup", function () {
    console.log(this.value)
    year = this.value;
    showNewWords(myWordCloud, theme, year);
    document.getElementById('range_value').innerHTML=year; 
    //d3.select("h2").text(d3.select("#year").node().value);
});

d3.select("#year").on("input", function () {
    year = this.value;
    document.getElementById('range_value').innerHTML=year; 
});

// set the onchange function for the dropdown
d3.select('#themes_drop')
.on("change", function () {
    var sect = document.getElementById("themes_drop");
    theme = sect.options[sect.selectedIndex].value;
    console.log("dropchanged");
    showNewWords(myWordCloud, theme, year);
});

// updadate the vis with new words
function showNewWords(vis, theme, year) {
    vis.update(getWord(theme, year));
}

function getWord(theme, year) {
    console.log(year);
    console.log(theme);
    try {
        w = Object.keys(json_data[theme][year]);
        s = Object.values(json_data[theme][year]);
    }
    catch(err){
        //no word to display
        w = [""]
        s = [100]
    }

    maxSize = d3.max(s);
    minSize = d3.min(s);

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

    
    var fontScale = d3.scaleLinear()
        .domain([minSize, maxSize]) 
        .range([minSize, maxSize]);

    function drawcloud (range_max) {
        fontScale = d3.scaleLinear()
        .domain([minSize, maxSize]) 
            .range([minSize, range_max]); // the argument here
            myWordCloud.update( w.map(function (d, i) {
                return {
                    text: d,
                    size: s[i]
                };
            }))
                        //showNewWords(myWordCloud, theme, year);
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
            //.fontSize(function (d) { return d.size; })
            .fontSize(function(d) { return fontScale(d.size) }) 
            .spiral("archimedean")
            //.on("end", draw)
            .on("end", function(output) {
                if (words.length !== output.length) {  // compare between input ant output
                    console.log("resizing")
                    range_max = range_max - 10;
                    console.log(range_max)
                    drawcloud ( range_max); // call the function recursively
                    return undefined;  
                }
                else { 
                    console.log(output);
                    range_max = 100;
                    draw(output);
                }     // when all words are included, start rendering
            })
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
