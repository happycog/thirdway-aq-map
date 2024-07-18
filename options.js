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

