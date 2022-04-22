# css-chart

lightweight bar/line chart library based on javascript and css

## example

```javascript
var graph = new jLineGraph(document.getElementById("graph"), {
  title: "Example Chart",
  labels: ["JAN", "FEB", "MAR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
  datasets: [
    {
      type: "line",
      label: "Incidents",
      data: [-40, 80, 10, 60, 100, 120, 250, 910, 10, 30, 240, 320],
      primaryColor: "blue",
      secondaryColor: "lightblue",
      fill: true,
    },
  ],
});
```
