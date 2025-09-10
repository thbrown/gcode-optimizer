var canvas, ctx;
var WIDTH, HEIGHT;
var points = [];
var running;
var ran = false;
var validFile = false;
var canvasMinX, canvasMinY;
var doPreciseMutate;

var POPULATION_SIZE;
var ELITE_RATE;
var CROSSOVER_PROBABILITY;
var MUTATION_PROBABILITY;
var OX_CROSSOVER_RATE;
var UNCHANGED_GENS;

var mutationTimes;
var dis;
var bestValue, best;
var currentGeneration;
var currentBest;
var population;
var values;
var fitnessValues;
var roulette;

$(function () {
  var saveAs =
    saveAs ||
    (function (e) {
      "use strict";
      if (
        "undefined" == typeof navigator ||
        !/MSIE [1-9]\./.test(navigator.userAgent)
      ) {
        var t = e.document,
          n = function () {
            return e.URL || e.webkitURL || e;
          },
          o = t.createElementNS("http://www.w3.org/1999/xhtml", "a"),
          r = "download" in o,
          i = function (n) {
            var o = t.createEvent("MouseEvents");
            o.initMouseEvent(
              "click",
              !0,
              !1,
              e,
              0,
              0,
              0,
              0,
              0,
              !1,
              !1,
              !1,
              !1,
              0,
              null
            ),
              n.dispatchEvent(o);
          },
          a = e.webkitRequestFileSystem,
          c = e.requestFileSystem || a || e.mozRequestFileSystem,
          u = function (t) {
            (e.setImmediate || e.setTimeout)(function () {
              throw t;
            }, 0);
          },
          f = "application/octet-stream",
          s = 0,
          d = 500,
          l = function (t) {
            var o = function () {
              "string" == typeof t ? n().revokeObjectURL(t) : t.remove();
            };
            e.chrome ? o() : setTimeout(o, d);
          },
          v = function (e, t, n) {
            t = [].concat(t);
            for (var o = t.length; o--; ) {
              var r = e["on" + t[o]];
              if ("function" == typeof r)
                try {
                  r.call(e, n || e);
                } catch (i) {
                  u(i);
                }
            }
          },
          p = function (e) {
            return /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(
              e.type
            )
              ? new Blob(["\ufeff", e], { type: e.type })
              : e;
          },
          w = function (t, u) {
            t = p(t);
            var d,
              w,
              y,
              m = this,
              S = t.type,
              h = !1,
              O = function () {
                v(m, "writestart progress write writeend".split(" "));
              },
              E = function () {
                if (((h || !d) && (d = n().createObjectURL(t)), w))
                  w.location.href = d;
                else {
                  var o = e.open(d, "_blank");
                  void 0 == o &&
                    "undefined" != typeof safari &&
                    (e.location.href = d);
                }
                (m.readyState = m.DONE), O(), l(d);
              },
              R = function (e) {
                return function () {
                  return m.readyState !== m.DONE
                    ? e.apply(this, arguments)
                    : void 0;
                };
              },
              b = { create: !0, exclusive: !1 };
            return (
              (m.readyState = m.INIT),
              u || (u = "download"),
              r
                ? ((d = n().createObjectURL(t)),
                  (o.href = d),
                  (o.download = u),
                  i(o),
                  (m.readyState = m.DONE),
                  O(),
                  void l(d))
                : (e.chrome &&
                    S &&
                    S !== f &&
                    ((y = t.slice || t.webkitSlice),
                    (t = y.call(t, 0, t.size, f)),
                    (h = !0)),
                  a && "download" !== u && (u += ".download"),
                  (S === f || a) && (w = e),
                  c
                    ? ((s += t.size),
                      void c(
                        e.TEMPORARY,
                        s,
                        R(function (e) {
                          e.root.getDirectory(
                            "saved",
                            b,
                            R(function (e) {
                              var n = function () {
                                e.getFile(
                                  u,
                                  b,
                                  R(function (e) {
                                    e.createWriter(
                                      R(function (n) {
                                        (n.onwriteend = function (t) {
                                          (w.location.href = e.toURL()),
                                            (m.readyState = m.DONE),
                                            v(m, "writeend", t),
                                            l(e);
                                        }),
                                          (n.onerror = function () {
                                            var e = n.error;
                                            e.code !== e.ABORT_ERR && E();
                                          }),
                                          "writestart progress write abort"
                                            .split(" ")
                                            .forEach(function (e) {
                                              n["on" + e] = m["on" + e];
                                            }),
                                          n.write(t),
                                          (m.abort = function () {
                                            n.abort(), (m.readyState = m.DONE);
                                          }),
                                          (m.readyState = m.WRITING);
                                      }),
                                      E
                                    );
                                  }),
                                  E
                                );
                              };
                              e.getFile(
                                u,
                                { create: !1 },
                                R(function (e) {
                                  e.remove(), n();
                                }),
                                R(function (e) {
                                  e.code === e.NOT_FOUND_ERR ? n() : E();
                                })
                              );
                            }),
                            E
                          );
                        }),
                        E
                      ))
                    : void E())
            );
          },
          y = w.prototype,
          m = function (e, t) {
            return new w(e, t);
          };
        return "undefined" != typeof navigator && navigator.msSaveOrOpenBlob
          ? function (e, t) {
              return navigator.msSaveOrOpenBlob(p(e), t);
            }
          : ((y.abort = function () {
              var e = this;
              (e.readyState = e.DONE), v(e, "abort");
            }),
            (y.readyState = y.INIT = 0),
            (y.WRITING = 1),
            (y.DONE = 2),
            (y.error =
              y.onwritestart =
              y.onprogress =
              y.onwrite =
              y.onabort =
              y.onerror =
              y.onwriteend =
                null),
            m);
      }
    })(
      ("undefined" != typeof self && self) ||
        ("undefined" != typeof window && window) ||
        this.content
    );
  "undefined" != typeof module && module.exports
    ? (module.exports.saveAs = saveAs)
    : "undefined" != typeof define &&
      null !== define &&
      null != define.amd &&
      define([], function () {
        return saveAs;
      });

  init();
  initData();

  // points expects an array of objects like this
  // [ {x:0,y:0},{x:10,y:10} ]
  points = data200;

  var gc = document.getElementById("loadGcode");

  function getXY(s) {
    var x = false;
    var y = false;

    var d = s.split(" ");

    for (var rr = 0; rr < d.length; rr++) {
      if (d[rr].substr(0, 1) == "x") {
        x = Number(d[rr].substr(1));
      } else if (d[rr].substr(0, 1) == "y") {
        y = Number(d[rr].substr(1));
      }
    }

    return [x, y];
  }

  // G-code processing state
  var priorToG0 = [];
  var eof = [];
  var lastG1Point = null;
  var g0Points = []; // Array to store G0 points with their last G1 point

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
      if (line === '') {
        processed.push(line);
        continue;
      }
      
      // Check if this is a G0/G1 command (case insensitive)
      var upperLine = line.toUpperCase();
      var isG0 = upperLine.startsWith('G0 ') || upperLine.startsWith('G00 ');
      var isG1 = upperLine.startsWith('G1 ') || upperLine.startsWith('G01 ');
      
      if (isG0 || isG1) {
        var parts = line.split(/\s+/);
        var hasX = false;
        var hasY = false;
        
        // Check for X and Y coordinates
        for (var j = 0; j < parts.length; j++) {
          if (parts[j].toUpperCase().startsWith('X')) {
            hasX = true;
            lastX = parseFloat(parts[j].substring(1));
          }
          if (parts[j].toUpperCase().startsWith('Y')) {
            hasY = true;
            lastY = parseFloat(parts[j].substring(1));
          }
        }
        
        // Add missing coordinates if we have previous values
        var newParts = [parts[0]]; // Keep the G0/G1 command
        if (!hasX && lastX !== null) {
          newParts.push('X' + lastX.toFixed(3));
        }
        if (!hasY && lastY !== null) {
          newParts.push('Y' + lastY.toFixed(3));
        }
        
        // Add any remaining parameters (F, Z, etc.)
        for (var j = 1; j < parts.length; j++) {
          var param = parts[j].toUpperCase();
          if (!param.startsWith('X') && !param.startsWith('Y')) {
            newParts.push(parts[j]);
          }
        }
        
        line = newParts.join(' ');
      }
      
      processed.push(line);
    }
    
    return processed;
  }


  /**
   * Parse G-code and extract G0/G1 points with their associated data
   * @param {string} gcode - The G-code content to parse
   * @returns {Object} Object containing parsed data including G0 points and their last G1 points
   */
  function parseGCode(gcode) {
    var lines = gcode.split('\n');
    lines = preprocessGCode(lines);
    
    var result = {
      g0Points: [],  // Array of G0 points with their last G1 points
      priorToG0: [], // Lines before first G0
      eof: [],       // Lines after last G0
      lastG1Point: null
    };
    
    var currentG0 = null;
    
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      
      var upperLine = line.toUpperCase();
      var isG0 = upperLine.startsWith('G0 ') || upperLine.startsWith('G00 ');
      var isG1 = upperLine.startsWith('G1 ') || upperLine.startsWith('G01 ');
      
      if (isG0) {
        // If we find a G0 and we're not already processing one, start a new G0 point
        if (!currentG0) {
          currentG0 = {
            line: line,
            followingLines: [],
            lastG1Point: result.lastG1Point ? 
              { x: result.lastG1Point.x, y: result.lastG1Point.y } : 
              null
          };
          result.g0Points.push(currentG0);
        } else {
          // If we find another G0 while processing one, add to following lines
          currentG0.followingLines.push(line);
        }
      } else if (isG1) {
        // Update last G1 point
        var xy = getXY(line);
        if (xy[0] !== false && xy[1] !== false) {
          result.lastG1Point = { x: xy[0], y: xy[1] };
        }
        
        if (currentG0) {
          currentG0.followingLines.push(line);
        } else {
          result.priorToG0.push(line);
        }
      } else {
        // Non-G0/G1 line
        if (currentG0) {
          currentG0.followingLines.push(line);
        } else {
          result.priorToG0.push(line);
        }
      }
    }
    
    return result;
  }

  /**
   * Handles the file load event, processes the G-code, and prepares for optimization
   * @param {Event} e - The file load event
   */
  function handleFileLoad(e) {
    try {
      // Initialize data structures
      initData();
      
      // Parse the G-code into structured format
      var parsed = parseGCode(e.target.result);
      
      // Extract G0 points and other sections
      var g0Points = parsed.g0Points || [];
      var priorToG0 = parsed.priorToG0 || [];
      var eof = parsed.eof || [];
      
      console.log("Parsed G-code:", {
        g0Points: g0Points,
        priorToG0: priorToG0,
        eof: eof
      });
      
      // Process G0 points for optimization
      var points = [];
      var allG0 = [];
      
      // Process each G0 point
      g0Points.forEach(function(g0) {
        var xy = getXY(g0.line);
        if (xy[0] !== false && xy[1] !== false) {
          // Add to points array for visualization
          points.push({
            x: xy[0],
            y: xy[1]
          });
          
          // Store complete G0 point data
          allG0.push({
            x: xy[0],
            y: xy[1],
            lastG1Point: g0.lastG1Point ? {
              x: g0.lastG1Point.x,
              y: g0.lastG1Point.y
            } : null,
            followingLines: g0.followingLines || []
          });
        }
      });
      
      // Update the algorithm with the G0 points if the function exists
      if (typeof window.setG0Points === 'function') {
        window.setG0Points(allG0);
      }
      
      // Process the points for visualization if we have valid points
      if (points.length > 0) {
        // Calculate bounding box of all points
        var bounds = points.reduce(function(acc, point) {
          return {
            minX: Math.min(acc.minX, point.x),
            maxX: Math.max(acc.maxX, point.x),
            minY: Math.min(acc.minY, point.y),
            maxY: Math.max(acc.maxY, point.y)
          };
        }, {
          minX: points[0].x,
          maxX: points[0].x,
          minY: points[0].y,
          maxY: points[0].y
        });
        
        // Add padding around the points (10% of size or 10 units, whichever is larger)
        var paddingX = Math.max((bounds.maxX - bounds.minX) * 0.1, 10);
        var paddingY = Math.max((bounds.maxY - bounds.minY) * 0.1, 10);
        
        // Get canvas dimensions
        WIDTH = canvas.width;
        HEIGHT = canvas.height;
        
        // Calculate scale factors to fit the points in the canvas
        var scaleX = (WIDTH - 40) / (bounds.maxX - bounds.minX + 2 * paddingX);
        var scaleY = (HEIGHT - 40) / (bounds.maxY - bounds.minY + 2 * paddingY);
        var scale = Math.min(scaleX, scaleY);
        
        // Calculate offsets to center the drawing
        var offsetX = (WIDTH - (bounds.maxX - bounds.minX + 2 * paddingX) * scale) / 2;
        var offsetY = (HEIGHT - (bounds.maxY - bounds.minY + 2 * paddingY) * scale) / 2;
        
        // Transform points to canvas coordinates
        points = points.map(function(point) {
          return {
            x: (point.x - bounds.minX + paddingX) * scale + offsetX,
            y: (point.y - bounds.minY + paddingY) * scale + offsetY,
            originalX: point.x,
            originalY: point.y
          };
        });
        
        // Set up the genetic algorithm
        setupGeneticAlgorithm(points);
        
        // Start the visualization
        validFile = true;
        running = false;
        ran = false;
        
        // Enable the start button
        $('#start').removeAttr('disabled');
      } else {
        alert('No valid G0 points found in the G-code.');
      }
    } catch (error) {
      console.error('Error processing G-code:', error);
      alert('Error processing G-code: ' + error.message);
    }
  }
  
  // Set up file input change handler
  gc.addEventListener("change", function (e) {
    if (gc.files && gc.files[0]) {
      var reader = new FileReader();
      reader.onload = handleFileLoad;
      reader.readAsText(gc.files[0]);
    }
  });
  
  // Set up start button click handler
  $('#start_btn').click(function() {
    if (validFile && !running) {
      initData();
      GAInitialize();
      running = true;
      ran = true;
      $(this).text('Stop');
    } else if (running) {
      running = false;
      $(this).text('Start');
    } else if (!validFile) {
      alert('Please load a valid G-code file first.');
    }
  });
  
  // Set up optimize button click handler
  $('#optimize_btn').click(function() {
    if (points.length >= 3) {
      initData();
      GAInitialize();
      running = true;
      ran = true;
    } else {
      alert("Please load a G-code file with at least 3 points first!");
    }
  });
  
  // Clean up the file input change handler
  gc.addEventListener("change", function (e) {
    if (gc.files && gc.files[0]) {
      var reader = new FileReader();
      reader.onload = handleFileLoad;
      reader.readAsText(gc.files[0]);
    }
  });

  // Initialize the application when the DOM is fully loaded
  $(document).ready(function() {
    // Set up canvas
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    
    // Initialize the drawing
    clearCanvas();
    
    // Set up event handlers
    $('#clear').click(clearCanvas);
    
    // Set up the download button
    $('#download').click(function() {
      var dataURL = canvas.toDataURL('image/png');
      var link = document.createElement('a');
      link.download = 'optimized-path.png';
      link.href = dataURL;
      link.click();
    });
    
    // Set up the form submission
    $('form').submit(function(e) {
      e.preventDefault();
      if (validFile) {
        if (!running) {
          running = true;
          $('#start_btn').text('Stop');
          if (!ran) {
            initData();
            GAInitialize();
            ran = true;
          }
        } else {
          running = false;
          $('#start_btn').text('Start');
        }
      } else {
        alert('Please load a G-code file first.');
      }
    });
  });
  
  // Set up the save button
  $("#save_btn").click(function() {
    if (ran === false) {
      alert("You must first run the optimization before saving the file");
      return;
    }
    
    // Create a blob with the optimized G-code
  
  // Get canvas dimensions
  WIDTH = canvas.width;
  HEIGHT = canvas.height;
  
  // Calculate scale factors to fit the points in the canvas
  var scaleX = (WIDTH - 40) / (bounds.maxX - bounds.minX + 2 * paddingX);
  var scaleY = (HEIGHT - 40) / (bounds.maxY - bounds.minY + 2 * paddingY);
  var scale = Math.min(scaleX, scaleY);
  
  // Calculate offsets to center the drawing
  var offsetX = (WIDTH - (bounds.maxX - bounds.minX + 2 * paddingX) * scale) / 2;
  var offsetY = (HEIGHT - (bounds.maxY - bounds.minY + 2 * paddingY) * scale) / 2;
  
  // Transform points to canvas coordinates
  points = points.map(function(point) {
    return {
      x: (point.x - bounds.minX + paddingX) * scale + offsetX,
      y: (point.y - bounds.minY + paddingY) * scale + offsetY,
      originalX: point.x,
      originalY: point.y
    };
  });
  
  // Set up the genetic algorithm
  setupGeneticAlgorithm(points);
  
  // Start the visualization
  validFile = true;
  running = false;
  ran = false;
  
  // Enable the start button
  $('#start').removeAttr('disabled');
} else {
  alert('No valid G0 points found in the G-code.');
}

// Set up file input change handler
gc.addEventListener("change", function (e) {
  if (gc.files && gc.files[0]) {
    var reader = new FileReader();
    reader.onload = handleFileLoad;
    reader.readAsText(gc.files[0]);
  }
});

// Initialize the application when the DOM is fully loaded
$(document).ready(function() {
  // Initialize canvas and UI elements
  init();
  
  // Set up the start button handler
  $("#start_btn").click(function () {
    if (points.length >= 3) {
      initData();
      GAInitialize();
      running = true;
      ran = true;
      $(this).text('Stop');
    } else {
      alert("Please load a G-code file with at least 3 points first!");
    }
  });
  
  // Set up the stop button handler
  $("#stop_btn").click(function() {
    running = false;
    $("#start_btn").text('Start');
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
    
    console.log("Best solution:", best);
    if (best && best.length > 0 && points[best[0]]) {
      console.log("First point:", points[best[0]]);
    }

    // Reconstruct the optimized G-code
    var optimizedGCode = [];
    
    // Add lines before first G0
    optimizedGCode = optimizedGCode.concat(priorToG0.map(function(line) {
      return line.toUpperCase();
    }));
    
    // Add optimized G0 points and their following lines
    if (best && best.length > 0) {
      for (var i = 0; i < best.length; i++) {
        var pointIndex = best[i];
        if (points[pointIndex] && points[pointIndex].followingLines) {
          optimizedGCode = optimizedGCode.concat(
            points[pointIndex].followingLines.map(function(line) {
              return line.toUpperCase();
            })
          );
        }
      }
    }
    
    // Add end of file content
    optimizedGCode = optimizedGCode.concat(eof);
    
    // Join all lines with newlines and create a blob for download
    var gcodeText = optimizedGCode.join('\n');
    var blob = new Blob([gcodeText], { type: 'text/plain' });
    
    // Get the original filename if available, otherwise use a default name
    var originalName = 'optimized.gcode';
    if (gc && gc.files && gc.files[0]) {
      var originalFile = gc.files[0].name;
      if (originalFile) {
        // Remove Chrome/Chromium fakepath if present
        if (originalFile.startsWith('C:\\fakepath\\')) {
          originalFile = originalFile.substring(12);
        }
        // Preserve the original extension if it exists
        var extension = originalFile.lastIndexOf('.') > -1 ? 
          originalFile.substring(originalFile.lastIndexOf('.')) : '.gcode';
        var baseName = originalFile.lastIndexOf('.') > -1 ? 
          originalFile.substring(0, originalFile.lastIndexOf('.')) : originalFile;
        originalName = 'optimized_' + baseName + extension;
      }
    }
    
    // Use the saveAs function from FileSaver.js
    saveAs(blob, originalName);
    
    return false;
  });
});

function init() {
  ctx = $("#canvas")[0].getContext("2d");
  WIDTH = $("#canvas").width();
  HEIGHT = $("#canvas").height();
  setInterval(draw, 10);
}

function initData() {
  running = false;
  POPULATION_SIZE = 30;
  ELITE_RATE = 0.3;
  CROSSOVER_PROBABILITY = 0.9;
  MUTATION_PROBABILITY = 0.01;
  //OX_CROSSOVER_RATE = 0.05;
  UNCHANGED_GENS = 0;
  mutationTimes = 0;
  doPreciseMutate = true;

  bestValue = undefined;
  best = [];
  currentGeneration = 0;
  currentBest;
  population = []; //new Array(POPULATION_SIZE);
  values = new Array(POPULATION_SIZE);
  fitnessValues = new Array(POPULATION_SIZE);
  roulette = new Array(POPULATION_SIZE);
}

function drawCircle(point) {
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(point.x, point.y, 3, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
}

function drawLines(array) {
  ctx.strokeStyle = "#f00";
  ctx.lineWidth = 1;
  ctx.beginPath();

  // move to the first point in best
  ctx.moveTo(points[array[0]].x, points[array[0]].y);

  // loop through and draw lines to each other point
  for (var i = 1; i < array.length; i++) {
    ctx.lineTo(points[array[i]].x, points[array[i]].y);
  }
  ctx.lineTo(points[array[0]].x, points[array[0]].y);

  ctx.stroke();
  ctx.closePath();
}

function draw() {
  if (running) {
    GANextGeneration();
    $("#status").text(
      "There are " +
        points.length +
        " G0 points, " +
        "the " +
        currentGeneration +
        "th generation with " +
        mutationTimes +
        " times of mutation. best value: " +
        ~~bestValue
    );
  } else {
    $("#status").text("There are " + points.length + " points");
  }

  clearCanvas();

  if (points.length > 0) {
    // draw all the points as dots
    for (var i = 0; i < points.length; i++) {
      drawCircle(points[i]);
    }

    // draw the path
    if (best.length === points.length) {
      drawLines(best);
    }
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}
