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
  style: "mapbox://styles/dktaybw/clj5w6x6h004101qxaxx2bb85",
  center: [-3.88291, 50.28024], // Specify the center coordinates
  zoom: 14.5, // Specify the initial zoom level
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
      "heatmap-opacity": 0,
      "heatmap-radius": 17,
    },
  });

  //SLIDER
  let svg = document.getElementById("slider");
  let trackFill = document.getElementById("trackFill");
  let knob = document.getElementById("knob");
  let valueText = document.getElementById("valueText");
  let arrow = document.getElementById("arrow");
  let isDragging = false;
  let sliderDragOffset = { dx: 0, dy: 0 };
  let ARC_CENTRE = { x: 175, y: 50 };
  let ARC_RADIUS = 125;

  let sliderValue = 0;
  setSliderValue(sliderValue);

  function setSliderValue(value) {
    // Limit value to (0..sliderMax)
    let sliderMax = track.getTotalLength();
    sliderValue = Math.max(0, Math.min(value, sliderMax));
    // Calculate new position of knob
    let knobRotation = (sliderValue * Math.PI) / sliderMax;
    let knobX = ARC_CENTRE.x - Math.cos(knobRotation) * ARC_RADIUS;
    let knobY = ARC_CENTRE.y + Math.sin(knobRotation) * ARC_RADIUS;
    // Adjust trackFill dash pattern to only draw the portion up to the knob position
    trackFill.setAttribute("stroke-dasharray", sliderValue + " " + sliderMax);

    // Update the knob position
    knob.setAttribute("cx", knobX);
    knob.setAttribute("cy", knobY);

    // Log the slider value
    let logValue = Math.round((sliderValue / sliderMax) * 34) - 17;
    if (logValue === 0) {
      logValue = logValue + 1;
    }

    if (logValue > 0) {
      document.getElementsByClassName("up")[0].style.opacity = 1;
      document.getElementsByClassName("down")[0].style.opacity = 0;
    }
    if (logValue < 0) {
      document.getElementsByClassName("up")[0].style.opacity = 0;
      document.getElementsByClassName("down")[0].style.opacity = 1;
    }

    console.log(document.getElementById("valueText").innerHTML);
    console.log(Math.abs(logValue) + "ft");

    if (
      document.getElementById("valueText").innerHTML ==
      Math.abs(logValue) + "ft"
    ) {
    } else {
      map.setPaintProperty("heatmap-layer", "heatmap-opacity", 0, {
        duration: 80, // Transition duration in milliseconds
      });

      // Set the new filter and value for the heatmap layer
      setTimeout(function () {
        map.setFilter("heatmap-layer", ["==", "tide_ft_ro", logValue]);
        map.setPaintProperty("heatmap-layer", "heatmap-opacity", 0.75);
      }, 100); // Delay before setting the new filter and opacity
    }
    // Update the value display
    valueText.textContent = Math.abs(logValue) + "ft";
    console.log(logValue);
  }

  knob.addEventListener("mousedown", (evt) => {
    isDragging = true;
    // Remember where we clicked on knob to allow accurate dragging
    sliderDragOffset.dx = evt.offsetX - knob.cx.baseVal.value;
    sliderDragOffset.dy = evt.offsetY - knob.cy.baseVal.value;
    // Attach move event to svg, so that it works if you move outside the knob circle
    svg.addEventListener("mousemove", knobMove);
    // Attach move event to window, so that it works if you move outside the svg
    window.addEventListener("mouseup", knobRelease);
  });

  function knobMove(evt) {
    // Calculate adjusted drag position
    let x = evt.offsetX + sliderDragOffset.dx;
    let y = evt.offsetY + sliderDragOffset.dy;
    // Position relative to the centre of the slider arc
    x -= ARC_CENTRE.x;
    y -= ARC_CENTRE.y;
    // Get the angle of the drag position relative to the slider centre
    let angle = Math.atan2(y, -x);
    // Positions above the arc centre will be negative, so handle them gracefully
    // by clamping the angle to the nearest end of the arc
    angle = angle < -Math.PI / 2 ? Math.PI : angle < 0 ? 0 : angle;
    // Calculate the new slider value from this angle (sliderMaxLength * angle / 180deg)
    setSliderValue((angle * track.getTotalLength()) / Math.PI);
  }

  function knobRelease(evt) {
    // Cancel event handlers
    svg.removeEventListener("mousemove", knobMove);
    window.removeEventListener("mouseup", knobRelease);
    isDragging = false;
  }

  knob.addEventListener("touchstart", handleTouchStart, false);
  knob.addEventListener("touchmove", handleTouchMove, false);
  knob.addEventListener("touchend", handleTouchEnd, false);

  // Variables to track touch positions
  let touchStartX = 0;
  let touchStartY = 0;
  let touchMoveX = 0;
  let touchMoveY = 0;

  function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }

  function handleTouchMove(event) {
    if (event.touches.length > 0) {
      touchMoveX = event.touches[0].clientX;
      touchMoveY = event.touches[0].clientY;

      // Calculate the change in touch position
      let touchDeltaX = touchMoveX - touchStartX;
      let touchDeltaY = touchMoveY - touchStartY;

      // Handle the touch interaction based on the touch deltas
      // Update the slider value, knob position, etc.
      // ...
    }
  }

  function handleTouchEnd(event) {
    // Reset touch variables if needed
    touchStartX = 0;
    touchStartY = 0;
    touchMoveX = 0;
    touchMoveY = 0;
  }

  // After initializing the map and adding the heatmap layer

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
  var textContainer = document.getElementById("textContainer");
  var text = document.getElementById("text");
  var title = document.getElementById("title");
  var textbox = document.getElementsByClassName("text-box")[0];
  // Add a click event listener to the button
  minimizeButton.addEventListener("click", function () {
    // Toggle the minimized class on the text element

    // Toggle the height of the text container

    textbox.style.opacity = textbox.style.opacity === "0" ? "1" : "0";
    minimizeButton.innerHTML = textbox.style.opacity === "0" ? "+" : "-";
  });
  document.getElementsByClassName("mapboxgl-ctrl-attrib-inner")[0].remove();
  document.getElementsByClassName("mapboxgl-ctrl-attrib-button")[0].remove();
  document.getElementsByClassName(
    "mapboxgl-ctrl mapboxgl-ctrl-attrib mapboxgl-compact)[0].remove()"
  );
});
