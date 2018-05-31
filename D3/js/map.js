let path = d3.geoPath()

let svg = d3.select('body')
  .append('svg')
  .attr('width', 800)
  .attr('height', 600)

console.log('Show info')

d3.json('data/us-states.json').then(function (json) {
  console.log(json.features)

  svg.selectAll('path')
    .data(json.features)
    .enter()
    .append('path')
    .attr('d', path)
})
