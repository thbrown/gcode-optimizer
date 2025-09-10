var canvas, ctx;
var WIDTH, HEIGHT;
var points = [];
var running;
var ran = false;
var validFile = false;
var canvasMinX, canvasMinY;
var doPreciseMutate;

// Genetic algorithm parameters
var POPULATION_SIZE;
var ELITE_RATE;
var CROSSOVER_PROBABILITY;
var MUTATION_PROBABILITY;
var OX_CROSSOVER_RATE;
var UNCHANGED_GENS;

// GA state variables
var mutationTimes;
var dis;
var bestValue, best;
var currentGeneration;
var currentBest;
var population;
var values;
var fitnessValues;
var roulette;

// G-code processing state
var priorToG0 = [];
var eof = [];
var lastG1Point = null;

// Initialize the application when the DOM is fully loaded
$(document).ready(function () {
  // Initialize canvas and UI elements
  init();

  console.log("Document ready, initializing...");

  // Set up the start button handler
  $("#start_btn").click(function () {
    if (points.length >= 3) {
      initData();
      GAInitialize();
      running = true;
      ran = true;
      $(this).text("Stop");
    } else {
      alert("Please load a G-code file with at least 3 points first!");
    }
  });

  // Set up the stop button handler
  $("#stop_btn").click(function () {
    running = false;
    $("#start_btn").text("Start");
  });

  // Set up the save button handler
  $("#save_btn").click(function () {
    if (!ran) {
      alert("Please run the optimization first before saving the file");
      return false;
    }

    if (!validFile) {
      alert("Please load a valid G-code file first");
      return false;
    }

    // Stop any running optimization
    running = false;

    // Reconstruct the optimized G-code
    var optimizedGCode = [];

    // Add lines before first G0
    optimizedGCode = optimizedGCode.concat(
      priorToG0.map(function (line) {
        return line.toUpperCase();
      })
    );

    // Add optimized G0 points and their following lines
    if (best && best.length > 0) {
      for (var i = 0; i < best.length; i++) {
        var pointIndex = best[i];
        if (points[pointIndex] && points[pointIndex].followingLines) {
          optimizedGCode = optimizedGCode.concat(
            points[pointIndex].followingLines.map(function (line) {
              return line.toUpperCase();
            })
          );
        }
      }
    }

    // Add end of file content
    optimizedGCode = optimizedGCode.concat(eof);

    // Join all lines with newlines and create a blob for download
    var gcodeText = optimizedGCode.join("\n");
    var blob = new Blob([gcodeText], { type: "text/plain" });

    // Get the original filename if available, otherwise use a default name
    var originalName = "optimized.gcode";
    if (gc && gc.files && gc.files[0]) {
      var originalFile = gc.files[0].name;
      if (originalFile) {
        // Remove Chrome/Chromium fakepath if present
        if (originalFile.startsWith("C:\\fakepath\\")) {
          originalFile = originalFile.substring(12);
        }
        // Preserve the original extension
        var extension =
          originalFile.lastIndexOf(".") > -1
            ? originalFile.substring(originalFile.lastIndexOf("."))
            : ".gcode";
        var baseName =
          originalFile.lastIndexOf(".") > -1
            ? originalFile.substring(0, originalFile.lastIndexOf("."))
            : originalFile;
        originalName = "optimized_" + baseName + extension;
      }
    }

    // Use the saveAs function from FileSaver.js
    saveAs(blob, originalName);

    return false;
  });

  // Set up file input change handler
  var gc = document.getElementById("loadGcode");
  if (gc) {
    gc.addEventListener("change", function (e) {
      if (gc.files && gc.files[0]) {
        var reader = new FileReader();
        reader.onload = handleFileLoad;
        reader.readAsText(gc.files[0]);
      }
    });
  }
});

/**
 * Initialize the canvas and set up the drawing context
 */
function init() {
  canvas = document.getElementById("canvas");
  if (canvas) {
    ctx = canvas.getContext("2d");
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    setInterval(draw, 10);
  }
}

/**
 * Initialize genetic algorithm parameters and data structures
 */
function initData() {
  running = false;
  POPULATION_SIZE = 30;
  ELITE_RATE = 0.3;
  CROSSOVER_PROBABILITY = 0.8;
  MUTATION_PROBABILITY = 0.1;
  OX_CROSSOVER_RATE = 0.7;
  UNCHANGED_GENS = 100;

  // Initialize GA data structures
  mutationTimes = 0;
  currentGeneration = 0;
  bestValue = [];
  best = [];
  currentBest = [];

  // Initialize population
  population = [];
  for (var i = 0; i < POPULATION_SIZE; i++) {
    population[i] = [];
    for (var j = 0; j < points.length; j++) {
      population[i][j] = j;
    }
    // Shuffle the array
    population[i] = shuffleArray(population[i]);
  }

  // Initialize fitness values
  values = [];
  fitnessValues = [];
  roulette = [];

  // Calculate initial fitness values
  for (i = 0; i < POPULATION_SIZE; i++) {
    values[i] = evaluate(population[i]);
  }

  // Calculate fitness values
  calculateFitness();

  // Find best individual
  findBest();
}

