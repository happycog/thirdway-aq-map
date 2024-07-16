
(() => {
	let layerSel, prev_bounds, selectedFtr,	colorFn, $select;
	let data_id = 'num_apd_he';
	let data_cat = 'state';
	let ftrLayers = {'state': null, 'airport': null};
	let ftrGeo = {'state': null, 'airport': null};
	let panel_open = false;
	// Create map
	const map = L.map('map-container', {renderer: L.canvas(), preferCanvas: true})
		.setView([39.8283, -98.5795], 4)
		.setMaxBounds(L.latLngBounds(L.latLng(50, -61), L.latLng(19, -127)));
	// Add attribution
	map.attributionControl.addAttribution('Map created by <A HREF="https://www.indecon.com/" TARGET="_blank">Industrial Economics Incorporated</A>');
	map.attributionControl.addAttribution('Powered by <A HREF="http://esri.maps.arcgis.com/home/index.html" TARGET="_blank">Esri</A>');
	// Add the legend control
	const legend = L.control({position: 'bottomleft'});
	legend.onAdd = _updateLegend;
	// Add the base layer
	L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/{id}/MapServer/tile/{z}/{y}/{x}', {
	    attribution: 'Tile Layer by <A HREF="http://esri.maps.arcgis.com/home/index.html" TARGET="_blank">Esri</A>',
	    minZoom: 4,
	    maxZoom: 16,
	    id: 'World_Light_Gray_Base'
	}).addTo(map);

	// Figure out the data color ranges
	_setChromaRanges();

	// Create the states feature group layer
	$.getJSON('data/cb_2023_states.json', function(data) {
		ftrGeo['state'] = topojson.feature(data, data.objects.cb_2023_states);
		ftrLayers['state'] = L.geoJson(ftrGeo['state'], {
			style: _ftrStyle,
			onEachFeature: function(feature, layer) {
		    layer.on({
		        mouseover: _highlightFeature,
		        mouseout: _resetHighlight,
		        click: _selectFeatureFromMap
		    });
			}
		});
		if (!!ftrLayers['airport']) _activateLayer();
	});

	// Create the airport feature group layer
	$.getJSON('data/FAA_Top_200_Airports.json', function(data) {
			ftrGeo['airport'] = topojson.feature(data, data.objects.FAA_Top_200_Airports);
			ftrLayers['airport'] = L.geoJson(ftrGeo['airport'], {
				style: _ftrStyle,
				pointToLayer: function (feature, latlng) {
					return L.circleMarker(latlng, styles['airport']);
				},
				onEachFeature: function(feature, layer) {
					layer.on({
						mouseover: _highlightFeature,
						mouseout: _resetHighlight,
						click: _selectFeatureFromMap
					});
				}
			});
		if (!!ftrLayers['state']) _activateLayer();
	});

	// Build the slide reveal
	const infoPanel = $("#info-panel").slideReveal({
		trigger: $("#trigger"),
		push: false,
		position: "right",
		width: 325,
		speed: 500,
		hide: function(p, o) { p.removeClass('panel-shadow'); },
		hidden: _closePanel,
		show: function(p, o) { p.addClass('panel-shadow'); },
		shown: function() { panel_open = true;}
	});
	
	$('#info-panel .close-button').on('click', function(){$('#info-panel').slideReveal('hide');})
	$('#layer-switch').on('click', () => _activateLayer(true));
	
	// _initTypeahead();


	function _activateLayer(toggle) {
		if (!!toggle) {
			if (panel_open) {
				$('#info-panel').slideReveal('hide');
			}
			// Remove the old feature group layer
			ftrLayers[data_cat].remove();
			data_cat = data_cat === 'state' ? 'airport' : 'state';
			// Recalculate the data color ranges
			$select.change();
		}
		// Activate the feature layer
		ftrLayers[data_cat].addTo(map);
	}

	function _updateLegend() {
		const div = L.DomUtil.create('div', 'map-ctrl legend');
		const scale = colorFn.classes();
		const option = data_config.find(function(o){return o.ref_id === data_id});
		let txt, lowval, highval;
		for (let x = 0, y = scale.length - 1; x<y; x++) {
			lowval = x === 0 ? '' : __formatVal(scale[x]);
			highval = x === y - 1 ? '' : __formatVal(scale[x + 1] - (Math.pow(10, -1 * option.decimal_places)));
			txt = lowval == '' ? '&lt;=&nbsp;' + highval : (highval == '' ? lowval + '&nbsp;+' : lowval + '&nbsp;&ndash;&nbsp;' + highval);
			div.innerHTML += '<div><i style="background-color:' + colorFn(scale[x]) + '"></i> ' + txt + '</div>';
		}
		if (!$select) _buildSelect();
		$(div).prepend($select);
		$(div).append("<div style='text-align:right;font-size:12px;color:#505050'>IEc (2050) report values</div>");
		return div;

		function __formatVal(val) {
			return (option.currency ? '$' : '') + val.toLocaleString();
		}
	};
	
	function _setChromaRanges() {
		const data = iecData[data_cat][data_id];
		const option = data_config.find(function(o){return o.ref_id === data_id});
		let vals = [];
		let ranges = [];
		for (key in data) {
			vals.push(data[key]);
		}
		vals.sort(function(a, b){return a - b});
		// Let chroma take a first pass at our numbers and break them into ranges
		ranges = chroma.limits(vals, 'q', scale_color_count);
		// Now round those ranges off to avoid insane decimal placements
		ranges = ranges.map(function(o) {
			return Number(o.toFixed(o >= 10 ? 0 : 1));
		});
		
		colorFn = chroma.scale(option.chroma_scale).classes(ranges);
		
		if (!!legend) legend.remove();
		legend.addTo(map);
	}	
	
	function _ftrStyle(feature) {
		return Object.assign({}, styles[data_cat],{fillColor: _getColor(feature.properties.UNIQUE_ID || feature.properties.STUSPS)});
	}

	function _getColor(id) {
		const  data = iecData[data_cat][data_id];
		return colorFn(data[id]).hex();
	}	
	
	function _highlightFeature(e) {
		const fg = e.target;
		fg.setStyle(styles['highlight']);
		fg.bringToFront();
	}

	function _resetHighlight(e) {
		ftrLayers[data_cat].resetStyle();
	}

	function _selectFeatureFromMap(e) {
		_selectFeature(e.target.feature);
	}
	
	function _selectFeature(ftr) {
    selectedFtr = ftr;
    const id = ftr.properties.UNIQUE_ID || ftr.properties.STUSPS;
    // If the side panel hasn't been opened then store the current bounds
    if (!panel_open) prev_bounds = map.getBounds();
		// Remove the previous selected layer if one exists
		if (!!layerSel) layerSel.remove();
		// Now create a new layer from the geometry
		layerSel = L.GeoJSON.geometryToLayer(ftr.geometry);
		if (data_cat === 'state') {
			layerSel.setStyle(Object.assign({}, styles['selected'], {fillColor: _getColor(id)}));
			layerSel.addTo(map);
			// Bring it to the front so it stays visible
			layerSel.bringToFront();
			// Fly to the selected feature
			map.flyToBounds(layerSel.getBounds(),{paddingBottomRight: [450, 0], maxZoom: 8});
		} else {
			layerSel.addTo(map);
		}
		// Now open the side panel
		_displayInfoPanel();
	}
	
	function _buildSelect() {
		$select = $('<select id="dataset-sel"></select>');
		data_config.forEach(
			function(o) {
				$select.append('<OPTION value="' + o.ref_id + '">' + o.name);
			}
		);
		$select.on('change', function() {
			data_id = this.value;
			_setChromaRanges();
			ftrLayers[data_cat].clearLayers();
			ftrLayers[data_cat].addData(ftrGeo[data_cat]);
		});
		
	}
	
	function _initTypeahead() {
		// Create an array of the counties with State Abbreviations appended (for duplicate names)
		// var counties = counties_geojson.features.map(
		// 	function(o) {
		// 		var props = o.properties;
		// 		var state_id = props.GEOID.slice(0,2);
		// 		var state_abbrev = state_codes[state_id].abbrev;
		// 		var cty_name = _fullCountyTitle(o) + ' (' + state_abbrev + ')';
		// 		return {'text': cty_name, 'feature': o};
		// 	}
		// );

		var bh_engine = new Bloodhound({
		    local: counties,
		    queryTokenizer: Bloodhound.tokenizers.whitespace,
		    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('text'),
		    sufficient: Infinity,
		    remote: {
		        url: arcgis_sug_url,
		        wildcard: '%TEXT',
		        rateLimitWait: 500,
		        transform: function(o) {		        	
		        	return bh_engine.sorter(o.suggestions);
		        }
	    	},
	    	sorter: function(a,b){
	    		return a.text.toUpperCase() < b.text.toUpperCase() ? -1 : 1;
	    	}
		});
				
		$('.typeahead').typeahead({
			  hint: true,
			  highlight: true,
			  minLength: 4			  
			}, {
			name: 'ctys',
			display: 'text',
			source: bh_engine,
			async: true,
			limit: Infinity
		}).bind('typeahead:select', function(ev, suggestion) {
			if (!!suggestion.feature) {
				// This is a county from our data
				_selectFeature(suggestion.feature);
			} else {
				// This is an item from arcgis suggest
				var params = "SingleLine=" + suggestion.text + "&magicKey=" + suggestion.magicKey;
				$.get(arcgis_find_url + params, function(data) {
					var loc = data.candidates[0].location;
					var results = leafletPip.pointInLayer([loc.x, loc.y], layerCounty, true);
					if (results.length > 0) {
						_selectFeature(results[0].feature);
					}
				});
			};
			// Remove focus from the input field or ESC won't close the info panel
			$('.tt-input').blur();
		});
		
	}
	
	function _closePanel() {
		panel_open = false;
		// Remove the selected layer
		layerSel.remove();
		// Fly back to the previous bounds
		map.flyToBounds(prev_bounds);
	}
	
	function _displayInfoPanel() {
		const id = selectedFtr.properties.UNIQUE_ID || selectedFtr.properties.STUSPS;
		const title = (data_cat === 'state' ? 'State of ' : '') + selectedFtr.properties['NAME'];
		$('.data-container .header').text(title);
		data_config.forEach(function(o){
			$('.data-' + o.ref_id).text(map.name);
			const tmp = iecData[data_cat][o.ref_id];
			const val = o.currency ? '$' + ((tmp[id]/1000).toFixed()*1000).toLocaleString() : tmp[id].toFixed(tmp[id] >= 10 ? 0 : 1);
			$('.data-' + o.ref_id).text(val);
		});
		
		// Open the side panel
		if(! panel_open) {
			infoPanel.slideReveal('show');
		}
	}
	
	function _fullCountyTitle(ftr){
		var name = ftr.properties.NAME
		var lsad = ftr.properties.LSAD;
		return name + (lsad=='00' ? '' : ' ' + lsad_codes[lsad]);
	}
	
})();
