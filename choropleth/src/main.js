$(yearSlider).slider({
  min: us_stats.minYear,
  max: us_stats.maxYear,
  value: us_stats.maxYear,
  slide: function(e, ui) {
    year = ui.value;
    vis.render();
  }
});
 
var year = us_stats.maxYear;

var w = 810,
    h = 400,
    yearsMargin = 100;

var scale = pv.Geo.scale()
    .domain({lng: -128, lat: 24}, {lng: -64, lat: 50})
    .range({x: 0, y: 0}, {x: w, y: h});

var yearsScale = pv.Scale.linear()
    .domain(us_stats.minYear, us_stats.maxYear)
    .range(yearsMargin + 2, w - yearsMargin);

// Colors by ColorBrewer.org, Cynthia A. Brewer, Penn State.
var col = function(v) {
  if (v < 17) return "#008038";
  if (v < 20) return "#A3D396";
  if (v < 23) return "#FDD2AA";
  if (v < 26) return "#F7976B";
  if (v < 29) return "#F26123";
  if (v < 32) return "#E12816";
  return "#B7161E";
};

// Find the centroid for each state
us_lowres.forEach(function(c) {
  c.code = c.code.toUpperCase();
  c.centLatLon = centroid(c.borders[0]);
});

/*
var timer = undefined;
function playClick() {
  if (timer) {
    stop();
  } else {
    if (year == us_stats.maxYear) year = us_stats.minYear;
    $(yearSlider).slider('value', year);
    $(play).attr("src", 'stop.png');
    vis.render();
    timer = setInterval(function() {
      year++;
      if (year >= us_stats.maxYear) stop();
      $(yearSlider).slider('value', year);
      vis.render();
    }, 900);
  }
}

// Stop the animation
function stop() {
  clearInterval(timer);
  timer = undefined;
  $(play).attr("src", 'play.png');
}*/

// Add the main panel
var vis = new pv.Panel()
    .width(w)
    .height(h)
    .top(30)
    .bottom(20);

// Add the ticks and labels for the year slider
vis.add(pv.Rule)
    .data(pv.range(us_stats.minYear, us_stats.maxYear + .1))
    .left(yearsScale)
    .height(4)
    .top(-20)
  .anchor("bottom").add(pv.Label);

// Add a panel for each state
var state = vis.add(pv.Panel)
    .data(us_lowres);

// Add a panel for each state land mass
state.add(pv.Panel)
    .data(function(c) c.borders)
  .add(pv.Line)
    .data(function(l) l)
    .left(scale.x)
    .top(scale.y)
    .fillStyle(function(d, l, c) col(us_stats[c.code].obese[us_stats.yearIdx(year)]))
    .lineWidth(1)
    .strokeStyle("white")
    .antialias(false);

// Add a label with the state code in the middle of every state
vis.add(pv.Label)
    .data(us_lowres)
    .left(function(c) scale(c.centLatLon).x)
    .top(function(c) scale(c.centLatLon).y)
    .text(function(c) c.code)
    .textAlign("center")
    .textBaseline("middle");

// Add the color bars for the color legend
vis.add(pv.Bar)
    .data(pv.range(14, 32.1, 3))
    .bottom(function(d) this.index * 12)
    .height(10)
    .width(10)
    .left(5)
    .fillStyle(function(d) col(14 + 3 * this.index))
    .lineWidth(null)
  .anchor("right").add(pv.Label)
    .textAlign("left")
    .text(function(d) d + " - " + (d + 3) + "%");

vis.render();
