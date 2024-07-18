
(() => {
	let layerSel, prevBounds, selectedFtr,	colorFn, $select;
	let dataId = 'num_apd_he';
	let dataCat = 'state';
	let ftrLayers = {'state': null, 'airport': null};
	let ftrGeo = {'state': null, 'airport': null};
	let panelOpen = false;
	let bh = {};
	let placeholder = {
		state: 'Search by state name or USPS abbreviation',
		airport: 'Search by airport name or FAA location identifier'
	}
	const ta = $('.typeahead');
	// Create map
	const mapBounds = L.latLngBounds(L.latLng(50, -61), L.latLng(19, -127));
	const map = L.map('map-container', {renderer: L.canvas(), preferCanvas: true})
		.setView([39.8283, -98.5795], 4)
		.setMaxBounds(mapBounds);
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
	    maxZoom: 7,
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
				layer.bindTooltip(feature.properties['NAME']);
			}
		});

		const states = ftrGeo['state'].features.map(
			function(o) {
				const props = o.properties;
				return {
					id: props['STATEFP'],
					text: props['NAME'] + ' ' + props['STUSPS'],
					label: props['NAME'] + ' (' + props['STUSPS'] + ')',
					ftr: o
				};
			}
		);

		bh['state'] = new Bloodhound({
			local: states,
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('text'),
			identify: function(obj) { return obj.id; },
			sorter: function(a,b){
				return a.label.toUpperCase() < b.label.toUpperCase() ? -1 : 1;
			}
		});
		_completeInit();
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
				layer.bindTooltip(feature.properties['NAME'] + ' (' + feature.properties['LOC_ID'] + ')');
			}
		});

		const airports = ftrGeo['airport'].features.map(
			function(o) {
				const props = o.properties;
				return {
					id: props['UNIQUE_ID'],
					text: props['NAME'] + ' ' + props['LOC_ID'],
					label: props['NAME'] + ' (' + props['LOC_ID'] + ')',
					ftr: o
				};
			}
		);

		bh['airport'] = new Bloodhound({
			local: airports,
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('text'),
			identify: function(obj) { return obj.id; },
			sorter: function(a,b){
				return a.label.toUpperCase() < b.label.toUpperCase() ? -1 : 1;
			}
		});
		_completeInit();
	});

	// Build the slide reveal
	const infoPanel = $("#info-panel").slideReveal({
		trigger: $("#trigger"),
		push: false,
		position: "right",
		width: 325,
		speed: 250,
		hide: function(p, o) { p.removeClass('panel-shadow'); },
		hidden: _closePanel,
		show: function(p, o) { p.addClass('panel-shadow'); },
		shown: function() { panelOpen = true;}
	});
	
	$('#info-panel .close-button').on('click', function(){$('#info-panel').slideReveal('hide');})
	$('#layer-switch').on('click', (e) => {
		_activateLayer(true);
		$(e.currentTarget).toggleClass('airport', dataCat !== 'airport');
	});
	$('#tt-clear').on('click', _clearTypeahead);


	function _completeInit() {
		if (!!ftrLayers['airport'] && !!ftrLayers['state']) {
			_activateLayer();
			_initTypeahead();
		}
	}

	function _activateLayer(toggle) {
		if (!!toggle) {
			if (panelOpen) {
				// We want to zoom back out to the whole map
				prevBounds = mapBounds;
				$('#info-panel').slideReveal('hide');
			} else {
				// We want to zoom back out to the whole map
				map.flyToBounds(mapBounds);
			}
			// Remove the old feature group layer
			ftrLayers[dataCat].remove();
			dataCat = dataCat === 'state' ? 'airport' : 'state';
			// Recalculate the data color ranges
			_updateFtrColors();
			// Reinit the typeahead
			_clearTypeahead();
			ta.typeahead('destroy');
			_initTypeahead();
		}
		// Activate the feature layer
		ftrLayers[dataCat].addTo(map);
	}

	function _updateLegend() {
		const div = L.DomUtil.create('div', 'map-ctrl legend');
		const scale = colorFn.classes();
		const option = data_config.find(function(o){return o.ref_id === dataId});
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
		const data = iecData[dataCat][dataId];
		const option = data_config.find(function(o){return o.ref_id === dataId});
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
		colorFn = chroma.scale(option.chroma_scale).padding([.2, 0]).classes(ranges);
		if (!!legend) legend.remove();
		legend.addTo(map);
	}	
	
	function _ftrStyle(feature) {
		return Object.assign({}, styles[dataCat],{fillColor: _getColor(feature.properties.UNIQUE_ID || feature.properties.STUSPS)});
	}

	function _getColor(id) {
		const  data = iecData[dataCat][dataId];
		return colorFn(data[id]).hex();
	}	
	
	function _highlightFeature(e) {
		const fg = e.target;
		fg.setStyle(styles['highlight']);
		fg.bringToFront();
	}

	function _resetHighlight(e) {
		ftrLayers[dataCat].resetStyle();
		if (dataCat === 'state' && !!layerSel?.bringToFront) {
			layerSel.bringToFront();
		}
	}

	function _selectFeatureFromMap(e) {
		_selectFeature(e.target.feature);
	}
	
	function _selectFeature(ftr) {
    selectedFtr = ftr;
    const id = ftr.properties.UNIQUE_ID || ftr.properties.STUSPS;
    // If the side panel hasn't been opened then store the current bounds
    if (!panelOpen) prevBounds = map.getBounds();
		// Remove the previous selected layer if one exists
		if (!!layerSel) layerSel.remove();
		// Now create a new layer from the geometry
		layerSel = L.GeoJSON.geometryToLayer(ftr.geometry);
		if (dataCat === 'state') {
			layerSel.setStyle(Object.assign({}, styles['selected'], {fillColor: _getColor(id)}));
			layerSel.addTo(map);
			// Bring it to the front so it stays visible
			layerSel.bringToFront();
			// Fly to the selected feature
			// map.flyToBounds(layerSel.getBounds(),{padding: [100, 100], maxZoom: 7});
		} else {
			// This has to happen for the marker to appear on the map
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
			dataId = this.value;
			_updateFtrColors();
			// If we have a selected state, then we need to update its color and bring it to the front
			if (!!selectedFtr && !!selectedFtr.properties['STUSPS']) {
				const id = selectedFtr.properties['STUSPS'];
				layerSel.setStyle(Object.assign({}, styles['selected'], {fillColor: _getColor(id)}));
				layerSel.bringToFront();
			}
		});
	}

	function _updateFtrColors() {
		_setChromaRanges();
		ftrLayers[dataCat].clearLayers();
		ftrLayers[dataCat].addData(ftrGeo[dataCat]);
	};
	
	function _initTypeahead() {
		ta.typeahead({
			  hint: true,
			  highlight: true,
			  minLength: 2
			}, {
			display: 'label',
			source: bh[dataCat],
			async: true,
			limit: Infinity
		}).bind('typeahead:select', function(ev, suggestion) {
			_selectFeature(suggestion.ftr);
			// Remove focus from the input field or ESC won't close the info panel
			$('.tt-input').blur();
		});

		ta.attr('placeholder', placeholder[dataCat]);
	}

	function _clearTypeahead() {
		ta.typeahead('val', '');
	}
	
	function _closePanel() {
		panelOpen = false;
		// Remove the selected layer
		layerSel.remove();
		layerSel = null;
		selectedFtr = null;
		// Fly back to the previous bounds or map bounds
		map.flyToBounds(prevBounds);
	}
	
	function _displayInfoPanel() {
		const id = selectedFtr.properties.UNIQUE_ID || selectedFtr.properties.STUSPS;
		const title = (dataCat === 'state' ? 'State of ' : '') + selectedFtr.properties['NAME'];
		$('.data-container .header').text(title);
		data_config.forEach(function(o){
			$('.data-' + o.ref_id).text(map.name);
			const tmp = iecData[dataCat][o.ref_id];
			const val = o.currency ? '$' + ((tmp[id]/1000).toFixed()*1000).toLocaleString() : tmp[id].toFixed(tmp[id] >= 10 ? 0 : 1);
			$('.data-' + o.ref_id).text(val);
		});
		
		// Open the side panel
		if(! panelOpen) {
			infoPanel.slideReveal('show');
		}
	}
	
})();
