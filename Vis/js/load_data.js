
let G = new jsnx.MultiDiGraph()
//let k = 20
let unG
let subG
let dataset 
let sorted_node
let subnodes
let pathnodes
let edgeSet = new Set()
let draw_function = new Draw_Force(800,600)


function loadJsonFile(){
    d3.json(getFilePath()).then(function(data) {
        console.log("loadJsonFile:","Successful get data from path:",getFilePath(), data )
        dataset = data

        G.clear()
        edgeSet.clear()
        let t1 = data.head.vars[0]
        let p1 = data.head.vars[1]
        let t2 = data.head.vars[2]

        for(edge of data.results.bindings){

            let sub = uriToStr(edge[t1].value)
            let pre = uriToStr(edge[p1].value)
            let obj = uriToStr(edge[t2].value)

            edgeSet.add(pre)

            G.addEdge(edge[t1].value, edge[t2].value, {label:pre, id: sub+"-"+pre + "-" + obj, type:edge[p1].value})
            G.node.get(edge[t1].value).type = edge[t1].type
            G.node.get(edge[t1].value).label = sub

            G.node.get(edge[t2].value).type = edge[t2].type
            G.node.get(edge[t2].value).label = obj
        }
        let bc = jsnx.betweennessCentrality(G)
        for(node of G){
            G.node.get(node).degree = G.degree(node)
            G.node.get(node).inDegree = G.inDegree(node)
            G.node.get(node).outDegree = G.outDegree(node)
            G.node.get(node).betweennessCentrality = bc.get(node)
        }



        //draw(G)
        show_graph_info()
        draw_function = new Draw_Force(800,600)
        updateSubgraph(getNodeNumber())

    }).catch(error =>
        console.error("loadJsonFile():","Fail get data cause by",error ))

}


function display_data(data){
    console.log("loadJsonFile:","Successful get data url:")
    set_status_info("Create graph.....")
    dataset = data
    for(edge of data.results.bindings){
        G.addEdge(edge.t1.value, edge.t2.value, edge.p1)
        G.node.get(edge.t1.value).type = edge.t1.type
        G.node.get(edge.t2.value).type = edge.t2.type
    }
    let bc = jsnx.betweennessCentrality(G)
    for(node of G){
        G.node.get(node).degree = G.degree(node)
        G.node.get(node).inDegree = G.inDegree(node)
        G.node.get(node).outDegree = G.outDegree(node)
        G.node.get(node).betweennessCentrality = bc.get(node)
    }

    //draw(G)
    show_graph_info()
    draw_function = new Draw_Force(800,600)
    updateSubgraph(20)
}
//
// d3.json("./data/sembib.json").then(function(data) {
//     dataset = data
//     //console.log(dataset)
//     for(edge of data.results.bindings){
//         G.addEdge(edge.t1.value, edge.t2.value, edge.p1)
//         G.node.get(edge.t1.value).type = edge.t1.type
//         G.node.get(edge.t2.value).type = edge.t2.type
//     }
//     //console.log(G)
//     for(node of G){
//         G.node.get(node).degree = G.degree(node)
//         G.node.get(node).inDegree = G.inDegree(node)
//         G.node.get(node).outDegree = G.outDegree(node)
//     }
//
//     //draw(G)
//     updateSubgraph(20)
// })

// function draw(G) {
//     jsnx.draw(G, {
//         element: '#canvas', 
//         width:1000,
//         height: 900,
//         withLabels: false,
//         nodeAttr: {
//             r: 2,
//         },
//         nodeStyle: {
//             fill: function(d) { 
//                 return d.data.color; 
//             }
//         }, 
//         labelStyle: {fill: 'blue'},
//         stickyDrag: true
//     })
// }

function changeNodeNumber(){
    let nodeNb = document.getElementById("nodeNumber").value
    updateSubgraph(getNodeNumber(), getIndicator());
    //console.log("changeNodeNumber()", nodeNb)
}

function updateSubgraph(nodeNb, indicator) {
    console.log("updateSubgraph()", "nodeNb:",nodeNb, "indicator", indicator)
    if(nodeNb <=0){
        draw_function.updateGraph(G)
        return
    }

    set_status_info("Sort the nodes.....")

    if(indicator === "degree"){
        sorted_node = G.nodes(true).sort(function(a,b) {
            return b[1].degree - a[1].degree;
        });
    }else if(indicator === "in_degree"){
        sorted_node = G.nodes(true).sort(function(a,b) {
            return b[1].inDegree - a[1].inDegree;
        });
    }else if(indicator === "out_degree"){
        sorted_node = G.nodes(true).sort(function(a,b) {
            return b[1].outDegree - a[1].outDegree;
        });
    }else{
        sorted_node = G.nodes(true).sort(function(a,b) {
            return b[1].betweennessCentrality - a[1].betweennessCentrality;
        });
    }

    //console.log(sorted_node.slice(0,nodeNb))

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
    //console.log(subG)
    draw_function.updateGraph(subG)
    //draw(subG)


}


