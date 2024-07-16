const arcgis_sug_url = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&category=Address,Postal&countryCode=USA&maxSuggestions=15&searchExtent=-127,19,-61,50&text=%TEXT';
const arcgis_find_url = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?forStorage=false&f=json&';
const scale_color_count = 5;
const data_config = [
	{
		name: 'Number of avoided premature deaths (high-end estimate)',
		ref_id: 'num_apd_he',
		currency: false,
		decimal_places: 2,
		chroma_scale: 'Blues'
	},
	{
		name: 'Number of avoided premature deaths (low-end estimate)',
		ref_id: 'num_apd_le',
		currency: false,
		decimal_places: 2,
		chroma_scale: 'Blues'
	},	
	{
		name: 'Total monetized benefits (high-end estimate)',
		ref_id: 'mb_all_he',
		currency: true,
		decimal_places: 0,
		chroma_scale: 'GnBu'
	},	
	{
		name: 'Total monetized benefits (low-end estimate)',
		ref_id: 'mb_all_le',
		currency: true,
		decimal_places: 0,
		chroma_scale: 'GnBu'
	},
	{
		name: 'Monetized benefits - avoided premature deaths (high-end estimate)',
		ref_id: 'mb_deaths_he',
		currency: true,
		decimal_places: 0,
		chroma_scale: 'Purples'
	},
	{
		name: 'Monetized benefits - avoided premature deaths (low-end estimate)',
		ref_id: 'mb_deaths_le',
		currency: true,
		decimal_places: 0,
		chroma_scale: 'Purples'	
	},
	{
		name: 'Monetized benefits - avoided cases of non-fatal illness (estimate)',
		ref_id: 'mb_illness',
		currency: true,
		decimal_places: 0,
		chroma_scale: 'Greens'
	},
];

const styles = {
	state: {
		color: '#cccccc',
		weight: .5,
		opacity: 1,
		fillOpacity: .7
	},
	airport: {
		radius: 4,
		fillColor: "#ff7800",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8
	},
	selected: {
		weight: 5,
        color: '#000',
        fillOpacity: .9
	},
	highlight: {
        weight: 3,
        color: '#666',
        fillOpacity: .7
    }
}


const state_codes = {
		'01': {'abbrev':'AL', name: 'Alabama'},
		'02': {'abbrev':'AK', name: 'Alaska'},
		'04': {'abbrev':'AZ', name: 'Arizona'},
		'05': {'abbrev':'AR', name: 'Arkansas'},
		'06': {'abbrev':'CA', name: 'California'},
		'08': {'abbrev':'CO', name: 'Colorado'},
		'09': {'abbrev':'CT', name: 'Connecticut'},
		'10': {'abbrev':'DE', name: 'Delaware'},
		'11': {'abbrev':'DC', name: 'District of Columbia'},
		'12': {'abbrev':'FL', name: 'Florida'},
		'13': {'abbrev':'GA', name: 'Georgia'},
		'15': {'abbrev':'HI', name: 'Hawaii'},
		'16': {'abbrev':'ID', name: 'Idaho'},
		'17': {'abbrev':'IL', name: 'Illinois'},
		'18': {'abbrev':'IN', name: 'Indiana'},
		'19': {'abbrev':'IA', name: 'Iowa'},
		'20': {'abbrev':'KS', name: 'Kansas'},
		'21': {'abbrev':'KY', name: 'Kentucky'},
		'22': {'abbrev':'LA', name: 'Louisiana'},
		'23': {'abbrev':'ME', name: 'Maine'},
		'24': {'abbrev':'MD', name: 'Maryland'},
		'25': {'abbrev':'MA', name: 'Massachusetts'},
		'26': {'abbrev':'MI', name: 'Michigan'},
		'27': {'abbrev':'MN', name: 'Minnesota'},
		'28': {'abbrev':'MS', name: 'Mississippi'},
		'29': {'abbrev':'MO', name: 'Missouri'},
		'30': {'abbrev':'MT', name: 'Montana'},
		'31': {'abbrev':'NE', name: 'Nebraska'},
		'32': {'abbrev':'NV', name: 'Nevada'},
		'33': {'abbrev':'NH', name: 'New Hampshire'},
		'34': {'abbrev':'NJ', name: 'New Jersey'},
		'35': {'abbrev':'NM', name: 'New Mexico'},
		'36': {'abbrev':'NY', name: 'New York'},
		'37': {'abbrev':'NC', name: 'North Carolina'},
		'38': {'abbrev':'ND', name: 'North Dakota'},
		'39': {'abbrev':'OH', name: 'Ohio'},
		'40': {'abbrev':'OK', name: 'Oklahoma'},
		'41': {'abbrev':'OR', name: 'Oregon'},
		'42': {'abbrev':'PA', name: 'Pennsylvania'},
		'44': {'abbrev':'RI', name: 'Rhode Island'},
		'45': {'abbrev':'SC', name: 'South Carolina'},
		'46': {'abbrev':'SD', name: 'South Dakota'},
		'47': {'abbrev':'TN', name: 'Tennessee'},
		'48': {'abbrev':'TX', name: 'Texas'},
		'49': {'abbrev':'UT', name: 'Utah'},
		'50': {'abbrev':'VT', name: 'Vermont'},
		'51': {'abbrev':'VA', name: 'Virginia'},
		'53': {'abbrev':'WA', name: 'Washington'},
		'54': {'abbrev':'WV', name: 'West Virginia'},
		'55': {'abbrev':'WI', name: 'Wisconsin'},
		'56': {'abbrev':'WY', name: 'Wyoming'},
		'60': {'abbrev':'AS', name: 'American Samoa'},
		'66': {'abbrev':'GU', name: 'Guam'},
		'69': {'abbrev':'MP', name: 'Northern Mariana Islands'},
		'72': {'abbrev':'PR', name: 'Puerto Rico'},
		'74': {'abbrev':'UM', name: 'U.S. Minor Outlying Islands'},
		'78': {'abbrev':'VI', name: 'U.S. Virgin Islands'}
}

const lsad_codes = {
		'00': '',
		'06': 'County',
		'12': 'Municipality',
		'15': 'Parish',
		'25': 'City'
}
