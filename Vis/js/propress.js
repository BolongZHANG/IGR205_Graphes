
let G = new jsnx.MultiDiGraph()
//let k = 20
let unG
let subG
let dataset 
let sorted_node
let subnodes
let pathnodes

d3.json("../data/sembib.json", function(data) {        
    dataset = data
    console.log(dataset)
    for(edge of data.results.bindings){
        G.addEdge(edge.t1.value, edge.t2.value, edge.p1)
        G.node.get(edge.t1.value).type = edge.t1.type
        G.node.get(edge.t2.value).type = edge.t2.type
    }
    //console.log(G)
    for(node of G){
        G.node.get(node).degree = G.degree(node)
        G.node.get(node).inDegree = G.inDegree(node)
        G.node.get(node).outDegree = G.outDegree(node)
    }

    //draw(G)
    updateSubgraph(20)  
})

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
        labelStyle: {fill: 'blue'},
        stickyDrag: true
    })
}

function changeNodeNumber(){
    let nodeNb = document.getElementById("nodeNumber").value
    updateSubgraph(nodeNb);
    //console.log("changeNodeNumber()", nodeNb)
}

function updateSubgraph(nodeNb) {
    console.log('updateSubgraph')
    sorted_node = G.nodes(true).sort(function(a,b) {
        return b[1].degree - a[1].degree;
    });
    console.log(sorted_node.slice(0,nodeNb))

    subnodes = []
    for(node of sorted_node.slice(0,nodeNb)){
        subnodes.push(node[0])
    }
    //subG = G.subgraph(subnodes)
    

    unG = new jsnx.Graph(G)
    //path = jsnx.allPairsShortestPath(G)

    pathnodes = new Set([])
    //testnodes = new Set([])
    for (var i=0; i<subnodes.length; i++){
        for (var j=i+1; j<subnodes.length; j++){
            if (jsnx.hasPath(unG,{source: subnodes[i], target: subnodes[j]})){
                //pathnodes = pathnodes.concat(jsnx.shortestPath(unG,{source: subnodes[i], target: subnodes[j]}))
                jsnx.shortestPath(unG,{source: subnodes[i], target: subnodes[j]}).forEach(pathnodes.add, pathnodes)
            } else {
                pathnodes.add(subnodes[i],subnodes[j])
                //testnodes.add(subnodes[i],subnodes[j])
                //console.log("add no path case")
            }
        }
    }

    //pathnodes.forEach(subnodes.add, subnodes)
    //subnodes = subnodes.concat(Array.from(pathnodes))
    subG = G.subgraph(pathnodes)
    console.log(subG)
    //draw_function.updateGraph(subG)
    draw(subG)
}
