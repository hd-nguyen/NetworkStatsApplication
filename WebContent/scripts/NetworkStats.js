//Global Variables
var sdnControllerURL = 'http://192.168.0.7:8181';
var sdnControllerUserName = 'admin';
var sdnControllerPassword = 'admin';
var base64EncodedPassword = null;

// Get the values supplied
// Store them in global valiables
// Populate Network Device section
// Show Network Devices
function trackNetworkStatisticsClicked() {

	// sdnControllerURL = $("#url").val();
	// sdnControllerUserName = $("#username").val();
	// sdnControllerPassword = $("#password").val();
	base64EncodedPassword = "Basic "
			+ btoa(sdnControllerUserName + ":" + sdnControllerPassword);

	console.log(sdnControllerURL);
	console.log(sdnControllerUserName);
	console.log(sdnControllerPassword);
	console.log(base64EncodedPassword);

	if (ifCredentialsNotNull(sdnControllerUserName, sdnControllerPassword)) {
		populateNetworkNodes();
	} else {
		alert("Trying error cases huhh..? Please enter createndials.");
	}
}

// Fetch network nodes from OpenDaylight
// Populate Network Device section
// Show Network Devices
function populateNetworkNodes() {
	var nodes = null;
	$
			.ajax({
				url : sdnControllerURL
						// + "/controller/nb/v2/switchmanager/default/nodes",
						+ "/restconf/operational/opendaylight-inventory:nodes",
				type : "GET",
				async : false,
				contentType : "application/json",
				success : function(data, textStatus, jqXHR) {
					// console.log(data);
					nodes = data.nodes;
				},
				error : function(jqXHR, textStatus, errorThrown) {
					alert("Unable to fetch OpenDaylight Nodes.\nDid you supply the credentials correct?");
				},
				beforeSend : function(xhr) {
					// Default Base64 Encoding for (admin/admin)
					xhr
							.setRequestHeader("Authorization",
									base64EncodedPassword);
				}
			});

	if (nodes != null && nodes != undefined) {
		// Construct divs
		// $.each(nodes.nodeProperties, function(index, value) {
		// 	var div = getNetworkDeviceDiv(value.properties.description.value,
		// 			value.node.id, value.properties.macAddress.value,
		// 			value.properties.timeStamp.value);
		// 	$("#nodesDiv").append(div);
		// });
		/*Table style*/
		div = '<div><table class="table table-hover">'
			+ '<thead><tr>'
			+ '<th>No.</th>'
			+ '<th>Node Id</th>'
			+ '<th>IP address</th>'
			+ '<th>Type</th>'
			+ '<th>SW version</th>'
			+ '<th>N_connectors</th>'
			+ '<th>Stats</th>'
			+ '</tr></thead><tbody>';

		var prefix = "flow-node-inventory:"
		$.each(nodes.node, function(index, node) {
			// console.log(node);
			div += getNetworkDeviceDiv(
				index + 1,
				node.id,
				node[prefix+'ip-address'],
				node[prefix+'hardware'],
				node[prefix+'software'],
				node['node-connector'].length
				);
			/*Thumbnail style*/
			// $("#nodesDiv").append(div);
		});
		div += '</tbody></table></div>';
		/*Table style*/
		$("#nodesDiv").append(div);

		$("#nodesDiv").removeClass("hidden").addClass("visible");
		$("#nodesButton").removeClass("visible").addClass("hidden");

	}

}

// Method to create the network device div programatically
// No logic here, just plain factory generating divs on supplied inputs
function getNetworkDeviceDiv(idx, id, ip, type, software, numOfConnectors) {
	/*Thumbnail style*/
	// var div = '<div class="col-sm-4 col-md-3"><div class="thumbnail"><br /> <br /> <img src="img/device.png"><div class="caption">';
	// // div += '<h4>' + id + '</h4>';
	// div += '<ul class="list-group">';
	// div += '<li class="list-group-item"><b>Id:</b> ' + id + '</li>';
	// div += '<li class="list-group-item"><b>IP:</b> ' + ip + '</li>';
	// div += '<li class="list-group-item"><b>Type:</b> ' + type + '</li>';
	// div += '<li class="list-group-item"><b>Software version:</b> ' + software + '</li>';
	// div += '<li class="list-group-item"><b>Number of connectors:</b> ' + numOfConnectors + '</li>';
	// div += '</ul><p>';
	// div += '<a href="javascript:showSwitchPortStats(\''
	// 		+ id + '\')" class="btn btn-success" role="button">Port Stats</a> &nbsp;&nbsp;';
	// div += '<a href="javascript:showSwitchTableStats(\''
	// 		+ id + '\')" class="btn btn-success" role="button">Table Stats</a>';
	// div += '</p></div></div></div>';

	/*Table style*/
	div = '<tr>'
		+ '<td>'+idx+'</td>'
		+ '<td>'+id+'</td>'
		+ '<td>'+ip+'</td>'
		+ '<td>'+type+'</td>'
		+ '<td>'+software+'</td>'
		+ '<td>'+numOfConnectors+'</td>'
		+ '<td>'
			+'<a href="javascript:showSwitchPortStats(\''
			+ id + '\')" class="btn btn-success btn-sm" role="button">Port</a> &nbsp;'
			+'<a href="javascript:showSwitchTableStats(\''
			+ id + '\')" class="btn btn-success btn-sm" role="button">Table</a> &nbsp;'
			+'</td>'
		+ '</tr>';
	return div;
}

