var block = false;
var blockingData = {
    "Google": false,
    "Amazon": false,
    "Facebook": false,
    "Microsoft": false
};
var companyData = {};
var copyData = {};
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
            blockingData = result.blocks;
        } else{
            console.log('No user input on blocking, allow everything')
        }


    });
}

const blockTime = (data,sender,sendResponse) => {

    if(data.type=="blockPage"){
        buildCopyData(data,copyData);
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
                    updateResourceList(data);
                }
    
            }
            if(data.company == "Amazon"){
                if(blockingData.Amazon){
                    updateResourceList(data);

                }
    
            }
            if(data.company == "Facebook"){
                if(blockingData.Facebook){
                    updateResourceList(data);


                }
    
            }
            if(data.company == "Microsoft"){
                if(blockingData.Microsoft){
                    updateResourceList(data);
                }
    
            }
        }
        }

      sendResponse({message: "received"});


}

const headingText = (data) => {
    return `Hi there! This page is locked by Big Tech Detective because it loaded a resource from <i>${data.company}</i>.` 
}

const resourceText = (data) => {
    return `<strong>${data.company}:</strong> ${data.url}`
}

const footerText = () => {
    return "<br />" + "<br />" + "If you wish to access the page, turn off blocking in your extension, and reload the page."
}

// + "<br />" + "<br />" + "If you wish to access the page, turn off blocking in your extension, and reload the page."

const buildBlockPage = (data) => {
    companyData[data.company]=(companyData[data.company]+1) || 1;


    block = true;

    // the overlay
    let overlayDiv = document.createElement('div');
    overlayDiv.id = "btd-lock-overlay";

    // begin information section
    let containerDiv = document.createElement('div');
    containerDiv.id = "btd-lock-information-container";

    let contentDiv = document.createElement('div');
    contentDiv.id = "btd-lock-information";
    containerDiv.appendChild(contentDiv);

    // heading
    let headingDiv = document.createElement('div');
    headingDiv.id = "btd-information-heading";
    headingDiv.innerHTML = headingText(data);

    // resource list
    let resourceListDiv = document.createElement('div');
    resourceListDiv.id = "btd-information-resource-list";
    let resourceListItem = document.createElement('p')
    resourceListItem.innerHTML = resourceText(data);
    resourceListDiv.appendChild(resourceListItem)

    // heading for table
    let tableHeadingDiv = document.createElement('div');
    tableHeadingDiv.id = "btd-information-table-heading"
    tableHeadingDiv.innerHTML = "% of packet origins within page"

    // table
    let tableDiv = document.createElement('div');
    tableDiv.id = "btd-lock-table";


    // footer
    let footerDiv = document.createElement('div');
    footerDiv.id = "btd-information-footer";
    footerDiv.innerHTML = footerText();


    // data button
    let dataButton = document.createElement('button');
    dataButton.id = "btd-copy-data-button"
    dataButton.addEventListener('click', (event) => {
        copyTextToClipboard(JSON.stringify(copyData));
      });

    dataButton.innerHTML = "Copy Data to Clipboard"
    // putting the page together
    contentDiv.appendChild(headingDiv);
    contentDiv.appendChild(tableHeadingDiv);
    contentDiv.appendChild(tableDiv);
    contentDiv.appendChild(resourceListDiv);
    contentDiv.appendChild(dataButton);
    contentDiv.appendChild(footerDiv);

    // end information section

    let lockDiv = document.createElement('div');
    lockDiv.id = "btd-lock-container";

    document.body.append(overlayDiv);
    document.body.append(containerDiv);
    document.body.append(lockDiv);

    container = d3.select("#btd-lock-table"); 
    update(companyData)


}

const addBlockPage = (data) => {
    companyData[data.company]=(companyData[data.company]+1) || 1;
    update(companyData)

}

const updateResourceList = (data) => {
    // let resourceList = document.getElementById("btd-information-resource-list")
    let resourceListItem = document.createElement('p')
    resourceListItem.innerHTML = resourceText(data);
    document.getElementById("btd-information-resource-list").appendChild(resourceListItem)

}

const buildCopyData = (inData, copyData) => {
    let size = Object.keys(copyData).length;
    let name = "Packet " + size;
    copyData[name] = {company: inData.company, url: inData.url, ip: inData.ip};


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


            d3.select(".btd-packet-table").remove();


            var packetArray = [];
            let total = 0;
            for (const prop in _data) {
                total = _data[prop] + total
            }

            for (const prop in _data) {
                packetArray.push([prop, _data[prop],Math.round((_data[prop]*100)/total)+"%"]);;
            }

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




// copy/paste data from https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
// const fallbackCopyTextToClipboard = (text) => {
//     var textArea = document.createElement("textarea");
//     textArea.value = text;
    
//     // Avoid scrolling to bottom
//     textArea.style.top = "0";
//     textArea.style.left = "0";
//     textArea.style.position = "fixed";
  
//     document.body.appendChild(textArea);
//     textArea.focus();
//     textArea.select();
  
//     try {
//       var successful = document.execCommand('copy');
//       var msg = successful ? 'successful' : 'unsuccessful';
//       console.log('Fallback: Copying text command was ' + msg);
//     } catch (err) {
//       console.error('Fallback: Oops, unable to copy', err);
//     }
  
//     document.body.removeChild(textArea);
// }

const copyTextToClipboard = (text) => {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
}
  
//   var copyBobBtn = document.querySelector('.js-copy-bob-btn'),
//     copyJaneBtn = document.querySelector('.js-copy-jane-btn');
  
//   copyBobBtn.addEventListener('click', function(event) {
//     copyTextToClipboard('Bob');
//   });
  
  


initBlocks();