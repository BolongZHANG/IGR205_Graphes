let G = new jsnx.MultiDiGraph()
let degrees

d3.dsv(' , ', "data/datamusee10000.csv", row =>{
    return {
        source: row['subject'],
        target: row['object'],
        label: row['predict']
    }
})
    .then(function(data) {
        console.log(data)
        for(edge in data){
            G.addEdge(data[edge].source, data[edge].target, data[edge].label)
        }
        degrees = G.degree()
        for(node of G){
            G.node.get(node).degree = G.degree(node)
            G.node.get(node).inDegree = G.inDegree(node)
            G.node.get(node).outDegree = G.outDegree(node)
        }

    });



function draw(G) {

}