// var svg = d3.select("svg"),
//     width = +svg.attr("width"),
//     height = +svg.attr("height");

// var zoom = d3.zoom()
//     .scaleExtent([1, 40])
//     .translateExtent([[-100, -100], [width + 90, height + 100]])
//     .on("zoom", zoomed);

// var x = d3.scaleLinear()
//     .domain([-1, width + 1])
//     .range([-1, width + 1]);

// var y = d3.scaleLinear()
//     .domain([-1, height + 1])
//     .range([-1, height + 1]);

// var xAxis = d3.axisBottom(x)
//     .ticks((width + 2) / (height + 2) * 10)
//     .tickSize(height)
//     .tickPadding(8 - height);

// var yAxis = d3.axisRight(y)
//     .ticks(10)
//     .tickSize(width)
//     .tickPadding(8 - width);

// var view = svg.append("rect")
//     .attr("class", "view")
//     .attr("x", 0.5)
//     .attr("y", 0.5)
//     .attr("width", width - 1)
//     .attr("height", height - 1);

// var gX = svg.append("g")
//     .attr("class", "axis axis--x")
//     .call(xAxis);

// var gY = svg.append("g")
//     .attr("class", "axis axis--y")
//     .call(yAxis);

// d3.select("button")
//     .on("click", resetted);

// svg.call(zoom);

// function zoomed() {
//   view.attr("transform", d3.event.transform);
//   gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
//   gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
// }

// function resetted() {
//   svg.transition()
//       .duration(750)
//       .call(zoom.transform, d3.zoomIdentity);
// }

let server = "http://127.0.0.1:8815/summary_graph?"
let summary_graph_data


function submit_keyword(){
    remove_graph_info()
    let k = document.getElementById('input_distance').value
    let keyword = document.getElementById('input_keyword').value
    console.log("keyword", keyword, "distance", k)
    if(keyword === ""){
        alert("Please type a key word");
        return false
    }
    if(k < 1){
        alert("The distance have to bigger than 1")
        return false;
    }

    set_status_info("Submit info to server......: key word:" +keyword + " distance: " + k)

    let url = server + "keyword=" + keyword + "&k="+ k
    console.log("Submit_keyword()", url)
    d3.json(url).then( data=>{
        set_status_info("Successfully Get data...")
        console.log("Update data", data)
        summary_graph_data = data
        json_to_graph(data)

        updateSubgraph(getNodeNumber())
    }).catch( error =>{
        set_status_info("Error：" + error)
        console.log("Get error:", error)
    });
    return true;
}

function json_to_graph(data){
    set_status_info("Transform json to graph....")
    G.clear()
    for( let node of data.nodes){
        G.addNode(node.id, node)
    }

    for( let edge of data.links){
        G.addEdge(edge.source, edge.target, edge)
    }

    set_status_info("Calcule the degree ....")

    let bc = jsnx.betweennessCentrality(G)
    for(node of G){
        G.node.get(node).degree = G.degree(node)
        G.node.get(node).inDegree = G.inDegree(node)
        G.node.get(node).outDegree = G.outDegree(node)
        G.node.get(node).betweennessCentrality = bc.get(node)
    }
    show_graph_info()

}

function show_graph_info(){
    document.getElementById("graph_info").innerHTML  = jsnx.info(G).replace(/\n/g, "<br />")
}


function set_status_info(info){
    document.getElementById("status_info").innerHTML  = info
}

function remove_graph_info(){
    document.getElementById("graph_info").innerHTML  = ""
}


function uriToStr(uri){
    if(uri.includes("http")){
        let val = uri.split(/#|\//)
        return val[val.length-1]
    }

    return uri
}

function hasDisplayEdgeLable(){
    let checked = document.getElementById("show_link_label").checked
    if(checked){
        d3.selectAll(".edgelabel").attr("display", "block")
    }else{
        d3.selectAll(".edgelabel").attr("display", "none")
    }

    console.log("hasDisplayEdgeLable()", checked)
}



function hasDisplayNodeLable(){
    let checked = document.getElementById("show_node_label").checked
    if(checked){
        d3.selectAll(".nodeLabel").attr("display", "block")
    }else{
        d3.selectAll(".nodeLabel").attr("display", "none")
    }

    console.log("hasDisplayNodeLable()", checked)
}