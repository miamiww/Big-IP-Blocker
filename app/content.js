var block = false;
var blockingData = {
    "Google": false,
    "Amazon": false,
    "Facebook": false,
    "Microsoft": false
};
var companyData = {};
var container;

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

const initBlocks = () => {
    // port = chrome.runtime.connect({name: "blocker_socket"});
    // port.onMessage.addListener(blockTime);

    chrome.runtime.onMessage.addListener(blockTime);
    chrome.storage.local.get(['blocks'], function(result) {
        if(!isEmpty(result)){
            console.log('Blocking data from local storage is ' + result.blocks);
            blockingData = result.blocks;
        } else{
            console.log('No user input on blocking, allow everything')
        }


    });
}

const blockTime = (data,sender,sendResponse) => {

    if(data.type=="blockPage"){
        // window.location.replace(block_url);
        if(!block){
            if(data.company == "Google"){
                if(blockingData.Google){
                    buildBlockPage(data);
                }
    
            }
            if(data.company == "Amazon"){
                if(blockingData.Amazon){
                    buildBlockPage(data)
                }
    
            }
            if(data.company == "Facebook"){
                if(blockingData.Facebook){
                    buildBlockPage(data)
                }
    
            }
            if(data.company == "Microsoft"){
                if(blockingData.Microsoft){
                    buildBlockPage(data)
                }
    
            }
    
        } else{
            addBlockPage(data);
            if(data.company == "Google"){
                if(blockingData.Google){
                    console.log(data.url);
                }
    
            }
            if(data.company == "Amazon"){
                if(blockingData.Amazon){
                    console.log(data.url);

                }
    
            }
            if(data.company == "Facebook"){
                if(blockingData.Facebook){
                    console.log(data.url);

                }
    
            }
            if(data.company == "Microsoft"){
                if(blockingData.Microsoft){
                    console.log(data.url);
                }
    
            }
        }
        }

      sendResponse({message: "received"});


}

const blockingText = (data) => {
    return "<br />" + "<strong>Hi there!</strong> This page is locked by Big Tech Detective" +  "<br />"  + " because it loaded a resource from" + "<br />"  + "<br />" + "<i>"+ data.url +"</i>"  + "<br />"+ "<br />"   + "which is owned by "+data.company + "." + "<br />" + "<br />" + "If you wish to access the page, turn off blocking in your extension, and reload the page."
}

const buildBlockPage = (data) => {
    console.log(data);
    console.log('receiving packet data');
    companyData[data.company]=(companyData[data.company]+1) || 1;


    block = true;
    let overlayDiv = document.createElement('div');
    overlayDiv.id = "btd-lock-overlay";
    let contentDiv = document.createElement('div');

    contentDiv.id = "btd-lock-information-container";
    contentDiv.innerHTML = blockingText(data);
    
    let lockDiv = document.createElement('div');
    lockDiv.id = "btd-lock-container";

    let tableDiv = document.createElement('div');
    tableDiv.id = "btd-lock-table";

    contentDiv.appendChild(tableDiv);
    // contentDiv.onload = () => update(companyData);

    document.body.append(overlayDiv);
    document.body.append(contentDiv);
    document.body.append(lockDiv);

    container = d3.select("#btd-lock-table"); 
    update(companyData)


}

const addBlockPage = (data) => {
    console.log(data)
    console.log('receiving packet data');
    companyData[data.company]=(companyData[data.company]+1) || 1;
    update(companyData)
}


// chart stuff


function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}


const buildChart = () => {
    console.log('rebuilding chart')
    // let svg

    // set the dimensions and margins of the graph
    var width = 450
    height = 325
    margin = 65

  
    // set the color scale
    // var color = d3.scaleOrdinal()
    //     .domain(["Amazon","Microsoft","Facebook","Google","Other"])
    //     .range(["#eaaeaa","#00CBB0","#FF5551","#F9DAF5","#AFE5DB"]);
    
    function graph(_selection) {
        _selection.each(function(_data) {	
            console.log("data for chart")
            console.log(_data)


            d3.select(".btd-packet-table").remove();


            var packetArray = [];
            let total = 0;
            for (const prop in _data) {
                total = _data[prop] + total
            }

            for (const prop in _data) {
                packetArray.push([prop, _data[prop],Math.round((_data[prop]*100)/total)+"%"]);;
                console.log(packetArray);
            }
            console.log(packetArray);

            // _data.forEach(function(d, i){
            //     // now we add another data object value, a calculated value.
            //     // here we are making strings into numbers using type coercion
            //     // Add a new array with the values of each:
            //     packetArray.push([d.data.key, d.d.data.value]);
            // });
            var table = d3.select(this).append("table");
            table.classed("btd-packet-table",true)

            var header = table.append("thead").append("tr");
            header
            .selectAll("th")
            .data(["Source","Packet Count","% Total Packets"])
            .enter()
            .append("th")
            .text(function(d) { return d; });
            var tablebody = table.append("tbody");
            rows = tablebody
            .selectAll("tr")
            .data(packetArray)
            .enter()
            .append("tr");
            // We built the rows using the nested array - now each row has its own array.
            cells = rows.selectAll("td")
        // each row has data associated; we get it and enter it for the cells.
            .data(function(d) {
                console.log(d);
                return d;
            })
            .enter()
            .append("td")
            .text(function(d) {
                return d;
            })
            });
        }

    return graph;

}

var updateFunction = buildChart();
function update(data) {
    container.datum(data).call(updateFunction);
}


// end chart stuff

initBlocks();