const staticRoutes = [
	'/about',
	'/auth/signin',
	'/dvd-catalog',
	'/help/faq',
	'/help/contact',
	'/policies',
	'/pages/hobby-lobby',
	'/pages/charlie-kirk-citizenship',
	'/pages/radio-citizenship',
	'/learn',
	'/tv/learn-from-hillsdale',
	'/ltv/hillsdale-online'
];

const http = require("https");

const options = {
	"method": "GET",
	"hostname": "deliver.kontent.ai",
	"port": null,
	"path": "/SZA/items?system.type=course&elements=url_slug,hide_from_catalog,prereg_page_campaign_start_date,prereg_page_campaign_end_date",
};

const req = http.request(options, function (res) {
	const chunks = [];

	res.on("data", function (chunk) {
		chunks.push(chunk);
	});

	res.on("end", function () {
		const body = Buffer.concat(chunks);
		// console.log(body.toString());
		try {
			const parsed = JSON.parse(body.toString());
			const mapped = parsed.items
				// ?.filter(i => (i.elements?.hide_from_catalog?.value[0]?.codename ?? 'no') !== 'yes')
				.map(i => i.elements?.url_slug?.value)
				.filter(i => i) ?? [];
			console.log('mapped', mapped);

			let finalRoutes = staticRoutes.concat(mapped.map(i => `/landing/${i}`)).concat('/');

			// for each course, determine whether to pre-render the /register/<courseId> page
			parsed.items.forEach(x => {
				if(!x.elements.prereg_page_campaign_start_date?.value) return;
				const campaignStartDate = new Date(x.elements.prereg_page_campaign_start_date.value);
				// start doing the pre-rendering up to 7 days prior to the campaign starting
				campaignStartDate.setDate(campaignStartDate.getDate() - 7);
				if(campaignStartDate < new Date()){
					if(!x.elements.prereg_page_campaign_end_date?.value || new Date(x.elements.prereg_page_campaign_end_date.value) > new Date()){
						finalRoutes.push(`/register/${x.elements.url_slug.value}`);
					}
				}
			});

			console.log('finalRoutes', finalRoutes.join('\n'));

			require('fs').writeFileSync('./pre-render.routes.txt', finalRoutes.join('\n'));
		} catch (e) {
			console.log('parse failed', e.message, body.toString());
		}
	});
});

req.end();
