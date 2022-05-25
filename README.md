# css-chart

lightweight bar/line chart library based on html, css and javascript

## example

```html
<div class="css-chart" data-min-value="0" data-max-value="2000">
  <div class="content">
    <div class="xaxis">
        <div>2019</div>
        <div>2020</div>
        <div>2021</div>
        <div>2022</div>
    </div>
    <div class="yaxis" data-steps="100"></div>
    <div class="xgrid"></div>
    <div class="ygrid"></div>
    <div class="line-chart" data-label="COVID Inzident" data-primary-color="red" data-secondary-color="orange"
    data-fill="true">
        <div data-value="10"></div>
        <div data-value="50"></div>
        <div data-value="310"></div>
        <div data-value="1850"></div>
    </div>
  </div>
</div>
```
