var jLineGraph = function (element, options) {
  var Renderer = {
    setElement: function (element) {
      this.element = element;
    },
    configure: function (options) {
      this.options = {};

      this.width = 0;
      this.height = 0;

      this.offsetX = 0;
      this.offsetY = 0;

      this.labels = options.labels || [];
      this.datasets = options.datasets || [];

      this.title = options.title || "";

      this.options.grouped = options.grouped || false;
      var grid = options.grid || {};
      this.options.grid = {
        color: grid.color || "lightgray",
        xAxis: grid.xAxis || true,
        yAxis: grid.yAxis || true,
      };

      var scales = options.scales || { xAxis: {}, yAxis: {} };
      var xAxis = scales.xAxis || { visible: true, centered: false };
      var yAxis = scales.yAxis || { visible: true };

      var centered = xAxis.centered || false;
      this.datasets.forEach(function (dataset) {
        dataset.type = dataset.type || "line";
        dataset.segment = dataset.segment || true;
        dataset.fill = dataset.fill || false;
        dataset.disabled = dataset.disabled || false;
        dataset.opacity = dataset.opacity || 0.75;

        if (dataset.type == "bar") {
          centered = true;
        }
      });

      this.options.scales = {
        xAxis: {
          visible: xAxis.visible || true,
          centered: centered,
          min: 0,
          max: centered == true ? this.labels.length : this.labels.length - 1,
        },
        yAxis: {
          visible: yAxis.visible || true,
          steps: yAxis.steps,
          min:
            yAxis.min ||
            (function () {
              var min = 0;
              options.datasets.forEach(function (dataset) {
                var _min = Math.min(...dataset.data);
                if (_min < min) {
                  min = _min;
                  return;
                }
              });
              return min;
            })(),
          max:
            yAxis.max ||
            (function () {
              var max = 0;
              options.datasets.forEach(function (dataset) {
                var _max = Math.max(...dataset.data);
                if (_max > max) {
                  max = _max;
                  return;
                }
              });
              return max;
            })(),
        },
      };

      if (this.options.scales.yAxis.steps == undefined) {
        if (this.options.scales.yAxis.max <= 10) {
          this.options.scales.yAxis.steps = 1;
        } else if (this.options.scales.yAxis.max <= 100) {
          this.options.scales.yAxis.steps = 10;
        } else {
          this.options.scales.yAxis.steps = 100;
        }
      }

      this.options.scales.yAxis.min =
        this.options.scales.yAxis.steps *
        Math.floor(
          this.options.scales.yAxis.min / this.options.scales.yAxis.steps
        );
      this.options.scales.yAxis.max =
        this.options.scales.yAxis.steps *
        Math.ceil(
          this.options.scales.yAxis.max / this.options.scales.yAxis.steps
        );

      this.options.scales.yAxis.range =
        Math.abs(this.options.scales.yAxis.min) +
        Math.abs(this.options.scales.yAxis.max);
    },
    renderOverlay: function (overlay) {
      var ctx = overlay.getContext("2d");

      var scale = window.devicePixelRatio;
      overlay.width = overlay.clientWidth * scale;
      overlay.height = overlay.clientHeight * scale;

      // Normalize coordinate system to use css pixels.
      ctx.scale(scale, scale);
    },
    renderLine: function (dataset, index) {
      var ul = document.createElement("ul");
      ul.setAttribute("data-index", index);
      ul.classList.add("chart");
      ul.classList.add("line-chart");
      if (this.options.scales.xAxis.centered) {
        ul.classList.add("centered");
      }
      if (dataset.disabled) {
        ul.classList.add("disabled");
      }
      ul.setAttribute(
        "style",
        `--primary-color: ${dataset.primaryColor}; --secondary-color: ${dataset.secondaryColor};--opacity:${dataset.opacity};`
      );

      dataset.data.forEach(
        function (value, index) {
          var label = this.labels[index];

          var li = document.createElement("li");
          li.setAttribute(
            "style",
            `--y: ${value}; --x: ${index};--z-index:${index * 100};`
          );

          //event handler
          li.addEventListener("mouseover", function () {
            li.style.setProperty("--z-index", 10000);
          });

          var div_dp = document.createElement("div");
          div_dp.classList.add("data-point");
          div_dp.setAttribute("data-value", value);
          div_dp.setAttribute("data-label", label);
          li.appendChild(div_dp);

          if (dataset.segment) {
            var div_ls = document.createElement("div");
            div_ls.classList.add("line-segment");
            li.appendChild(div_ls);
          }

          if (dataset.fill) {
            var div_ct = document.createElement("div");
            div_ct.classList.add("line-fill");
            li.appendChild(div_ct);

            var div_cttri = document.createElement("div");
            div_cttri.classList.add("line-fill-tri");
            li.appendChild(div_cttri);
          }

          ul.appendChild(li);
        }.bind(this)
      );

      return ul;
    },
    renderPointLine: function () {
      var content = this.element.getElementsByClassName("css-chart-content")[0];

      var width = content.clientWidth;
      var height = content.clientHeight;

      var max_value_x = this.options.scales.xAxis.max;
      var max_value_y =
        Math.abs(this.options.scales.yAxis.min) +
        Math.abs(this.options.scales.yAxis.max);

      //new code
      var charts = this.element.querySelectorAll("ul.line-chart");

      for (var j = 0; j < charts.length; j++) {
        var chart = charts[j];

        var chart_items = chart.querySelectorAll("li");
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
              var lineSegment =
                element.getElementsByClassName("line-segment")[0];
              lineSegment.style.setProperty("--a", diff_x);
              lineSegment.style.setProperty("--c", diff_y);
              lineSegment.style.setProperty("--hypotenuse", hypo.toString());

              var angle = (Math.asin(diff_y / hypo) * 180) / Math.PI;
              lineSegment.style.setProperty("--angle", angle.toString());

              var lineCurtain = element.getElementsByClassName("line-fill")[0];
              if (lineCurtain) {
                lineCurtain.style.setProperty("--a", `${diff_x}px`);
                lineCurtain.style.setProperty("--c", `${diff_y}px`);

                var lineCurtainTri =
                  element.getElementsByClassName("line-fill-tri")[0];

                lineCurtainTri.style.setProperty("--a", `${diff_x}px`);
                lineCurtainTri.style.setProperty(
                  "--aa",
                  `${Math.abs(diff_x)}px`
                );
                lineCurtainTri.style.setProperty("--c", `${diff_y}px`);
                lineCurtainTri.style.setProperty(
                  "--ac",
                  `${Math.abs(diff_y)}px`
                );

                if (diff_y > 0) {
                  lineCurtainTri.classList.add("left");
                } else {
                  lineCurtainTri.classList.add("right");
                }
              }
            }
          }
        }
      }
    },
    renderBar: function (dataset, index) {
      var ul = document.createElement("ul");
      ul.classList.add("chart");
      ul.classList.add("bar-chart");
      ul.setAttribute("data-index", index);
      if (this.options.grouped) {
        ul.classList.add("grouped");
      }

      var length = function () {
        var length = 0;
        this.datasets.forEach(function (dataset) {
          if (dataset.type == "bar") length++;
        });
        return length;
      }.bind(this)();

      ul.setAttribute(
        "style",
        `--primary-color: ${dataset.primaryColor};--secondary-color: ${dataset.secondaryColor};--opacity:${dataset.opacity};--i:${index};--items:${length};`
      );

      dataset.data.forEach(
        function (value, index) {
          var label = this.labels[index];

          var li = document.createElement("li");
          if (value < 0) {
            li.classList.add("negative");
          }
          li.setAttribute(
            "style",
            `--y: ${value}; --x: ${index};z-index:${
              -value + this.options.scales.yAxis.max + 1
            }`
          );
          li.setAttribute("data-value", value);
          li.setAttribute("data-label", label);

          ul.appendChild(li);
        }.bind(this)
      );

      return ul;
    },
    renderLegend: function () {
      var legend = document.createElement("div");
      legend.classList.add("legend");

      var self = this;
      this.datasets.forEach(function (dataset, index) {
        var item = document.createElement("div");
        item.classList.add("item");
        item.setAttribute("data-index", index);
        if (dataset.disabled) {
          item.classList.add("disabled");
        }

        item.onclick = function () {
          dataset.disabled = !dataset.disabled;

          var chart_item = self.element.getElementsByClassName("chart")[index];
          if (dataset.disabled) {
            item.classList.add("disabled");
            chart_item.classList.add("disabled");
          } else {
            item.classList.remove("disabled");
            chart_item.classList.remove("disabled");
          }
        };

        var color = document.createElement("div");
        color.classList.add("color");
        color.style.backgroundColor = dataset.primaryColor;
        color.style.border = `1px solid ${dataset.secondaryColor}`;
        item.appendChild(color);

        var label = document.createElement("span");
        label.classList.add("label");
        var text = document.createTextNode(dataset.label);
        label.appendChild(text);

        item.appendChild(label);

        legend.appendChild(item);
      });

      return legend;
    },
    renderHeader: function () {
      var headerTitle = document.createElement("div");
      headerTitle.classList.add("title");

      if (this.title != "") {
        var title = document.createTextNode(this.title);
        headerTitle.appendChild(title);
      }

      var legend = this.renderLegend();
      headerTitle.appendChild(legend);

      return headerTitle;
    },
    renderFooter: function () {
      /*var footerTitle = document.createElement("span");
      footerTitle.classList.add("title");

      var title = document.createTextNode("Titel");
      footerTitle.appendChild(title);

      return  footerTitle;*/
    },
    render: function () {
      /*this.width = this.element.style.width;
      this.height = this.element.style.height;*/

      this.width = "100%";
      this.height = "100%";

      this.element.style.width = this.width;
      this.element.style.height = this.height;

      this.offsetY = "100px";
      this.offsetX = "100px";

      //chart
      this.element.classList.add("css-chart");
      this.element.setAttribute(
        "style",
        `${this.element.style.cssText};--widget-width:${this.width};--widget-height:${this.height};--gridcolor:${this.options.grid.color};`
      );

      var header = document.createElement("div");
      header.classList.add("css-chart-header");
      this.element.appendChild(header);

      var headerContent = this.renderHeader();
      if (headerContent) {
        header.appendChild(headerContent);
      }

      //content
      var wrapper = document.createElement("div");
      wrapper.classList.add("css-chart-wrapper");

      var content = document.createElement("div");
      wrapper.appendChild(content);
      content.classList.add("css-chart-content");
      content.setAttribute(
        "style",
        `--range:${this.options.scales.yAxis.range};--max-x-value:${this.options.scales.xAxis.max};--max-y-value:${this.options.scales.yAxis.max};--grid-width: 100%;--grid-height:100%;`
      );

      this.element.appendChild(wrapper);

      //footer
      var footer = document.createElement("div");
      footer.classList.add("css-chart-footer");
      this.element.appendChild(footer);

      var footerContent = this.renderFooter();
      if (footerContent) {
        footer.appendChild(footerContent);
      }

      //X-Axis
      if (this.options.scales.xAxis.visible) {
        var xAxis = document.createElement("ul");
        xAxis.classList.add("css-chart-xaxis");
        if (this.options.scales.xAxis.centered) {
          xAxis.classList.add("centered");
        }
        xAxis.setAttribute(
          "style",
          `--labels:${this.options.scales.xAxis.max}`
        );

        this.labels.forEach(
          function (label, index) {
            var li = document.createElement("li");
            li.setAttribute("style", `--i:${index}`);
            var licontent = document.createTextNode(label);
            li.appendChild(licontent);
            xAxis.appendChild(li);
          }.bind(this)
        );

        content.appendChild(xAxis);
      }

      //Y-Axis
      if (this.options.scales.yAxis.visible) {
        var yAxis = document.createElement("ul");
        yAxis.classList.add("css-chart-yaxis");

        var count = 0;
        for (
          var i = this.options.scales.yAxis.min;
          i <= this.options.scales.yAxis.max;
          i = i + this.options.scales.yAxis.steps
        ) {
          var li = document.createElement("li");
          li.setAttribute("style", `--i:${count}`);
          var licontent = document.createTextNode(
            //(i / this.options.scales.yAxis.steps) * this.options.scales.yAxis.max
            i
          );
          li.appendChild(licontent);
          yAxis.appendChild(li);

          count++;
        }

        yAxis.setAttribute("style", `--steps:${count - 1}`);

        content.appendChild(yAxis);
      }

      //xgrid
      if (this.options.grid.xAxis) {
        var xgrid = document.createElement("ul");
        xgrid.classList.add("css-chart-xgrid");

        count = 0;
        for (
          var i = this.options.scales.yAxis.min;
          i <= this.options.scales.yAxis.max;
          i = i + this.options.scales.yAxis.steps
        ) {
          var li = document.createElement("li");
          if (i == 0) {
            li.classList.add("thicc");
          }
          li.setAttribute("style", `--i:${count}`);
          xgrid.appendChild(li);
          count++;
        }

        xgrid.setAttribute("style", `--steps:${count - 1}`);

        content.appendChild(xgrid);
      }

      //ygrid
      if (this.options.grid.yAxis) {
        var ygrid = document.createElement("ul");
        ygrid.setAttribute(
          "style",
          `--labels:${this.options.scales.xAxis.max};`
        );
        ygrid.classList.add("css-chart-ygrid");
        if (this.options.scales.xAxis.centered) {
          xAxis.classList.add("centered");
        }

        var min_i = this.options.scales.xAxis.min;
        var max_i = this.options.scales.xAxis.max + 1;
        for (var i = min_i; i < max_i; i++) {
          var li = document.createElement("li");

          if (i == 0) {
            li.classList.add("thicc");
          }

          li.setAttribute("style", `--i:${i}`);
          ygrid.appendChild(li);
        }

        content.appendChild(ygrid);
      }

      //add overlay
      /*var overlay = document.createElement("canvas");
      overlay.setAttribute("id", "overlay");
      overlay.classList.add("overlay");
      content.appendChild(overlay);

      this.renderOverlay(overlay);*/

      //render bars
      this.datasets
        .filter(function (dataset) {
          return dataset.type == "bar";
        })
        .forEach(
          function (dataset, index) {
            var bar = this.renderBar(dataset, index);
            content.appendChild(bar);
          }.bind(this)
        );

      //render lines
      this.datasets
        .filter(function (dataset) {
          return dataset.type == "line";
        })
        .forEach(
          function (dataset, index) {
            var line = this.renderLine(dataset, index);
            content.appendChild(line);
          }.bind(this)
        );

      this.renderPointLine();

      new ResizeObserver(this.renderPointLine.bind(this)).observe(this.element);
    },
  };

  this.Renderer = Renderer;

  this.Renderer.setElement(element);
  this.Renderer.configure(options);
  this.Renderer.render();
};