// Fetch ports for a node from OpenDaylight
// Populate ports stats section
function showSwitchPortStats(id) {
	var ports = null;
	$.ajax({
		url : sdnControllerURL
				// + "/controller/nb/v2/statistics/default/port/node/OF/"
				+ "/restconf/operational/opendaylight-inventory:nodes/node/"
				+ id,
		type : "GET",
		async : false,
		contentType : "application/json",
		success : function(data, textStatus, jqXHR) {
			// console.log(data.node[0]['node-connector']);
			ports = data.node[0]['node-connector'];
		},
		error : function(jqXHR, textStatus, errorThrown) {
			alert("Unable to fetch OpenDaylight Node Ports.\nDid you supply the credentials correct?");
		},
		beforeSend : function(xhr) {
			// Default Base64 Encoding for (admin/admin)
			xhr.setRequestHeader("Authorization", base64EncodedPassword);
		}
	});

	if (ports != null && ports != undefined) {
		// Construct divs
		var finalDiv = '<div class="col-lg-12"><div class="panel panel-success"><div class="panel-heading">';
		finalDiv += '<h4>' + id + ' - Port Statistics</h4>';
		finalDiv += '</div><div class="panel-body">';
		var prefix = 'flow-node-inventory:';
		// For each port create a sub element in the final div
		$.each(ports, function(index, value) {
			var portStats = value['opendaylight-port-statistics:flow-capable-node-connector-statistics'];
			var div = getPortsDiv(
				// value.id,
				value[prefix + "name"],
				value[prefix + "port-number"],
				value[prefix + "hardware-address"],
				portStats.packets.received,
				portStats.packets.transmitted,
				portStats.bytes.received,
				portStats.bytes.transmitted,
				portStats['receive-drops'],
				portStats['transmit-drops'],
				portStats['receive-errors'],
				portStats['transmit-errors']
			);
			finalDiv += div;
		});

		finalDiv += '</div></div></div>';
		$("#portDiv").append(finalDiv);
		$("#portDiv").removeClass("hidden").addClass("visible");
		$("#portButton").removeClass("visible").addClass("hidden");

	}

}

// Method to create the port stats div programatically
// No logic here, just plain factory generating divs on supplied inputs
function getPortsDiv(portName, portNumber, mac, receivePackets, transmitPackets, receiveBytes,
		transmitBytes, receiveDrops, transmitDrops, receiveErrors, transmitErrors) {
	var div = '<div class="col-sm-2 col-md-2"><div class="thumbnail"><img src="img/port.png" alt="..." height="60" width="60"><div class="caption">';
	div += '<p align="center">' + portName + ' ('+ portNumber +')</p></div>';
	div += 'MAC: ' + mac 
			+ '<br /> Packet Rx: ' + receivePackets
			+ '<br /> Packet Tx: ' + transmitPackets
			+ '<br />Byte Rx: ' + receiveBytes
			+ '<br />Byte Tx: ' + transmitBytes
			+ '<br />Drop Rx: ' + receiveDrops
			+ '<br />Drop Tx: ' + transmitDrops
			+ '<br />Error Rx: ' + receiveErrors
			+ '<br />Error Tx: ' + transmitErrors
			+ '</div></div>';
	return div;
}

