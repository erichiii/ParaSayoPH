const depth = input.depth || 1;
const baseUrl = input.url;
const depth2Urls = [];
const extractionUrls = [];
let nextPage = null;

if (depth === 1) {
    $('#main-content article.mh-posts-list-item').each((i, el) => {
        const url = $(el).find('h3.entry-title a').attr('href');
        if (url) depth2Urls.push(url);
    });
    
    nextPage = $('link[rel="next"]').attr('href') || $('a.next.page-numbers').attr('href');
} 

else if (depth === 2) {
    $('.entry-content a').each((i, el) => {
        let url = $(el).attr('href');

        if (url && url.includes('scholarship.com.ph') && 
            !url.includes('/category/') && 
            !url.includes('/author/') && 
            !url.includes('/page/') &&
            !url.includes('about') &&
            !url.includes('contact')) {

            const cleanUrl = url.split('#')[0];
            extractionUrls.push(cleanUrl);
        }
    });

    extractionUrls.push(baseUrl);
}

return {
    depth_2_urls: [...new Set(depth2Urls)],
    extraction_urls: [...new Set(extractionUrls)],
    next_page: nextPage
};