const scale_color_count = 5;
const data_config = [
	{
		name: 'Number of avoided premature deaths (high-end estimate)',
		ref_id: 'num_apd_he',
		currency: false,
		decimal_places: 2,
		chroma_scale: ['ffffff', '003049']
	},
	{
		name: 'Number of avoided premature deaths (low-end estimate)',
		ref_id: 'num_apd_le',
		currency: false,
		decimal_places: 2,
		chroma_scale: ['ffffff', '003049']
	},	
	{
		name: 'Total monetized benefits (high-end estimate)',
		ref_id: 'mb_all_he',
		currency: true,
		decimal_places: 0,
		chroma_scale: ['ffffff', 'a7ccb7']
	},	
	{
		name: 'Total monetized benefits (low-end estimate)',
		ref_id: 'mb_all_le',
		currency: true,
		decimal_places: 0,
		chroma_scale: ['ffffff', 'a7ccb7']
	},
	{
		name: 'Monetized benefits - avoided premature deaths (high-end estimate)',
		ref_id: 'mb_deaths_he',
		currency: true,
		decimal_places: 0,
		chroma_scale: ['ffffff', '3e6991']
	},
	{
		name: 'Monetized benefits - avoided premature deaths (low-end estimate)',
		ref_id: 'mb_deaths_le',
		currency: true,
		decimal_places: 0,
		chroma_scale: ['ffffff', '3e6991']
	},
	{
		name: 'Monetized benefits - avoided cases of non-fatal illness (estimate)',
		ref_id: 'mb_illness',
		currency: true,
		decimal_places: 0,
		chroma_scale: ['ffffff', 'f4633a']
	},
];

const styles = {
	state: {
		color: '#eee',
		weight: 1,
		opacity: 1,
		fillOpacity: 1
	},
	airport: {
		radius: 6,
		fillColor: "#ff7800",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 1
	},
	selected: {
		weight: 5,
    color: '#ffae3b',
    fillOpacity: 1
	},
	highlight: {
    weight: 2,
    color: '#ffae3b',
    fillOpacity: 1
  }
}