// Fetch table stats for a node from OpenDaylight
// Populate table stats section
function showSwitchTableStats(id) {
	var table = null;
	$.ajax({
			url : sdnControllerURL
					// + "/controller/nb/v2/statistics/default/table/node/OF/"
					+ "/restconf/operational/opendaylight-inventory:nodes/node/"
					+ id,
			type : "GET",
			async : false,
			contentType : "application/json",
			success : function(data, textStatus, jqXHR) {
				//console.log(data.node[0]['flow-node-inventory:table']);
				table = data.node[0]['flow-node-inventory:table'];
			},
			error : function(jqXHR, textStatus, errorThrown) {
				alert("Unable to fetch OpenDaylight Node Table Stats.\nDid you supply the credentials correct?");
			},
			beforeSend : function(xhr) {
				// Default Base64 Encoding for (admin/admin)
				xhr.setRequestHeader("Authorization", base64EncodedPassword);
			}
		});

	if (table != null && table != undefined) {
		// Construct divs
		var firstTable = null;
		var finalDiv = '<div class="col-lg-12"><div class="panel panel-success"><div class="panel-heading">';
		finalDiv += '<h4>' + id + ' - Table Statistics</h4>';

		// I'm only considering one table for this demo project.
		// You can actually iterate thru them to have multiple as per OF spec
		$.each(table, function(index, value) {
			if(value.id == 0) {
				// console.log(value);
				firstTable = value;
				return;
			}
		});

		flows = firstTable.flow;
		tableStats = firstTable['opendaylight-flow-table-statistics:flow-table-statistics'];

		finalDiv += '</div><div class="panel-body"><p>Table Id: '
				+ firstTable.id + '</p></div>';
		finalDiv += '<ul class="list-group">';
		finalDiv += '<li class="list-group-item"><span class="badge badge-success">'
				+ tableStats['active-flows'] + '</span>Active Flows Count</li>';
		finalDiv += '<li class="list-group-item"><span class="badge badge-success">'
				+ tableStats['packets-looked-up'] + '</span>Lookup Packets Count</li>';
		finalDiv += '<li class="list-group-item"><span class="badge badge-success">'
				+ tableStats['packets-matched'] + '</span>Matched Packets Count</li>';
		if(flows != undefined){
			finalDiv += '<li class="list-group-item"><span class="badge badge-success">'
					+ flows.length
					+ '</span>Number of flow entries</li>';
			// finalDiv += '<li class="list-group-item"><span class="badge badge-success">'
			// 		+ tableStats['table-features']['max-entries']
			// 		+ '</span>Max Supported Entries</li>';
			if(flows.length > 0){
				finalDiv += '<div><table class="table table-hover" style="font-size: smaller">'
						+ '<thead><tr>'
						+ '<th>Flow Id</th>'
						+ '<th>Cookie</th>'
						+ '<th>Duration(s)</th>'
						+ '<th>Priority</th>'
						+ '<th>N_packets</th>'
						+ '<th>N_bytes</th>'
						+ '<th>Idle-timeout</th>'
						+ '<th>In_port</th>'
						+ '<th>Src</th>'
						+ '<th>Dest</th>'
						+ '<th>Actions</th>'
						+ '</tr></thead><tbody>';
				$.each(flows, function(ind, flow) {
					flowMatch = flow.match;
					// console.log(flow);
					flowActs = flow.instructions.instruction[0]['apply-actions'];
					flowStats = flow['opendaylight-flow-statistics:flow-statistics'];
					finalDiv += '<tr>'
							+ '<td>'+flow.id+'</td>'
							+ '<td>'+flow.cookie+'</td>'
							+ '<td>'+flowStats.duration.second+'</td>'
							+ '<td>'+flow.priority+'</td>'
							+ '<td>'+flowStats['packet-count']+'</td>'
							+ '<td>'+flowStats['byte-count']+'</td>'
							+ '<td>'+flow['idle-timeout']+'</td>';
							if(flowMatch['in-port'] != undefined){
								// console.log(flows);
								if(flowMatch['in-port'].includes('openflow'))
									finalDiv += '<td>'+flowMatch['in-port'].split(':')[2]+'</td>';
								else
									finalDiv += '<td>'+flowMatch['in-port']+'</td>';
							} else {
								finalDiv += '<td>N/A/td>'
							}
							var addr = getAddressesInFlow(flowMatch);
							finalDiv += '<td>'+ addr['src'] + '</td>'
									+ '<td>'+ addr['dst'] + '</td>'
									+ '<td>'+ flowActs.action[0]['output-action']['output-node-connector'];
									if(flowActs.action.length > 1){
										$.each(flowActs.action, function(k,action){
											if(k>0){
												finalDiv += ', ' + action['output-action']['output-node-connector'];
											}
										});
									}
									finalDiv += '</td>';
							finalDiv += '</tr>';	
				});
				finalDiv += '</tbody></table></div>';
			}
		}

		finalDiv += '</ul></div></div>';

		$("#tableDiv").append(finalDiv);
		$("#tableDiv").removeClass("hidden").addClass("visible");
		$("#tableButton").removeClass("visible").addClass("hidden");
	}
}

function getAddressesInFlow(flowMatch){
	var addr = {'src':'N/A', 'dst':'N/A'};
	if(flowMatch['ethernet-match'] != undefined){
		ethMatch = flowMatch['ethernet-match'];
		if(ethMatch['ethernet-source'] != undefined){
			addr['dst'] = ethMatch['ethernet-source'].address;
		}
		if(ethMatch['ethernet-destination'] != undefined){
			addr['dst'] = ethMatch['ethernet-destination'].address;
		}
	}
	if(flowMatch['ipv6-source'] != undefined){
		addr['dst'] = flowMatch['ipv6-source'];
	}
	if(flowMatch['ipv6-destination'] != undefined){
		addr['dst'] = flowMatch['ipv6-destination'];
	}

	if(flowMatch['ipv4-source'] != undefined){
		addr['dst'] = flowMatch['ipv4-source'];
	}
	if(flowMatch['ipv4-destination'] != undefined){
		addr['dst'] = flowMatch['ipv4-destination'];
	}
	return addr;
}
// Utility function to check not null user name password
function ifCredentialsNotNull(username, password) {
	if (username != null && password != null && username != ''
			&& password != '') {
		return true;
	}
	return false;
}