/**
 * Draw a circle on the canvas
 * @param {Object} point - The point to draw
 */
function drawCircle(point) {
  if (!ctx) return;

  ctx.beginPath();
  ctx.arc(point.x, point.y, 5, 0, Math.PI * 2, true);
  ctx.fillStyle = "#000";
  ctx.fill();
}

/**
 * Draw lines connecting points on the canvas
 * @param {Array} array - Array of point indices
 */
function drawLines(array) {
  if (!ctx || !array || array.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[array[0]].x, points[array[0]].y);

  for (var i = 1; i < array.length; i++) {
    ctx.lineTo(points[array[i]].x, points[array[i]].y);
  }

  ctx.strokeStyle = "#00f";
  ctx.lineWidth = 1;
  ctx.stroke();
}

/**
 * Main drawing function
 */
function draw() {
  if (!ctx) return;

  // Clear the canvas
  clearCanvas();

  // Draw the current best path
  if (currentBest && currentBest.length > 0) {
    drawLines(currentBest);
  }

  // Draw all points
  for (var i = 0; i < points.length; i++) {
    drawCircle(points[i]);
  }

  // If we have a best path, draw it in a different color
  if (best && best.length > 0 && best !== currentBest) {
    ctx.beginPath();
    ctx.moveTo(points[best[0]].x, points[best[0]].y);

    for (i = 1; i < best.length; i++) {
      ctx.lineTo(points[best[i]].x, points[best[i]].y);
    }

    ctx.strokeStyle = "#f00";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

/**
 * Clear the canvas
 */
function clearCanvas() {
  if (ctx) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
  }
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} The shuffled array
 */
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

/**
 * Calculate the distance between two points
 * @param {Object} p1 - First point
 * @param {Object} p2 - Second point
 * @returns {number} The distance between the points
 */
function distance(p1, p2) {
  var dx = p1.x - p2.x;
  var dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Parse G-code line to extract X and Y coordinates
 * @param {string} s - G-code line
 * @returns {Array} [x, y] coordinates or [false, false] if not found
 */
function getXY(s) {
  var x = false,
    y = false;
  var parts = s.split(" ");

  for (var i = 0; i < parts.length; i++) {
    if (parts[i].startsWith("X")) {
      x = parseFloat(parts[i].substring(1));
    } else if (parts[i].startsWith("Y")) {
      y = parseFloat(parts[i].substring(1));
    }
  }

  return [x, y];
}

/**
 * Handles the file load event, processes the G-code, and prepares for optimization
 * @param {Event} e - The file load event
 */
function handleFileLoad(e) {
  try {
    console.log("File loaded, processing...");
    // Initialize data structures
    //initData();

    // Parse the G-code into structured format
    var parsed = parseGCode(e.target.result);
    console.log("G-code parsed:", parsed);

    // Extract G0 points and other sections
    var g0Points = parsed.g0Points || [];
    priorToG0 = parsed.priorToG0 || [];
    eof = parsed.eof || [];

    console.log("Parsed G-code:", {
      g0Points: g0Points,
      priorToG0: priorToG0,
      eof: eof,
    });

    // Process G0 points for optimization
    points = [];
    var allG0 = [];

    // Process each G0 point
    g0Points.forEach(function (g0) {
      var xy = getXY(g0.line);
      if (xy[0] !== false && xy[1] !== false) {
        // Add to points array for visualization
        points.push({
          x: xy[0],
          y: xy[1],
          originalX: xy[0],
          originalY: xy[1],
        });

        // Store complete G0 point data
        allG0.push({
          x: xy[0],
          y: xy[1],
          lastG1Point: g0.lastG1Point
            ? {
                x: g0.lastG1Point.x,
                y: g0.lastG1Point.y,
              }
            : null,
          followingLines: g0.followingLines || [],
        });
      }
    });

    // Process the points for visualization if we have valid points
    if (points.length > 0) {
      // Calculate bounding box of all points
      var bounds = points.reduce(
        function (acc, point) {
          return {
            minX: Math.min(acc.minX, point.x),
            maxX: Math.max(acc.maxX, point.x),
            minY: Math.min(acc.minY, point.y),
            maxY: Math.max(acc.maxY, point.y),
          };
        },
        {
          minX: points[0].x,
          maxX: points[0].x,
          minY: points[0].y,
          maxY: points[0].y,
        }
      );

      // Add padding around the points (10% of size or 10 units, whichever is larger)
      var paddingX = Math.max((bounds.maxX - bounds.minX) * 0.1, 10);
      var paddingY = Math.max((bounds.maxY - bounds.minY) * 0.1, 10);

      // Calculate scale factors to fit the points in the canvas
      var scaleX = (WIDTH - 40) / (bounds.maxX - bounds.minX + 2 * paddingX);
      var scaleY = (HEIGHT - 40) / (bounds.maxY - bounds.minY + 2 * paddingY);
      var scale = Math.min(scaleX, scaleY);

      // Calculate offsets to center the drawing
      var offsetX =
        (WIDTH - (bounds.maxX - bounds.minX + 2 * paddingX) * scale) / 2;
      var offsetY =
        (HEIGHT - (bounds.maxY - bounds.minY + 2 * paddingY) * scale) / 2;

      // Transform points to canvas coordinates
      points = points.map(function (point) {
        return {
          x: (point.x - bounds.minX + paddingX) * scale + offsetX,
          y: (point.y - bounds.minY + paddingY) * scale + offsetY,
          originalX: point.x,
          originalY: point.y,
        };
      });

      // Update the global points array with the transformed points
      window.points = points;

      // Start the visualization
      validFile = true;
      running = false;
      ran = false;

      // Enable the start button
      $("#start_btn").removeAttr("disabled");

      // Redraw the canvas
      draw();
    } else {
      alert("No valid G0 points found in the G-code.");
    }
  } catch (error) {
    console.error("Error processing G-code:", error);
    alert("Error processing G-code: " + error.message);
  }
}

/**
 * Parse G-code and extract G0/G1 points with their associated data
 * @param {string} gcode - The G-code content to parse
 * @returns {Object} Object containing parsed data including G0 points and their last G1 points
 */
function parseGCode(gcode) {
  var lines = gcode.split("\n");
  lines = preprocessGCode(lines);

  var result = {
    header: [], // Lines before first segment
    segments: [], // Array of G0 points with their last G1 points
    footer: [], // Lines after last segment
  };

  var currentSegment = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    var upperLine = line.toUpperCase();
    var isG0 = upperLine.startsWith("G0 ") || upperLine.startsWith("G00 ");
    var isG1 = upperLine.startsWith("G1 ") || upperLine.startsWith("G01 "); // Should this be hasX && hasY?

    if (isG0) {
      // If we were processing a segment, finalize it
      if (currentSegment) {
        if (currentSegment.end == null) {
          currentSegment.end = currentSegment.start;
        }
        result.segments.push(currentSegment);
      }

      // Found a G0 point so we start a new segment
      currentSegment = {
        start: line,
        middleLines: [],
        end: result.lastG1Point
          ? { x: result.lastG1Point.x, y: result.lastG1Point.y }
          : null,
      };
    } else if (isG1) {
      // Update end point
      var [xCoord, yCoord] = getXY(line);
      if (xCoord !== false && yCoord !== false) {
        currentSegment.end = { x: xCoord, y: yCoord };
      }

      if (currentSegment) {
        currentSegment.followingLines.push(line);
      } else {
        header.push(line);
      }
    } else {
      // Non-G0/G1 line
      if (currentG0) {
        currentG0.followingLines.push(line);
      } else {
        header.push(line);
      }
    }
  }

  return result;
}

/**
 * Preprocess G-code to ensure all movement commands have explicit X and Y coordinates
 * @param {string[]} lines - Array of G-code lines
 * @returns {string[]} Preprocessed G-code lines
 */
function preprocessGCode(lines) {
  var processed = [];
  var lastX = null;
  var lastY = null;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line === "") {
      processed.push(line);
      continue;
    }

    // Check if this is a G0/G1 command (case insensitive)
    var upperLine = line.toUpperCase();
    var isG0 = upperLine.startsWith("G0 ") || upperLine.startsWith("G00 ");
    var isG1 = upperLine.startsWith("G1 ") || upperLine.startsWith("G01 ");

    if (isG0 || isG1) {
      var parts = line.split(/\s+/);
      var hasX = false;
      var hasY = false;

      // Check for X and Y coordinates
      for (var j = 0; j < parts.length; j++) {
        if (parts[j].toUpperCase().startsWith("X")) {
          hasX = true;
          lastX = parseFloat(parts[j].substring(1));
        }
        if (parts[j].toUpperCase().startsWith("Y")) {
          hasY = true;
          lastY = parseFloat(parts[j].substring(1));
        }
      }

      // Add missing coordinates if we have previous values
      var newParts = [parts[0]]; // Keep the G0/G1 command
      if (!hasX && lastX !== null) {
        newParts.push("X" + lastX.toFixed(3));
      }
      if (!hasY && lastY !== null) {
        newParts.push("Y" + lastY.toFixed(3));
      }

      // Add any remaining parameters (F, Z, etc.)
      for (var j = 1; j < parts.length; j++) {
        var param = parts[j].toUpperCase();
        if (!param.startsWith("X") && !param.startsWith("Y")) {
          newParts.push(parts[j]);
        }
      }

      line = newParts.join(" ");
    }

    processed.push(line);
  }

  return processed;
}

// Initialize FileSaver.js if not already defined
if (typeof saveAs === "undefined") {
  var saveAs = function (blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename || "download";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  };
}

// Export functions for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    init: init,
    initData: initData,
    draw: draw,
    clearCanvas: clearCanvas,
    distance: distance,
    shuffleArray: shuffleArray,
  };
}
