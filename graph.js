var jGraph = function (element) {
  var Renderer = {
    setElement: function (element) {
      this.element = element;
    },
    renderOverlay: function (overlay) {
      var ctx = overlay.getContext("2d");

      var scale = window.devicePixelRatio;
      overlay.width = overlay.clientWidth * scale;
      overlay.height = overlay.clientHeight * scale;

      ctx.scale(scale, scale);
    },
    renderLine: function (chart) {
      var primaryColor =
        chart.getAttribute("data-primary-color") || "lightgray";
      var secondaryColor =
        chart.getAttribute("data-secondary-color") || "black";
      var opacity = chart.getAttribute("data-opacity") || 1.0;
      var point = chart.getAttribute("data-point");
      if (!point) point = true;
      else point = point == "true" ? true : false;

      var segment = chart.getAttribute("data-segment");
      if (!segment) segment = true;
      else segment = segment == "true" ? true : false;

      var fill = chart.getAttribute("data-fill");
      if (!fill) fill = false;
      else fill = fill == "true" ? true : false;

      chart.setAttribute(
        "style",
        `--primary-color: ${primaryColor}; --secondary-color: ${secondaryColor};--opacity:${opacity};`
      );

      for (var i = 0; i < chart.children.length; i++) {
        var item = chart.children[i];
        var value = parseInt(item.getAttribute("data-value"));
        var label = this.labels[i];

        var itemPrimaryColor =
          item.getAttribute("data-primary-color") || primaryColor;
        var itemSecondaryColor =
          item.getAttribute("data-secondary-color") || secondaryColor;
        var itemOpacity = item.getAttribute("data-opacity") || opacity;

        item.setAttribute(
          "style",
          `--primary-color: ${itemPrimaryColor}; --secondary-color: ${itemSecondaryColor};--opacity:${itemOpacity};--opacity:${opacity};--y: ${value}; --x: ${i};--z-index:${
            i * 100
          };`
        );

        item.addEventListener("mouseover", function () {
          this.style.setProperty("--z-index", 10000);
        });

        if (point) {
          var div_dp = document.createElement("div");
          div_dp.classList.add("data-point");
          div_dp.setAttribute("data-value", value);
          div_dp.setAttribute("data-label", label);
          item.appendChild(div_dp);
        }

        if (segment) {
          var div_ls = document.createElement("div");
          div_ls.classList.add("line-segment");
          item.appendChild(div_ls);
        }

        if (fill) {
          var div_ct = document.createElement("div");
          div_ct.classList.add("line-fill");
          item.appendChild(div_ct);

          var div_cttri = document.createElement("div");
          div_cttri.classList.add("line-fill-tri");
          item.appendChild(div_cttri);
        }
      }

      this.renderLineSegment(chart);
    },
    renderLineSegment: function (chart) {
      var width = this.element.getElementsByClassName("content")[0].clientWidth;
      var height =
        this.element.getElementsByClassName("content")[0].clientHeight;

      var max_value_x = this.xMaxValue;
      var max_value_y = Math.abs(this.maxValue) + Math.abs(this.minValue);

      var chart_items = chart.children;
      for (var i = 0; i < chart_items.length; i++) {
        var element = chart_items[i];
        var style = element.computedStyleMap();

        var x = (style.get("--x") / max_value_x) * width;
        var y = (style.get("--y") / max_value_y) * height;

        var nextElement = chart_items[i + 1];
        if (nextElement) {
          var styleNext = nextElement.computedStyleMap();

          var x2 = (styleNext.get("--x") / max_value_x) * width;
          var y2 = (styleNext.get("--y") / max_value_y) * height;

          var diff_x = x - x2;
          var diff_y = y - y2;

          var hypo = Math.hypot(diff_x, diff_y);
          if (hypo) {
            var lineSegment = element.getElementsByClassName("line-segment")[0];
            if (lineSegment) {
              lineSegment.style.setProperty("--a", diff_x);
              lineSegment.style.setProperty("--c", diff_y);
              lineSegment.style.setProperty("--hypotenuse", hypo.toString());

              var angle = (Math.asin(diff_y / hypo) * 180) / Math.PI;
              lineSegment.style.setProperty("--angle", angle.toString());
            }

            var lineCurtain = element.getElementsByClassName("line-fill")[0];
            if (lineCurtain) {
              lineCurtain.style.setProperty("--a", `${diff_x}px`);
              lineCurtain.style.setProperty("--c", `${diff_y}px`);

              var lineCurtainTri =
                element.getElementsByClassName("line-fill-tri")[0];

              lineCurtainTri.style.setProperty("--a", `${diff_x}px`);
              lineCurtainTri.style.setProperty("--aa", `${Math.abs(diff_x)}px`);
              lineCurtainTri.style.setProperty("--c", `${diff_y}px`);
              lineCurtainTri.style.setProperty("--ac", `${Math.abs(diff_y)}px`);

              if (diff_y > 0) {
                lineCurtainTri.classList.add("left");
              } else {
                lineCurtainTri.classList.add("right");
              }
            }
          }
        }
      }
    },
    renderBar: function (chart, index) {
      var primaryColor =
        chart.getAttribute("data-primary-color") || "lightgray";
      var secondaryColor =
        chart.getAttribute("data-secondary-color") || "black";
      var opacity = chart.getAttribute("data-opacity") || 1.0;

      var length = this.element.getElementsByClassName("bar-chart").length;

      chart.setAttribute(
        "style",
        `--primary-color: ${primaryColor};--secondary-color: ${secondaryColor};--opacity:${opacity};--i:${index};--items:${length};`
      );

      for (var i = 0; i < chart.children.length; i++) {
        var item = chart.children[i];
        var value = parseInt(item.getAttribute("data-value"));
        var label = this.labels[i];
        var x = parseInt(item.getAttribute("data-index")) - 1 || i;

        if (value < 0) {
          item.classList.add("negative");
        }
        item.setAttribute(
          "style",
          `--y: ${value}; --x: ${x};z-index:${-value + this.maxValue + 1}`
        );
        item.setAttribute("data-value", value);
        item.setAttribute("data-label", label);
      }
    },
    renderLegend: function (legend) {
      var element = this.element;
      var charts = element.querySelectorAll(".line-chart,.bar-chart");
      charts.forEach(function (chart, index) {
        var strLabel = chart.getAttribute("data-label");

        var item = element.querySelectorAll(
          `.legend .item[data-label="${strLabel}"]`
        )[0];
        if (!item) {
          var item = document.createElement("div");
          item.classList.add("item");
          item.setAttribute("data-index", index);
          item.setAttribute("data-label", strLabel);
          if (chart.getAttribute("data-disabled")) {
            item.classList.add("disabled");
          }

          var color = document.createElement("div");
          color.classList.add("color");
          color.style.backgroundColor =
            chart.getAttribute("data-primary-color");
          color.style.border = `1px solid ${chart.getAttribute(
            "data-secondary-color"
          )}`;
          item.appendChild(color);

          var label = document.createElement("span");
          label.classList.add("label");
          var text = document.createTextNode(strLabel);
          label.appendChild(text);

          item.appendChild(label);

          legend.appendChild(item);
        }

        item.onclick = function () {
          var disabled = chart.getAttribute("data-disabled") == "true" || false;
          chart.setAttribute("data-disabled", !disabled);

          if (!disabled) {
            item.classList.add("disabled");
            chart.classList.add("disabled");
          } else {
            item.classList.remove("disabled");
            chart.classList.remove("disabled");
          }
        };
      });

      return legend;
    },
    renderHeader: function () {
      var legend = this.element.getElementsByClassName("legend")[0];
      if (legend) {
        this.renderLegend(legend);
      }
    },
    calculateMinMax: function (values, steps) {
      var min = Math.min(...values);
      var max = Math.max(...values);

      var minValue = Math.floor(min / steps) * steps;
      var maxValue = Math.ceil(max / steps) * steps;

      return [minValue, maxValue];
    },
    adjustMinMax: function(minValue, maxValue) {
      var absMinMaxValue = Math.max(Math.abs(minValue), Math.abs(maxValue));
      
      if(Math.abs(minValue) < absMinMaxValue) {
        if(minValue < 0) {
          minValue = -absMinMaxValue;
        }
      }

      if(Math.abs(maxValue) < absMinMaxValue) {
        if(maxValue < 0) {
          maxValue = -absMinMaxValue;
        }
      }

      return [minValue,maxValue];
    },
    calculateSteps: function (values) {
      var min = Math.min(...values);
      var max = Math.max(...values);
      var range = Math.abs(min) + Math.abs(max);
      var length = range.toString().length - 1;
      var pow = Math.pow(10, length);
      var floor = (Math.floor(range / pow) * pow) / 10;
      return floor;
    },
    render: function () {
      this.width = "100%";
      this.height = "100%";
      this.type = this.element.getAttribute("data-type") || "grid";
      this.minValue =
        parseInt(this.element.getAttribute("data-min-value")) || undefined;
      this.maxValue =
        parseInt(this.element.getAttribute("data-max-value")) || undefined;

      if (this.minValue == undefined || this.maxValue == undefined) {
        var values = [];
        var charts = this.element.querySelectorAll(".line-chart,.bar-chart");
        charts.forEach(function (chart) {
          for (var i = 0; i < chart.children.length; i++) {
            var item = chart.children[i];
            var value = parseFloat(item.getAttribute("data-value"));
            values.push(value);
          }
        });

        this.steps =
          parseInt(
            this.element
              .getElementsByClassName("yaxis")[0]
              .getAttribute("data-steps")
          ) || undefined;
        if (this.steps == undefined) {
          this.steps = this.calculateSteps(values);
        }

        var minMax = this.calculateMinMax(values, this.steps);
        minMax = this.adjustMinMax(minMax[0], minMax[1]);

        this.minValue = minMax[0];
        this.maxValue = minMax[1];
      }

      this.centered = this.element.classList.contains("centered");
      if (this.element.getElementsByClassName("bar-chart").length > 0) {
        this.centered = true;
        this.element.classList.add("centered");
      }

      this.labels = [];

      var range = Math.abs(this.maxValue) + Math.abs(this.minValue);

      this.element.style.width = this.width;
      this.element.style.height = this.height;

      this.renderHeader();

      this.element.setAttribute(
        "style",
        `${this.element.style.cssText};padding: 0px 1vw 5vh 2vw;--widget-width:${this.width};--widget-height:${this.height};--gridcolor:lightgray;--range:${range};--max-y-value:${this.maxValue};`
      );

      var content = this.element.getElementsByClassName("content")[0];
      content.setAttribute(
        "style",
        `${content.style.cssText};--grid-width: 100%;--grid-height:100%;`
      );

      switch (this.type) {
        case "grid":
          this.renderGrid(content);
          break;
        case "pie":
          this.renderPie(content);
          break;
      }
    },

    renderPie: function (content) {
      var width = content.clientWidth;
      var height = content.clientHeight;

      var pie = document.createElement("div");
      pie.classList.add("pie-chart");
      content.appendChild(pie);

      var count = 0;
      var offset = 0;
      this.datasets.forEach(function (dataset, index) {
        count = count + dataset.data[0];

        var item = document.createElement("div");
        item.classList.add("chart");
        item.setAttribute(
          "style",
          `--offset:${offset};--primary-color: ${dataset.primaryColor};--secondary-color: ${dataset.secondaryColor};--value:${dataset.data[0]}`
        );
        pie.appendChild(item);

        offset = offset + dataset.data[0];
      });

      pie.setAttribute(
        "style",
        `--pie-width:${Math.min(width, height)};--pie-height:${Math.min(
          height,
          width
        )};--sum:${count};--b:40%;`
      );
    },

    renderGrid: function (content) {
      var xAxis = this.element.getElementsByClassName("xaxis")[0];

      var labels = xAxis.children.length;
      if (!this.centered) labels--;

      xAxis.setAttribute("style", `--labels:${labels}`);

      var length = xAxis.children.length;
      for (var i = 0; i < length; i++) {
        var child = xAxis.children[i];
        child.setAttribute("style", `--i:${i}`);

        this.labels[i] = child.innerText;
      }

      this.xMaxValue = xAxis.children.length;
      if (!this.centered) this.xMaxValue--;
      this.element.setAttribute(
        "style",
        `${this.element.style.cssText};--max-x-value:${this.xMaxValue};`
      );

      var yAxis = this.element.getElementsByClassName("yaxis")[0];

      var min = this.minValue;
      var max = this.maxValue;
      var steps = this.steps;

      var count = 0;
      for (var i = min; i <= max; i = i + steps) {
        let item = document.createElement("div");
        item.setAttribute("style", `--i:${count}`);
        let content = document.createTextNode(i.toString());
        item.appendChild(content);
        yAxis.appendChild(item);
        count++;
      }

      var yaxissteps = count - 1;
      yAxis.setAttribute("style", `--steps:${yaxissteps}`);

      var xgrid = this.element.getElementsByClassName("xgrid")[0];
      if (xgrid) {
        count = 0;
        for (var i = min; i <= max; i = i + steps) {
          var item = document.createElement("div");
          if (i == 0) {
            item.classList.add("thicc");
          }
          item.setAttribute("style", `--i:${count}`);
          xgrid.appendChild(item);
          count++;
        }

        xgrid.setAttribute("style", `--steps:${yaxissteps}`);
      }

      var min_i = 0;
      var max_i = xAxis.children.length + 1;

      var maxx = xAxis.children.length;
      if (!this.centered) maxx--;
      var ygrid = this.element.getElementsByClassName("ygrid")[0];
      if (ygrid) {
        ygrid.setAttribute(
          "style",
          `--labels:${xAxis.children.length};--max-x-value:${maxx}`
        );

        for (var i = min_i; i < max_i; i++) {
          var item = document.createElement("div");

          if (i == 0) {
            item.classList.add("thicc");
          }

          item.setAttribute("style", `--i:${i}`);
          ygrid.appendChild(item);
        }
      }

      var barCharts = this.element.getElementsByClassName("bar-chart");
      for (var i = 0; i < barCharts.length; i++) {
        var chart = barCharts[i];
        this.renderBar(chart, i);
      }

      var lineCharts = this.element.getElementsByClassName("line-chart");
      for (var i = 0; i < lineCharts.length; i++) {
        var chart = lineCharts[i];
        this.renderLine(chart);
      }

      window.onresize = function () {
        var lineCharts = this.element.getElementsByClassName("line-chart");
        for (var i = 0; i < lineCharts.length; i++) {
          var chart = lineCharts[i];
          this.renderLineSegment(chart);
        }
      }.bind(this);
    },
  };

  this.Renderer = Renderer;
  this.Renderer.setElement(element);
  this.Renderer.render();
};

window.onload = function () {
  var elements = document.querySelectorAll(".css-chart");
  elements.forEach(function (element, index) {
    var chart = jGraph(element);
  });
};
