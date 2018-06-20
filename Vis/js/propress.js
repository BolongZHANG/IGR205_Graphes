
let G = new jsnx.MultiDiGraph()
let dataset 

d3.json("../data/sembib.json", function(data) {        
        dataset = data
        //console.log(dataset)
        for(edge of data.results.bindings){
            G.addEdge(edge.t1.value, edge.t2.value, edge.p1.value)
            G.node.get(edge.t1.value).type = edge.t1.type
            G.node.get(edge.t2.value).type = edge.t2.type
        }
        console.log(G)
        for(node of G){
            G.node.get(node).degree = G.degree(node)
            G.node.get(node).inDegree = G.inDegree(node)
            G.node.get(node).outDegree = G.outDegree(node)
        }

        draw(G)

        sorted_node = G.nodes(true).sort(function(a,b) {
            return b[1].degree - a[1].degree;
        });
        console.log(sorted_node)


    });

function draw(G) {
    jsnx.draw(G, {
        element: '#canvas', 
        width:1000,
        height: 900,
        withLabels: false,
        nodeAttr: {
            r: 2,
        },
        nodeStyle: {
            fill: function(d) { 
                return d.data.color; 
            }
        }, 
        labelStyle: {fill: 'white'},
        stickyDrag: true
    })
}