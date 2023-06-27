//TEXT BOX
function closeTextBox() {
  var textBox = document.getElementById("textBox");
  textBox.style.display = "none";
}

// Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoiZGt0YXlidyIsImEiOiJjbDlkenBvODMwa2twM3hvZ293bWVpaml1In0._QB63ZC3km-uev6mJkmacg";

// Create the map
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/dktaybw/clje6d68r004001qucl7ndp75",
  center: [-3.88291, 50.28024], // Specify the center coordinates
  zoom: 14, // Specify the initial zoom level
  minZoom: 8,
});

// Custom GeoJSON data for the heatmap layer
var customGeoJSON = {
  type: "FeatureCollection",
  features: [
    // Add your custom GeoJSON features here...
  ],
};

// Add the heatmap layer to the map
map.on("load", function () {
  map.addSource("heatmap", {
    type: "geojson",
    data: "./data/takeoff_slim_v5.geojson",
  });

  map.addLayer({
    id: "heatmap-layer",
    type: "heatmap",
    source: "heatmap",
    paint: {
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(0, 0, 255, 0)",
        0.2,
        "#1F64DC",
        0.4,
        "#6CC9EE",
        0.6,
        "#C7BA68",
        0.8,
        "#EF702E",
        1,
        "#721C95",
      ],
      "heatmap-opacity": 0.55,
      "heatmap-radius": 17,
    },
  });
  map.setFilter("heatmap-layer", ["==", "tide_ft_ro", -17]);

  //SLIDER
  var slidey = document.getElementById("slider");

  slidey.addEventListener("input", function (e) {
    var value = parseInt(e.target.value);
    if (value == 0) {
      return value == 1;
    }

    console.log(value);
    map.setPaintProperty("heatmap-layer", "heatmap-opacity", 0, {
      duration: 80, // Transition duration in milliseconds
    });

    // Set the new filter and value for the heatmap layer
    setTimeout(function () {
      map.setFilter("heatmap-layer", ["==", "tide_ft_ro", value]);
      map.setPaintProperty("heatmap-layer", "heatmap-opacity", 0.55);
    }, 100);
    document.getElementById("valueText").innerHTML = String(
      Math.abs(value) + "ft"
    );
    if (value < 0) {
      document.getElementsByClassName("up")[0].style.opacity = 0;
      document.getElementsByClassName("down")[0].style.opacity = 1;
    }
    if (value > 0) {
      document.getElementsByClassName("up")[0].style.opacity = 1;
      document.getElementsByClassName("down")[0].style.opacity = 0;
    }
  });

  // Get the legend container element
  var legendContainer = document.getElementById("legend");

  // Set the minimum and maximum values for the legend
  var minValue = "Low";
  var maxValue = "High";

  // Set the color stops for the gradient
  var gradientColors = [
    "rgba(0, 0, 255, 0)",
    "#1F64DC",
    "#6CC9EE",
    "#C7BA68",
    "#EF702E",
    "#721C95",
  ];

  // Calculate the width for each color stop in the gradient
  var colorStopWidth = 100 / (gradientColors.length - 1);

  // Generate the gradient color stops
  var gradientStops = gradientColors.map(function (color, index) {
    return color + " " + index * colorStopWidth + "%";
  });

  // Create the CSS background gradient for the legend
  var gradient = "linear-gradient(to right, " + gradientStops.join(", ") + ")";

  // Set the gradient as the background of the legend gradient element
  var legendGradient = document.querySelector(".legend-gradient");
  legendGradient.style.backgroundImage = gradient;

  // Set the minimum and maximum values in the legend labels
  var legendMin = document.querySelector(".legend-min");
  legendMin.textContent = minValue;

  var legendMax = document.querySelector(".legend-max");
  legendMax.textContent = maxValue;

  // Add the legend to the map
  map.getContainer().appendChild(legendContainer);

  var nav = new mapboxgl.NavigationControl({
    showCompass: false,
    showZoom: true,
  });

  map.addControl(nav, "bottom-right");
  var minimizeButton = document.getElementById("minimizeButton");
  var textBox = document.getElementById("textBox");

  var minimizeButton = document.getElementById("minimizeButton");

  var textbox = document.getElementsByClassName("text-box")[0];
  // Add a click event listener to the button
  minimizeButton.addEventListener("click", function () {
    // Toggle the minimized class on the text element

    // Toggle the height of the text container

    textbox.style.opacity = textbox.style.opacity === "0" ? "1" : "0";
    minimizeButton.innerHTML = textbox.style.opacity === "0" ? "+" : "-";
  });
  document.getElementsByClassName("mapboxgl-ctrl-attrib-inner")[0].remove();

  const toggleLayerButton = document.getElementById("toggleLayerButton");
  toggleLayerButton.addEventListener("click", () => {
    const currentOpacity = map.getPaintProperty("bath1", "raster-opacity");
    const targetOpacity = currentOpacity === 0 ? 0.8 : 0;
    const onoff = currentOpacity === 0 ? "Hide Bathymetry" : "Show Bathymetry";
    map.setPaintProperty("bath1", "raster-opacity", targetOpacity);
    map.setPaintProperty("bath1", "raster-opacity-transition", {
      duration: 500, // Transition duration in milliseconds
    });
    map.setPaintProperty("bath2", "raster-opacity", targetOpacity);
    map.setPaintProperty("bath2", "raster-opacity-transition", {
      duration: 500, // Transition duration in milliseconds
    });

    document.getElementById("toggleLayerButton").innerHTML = onoff;
  });
});
