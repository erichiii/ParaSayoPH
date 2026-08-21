let parsedRules = {};
try {
    parsedRules = typeof input.rules === 'string' ? JSON.parse(input.rules) : (input.rules || {});
} catch (e) {
    console.warn("Parser warning: input.rules is not a valid JSON string.");
}

const currentDepth = input.depth || 1;
const config = parsedRules?.crawler_config || {};
const depthConfig = config[`depth_${currentDepth}`] || {};

let nextDepthUrls = [];
let nextPage = null;

const defaultSelectors = currentDepth === 1 
    ? ["#main-content article.mh-posts-list-item h3.entry-title a"] 
    : [".entry-content a"];
const defaultPagination = ["link[rel='next']", "a.next.page-numbers"];

const selectors = depthConfig.list_selectors || defaultSelectors;
const paginationSelectors = depthConfig.pagination_selectors || defaultPagination;
const filters = depthConfig.filters || {};

selectors.forEach(selector => {
    $(selector).each((i, el) => {
        const url = $(el).attr(depthConfig.link_attribute || 'href');
        
        if (url) {
            let cleanUrl = url.split('#')[0];
            let isValid = true;
            
            if (filters.must_include && filters.must_include.length > 0) {
                isValid = filters.must_include.some(kw => 
                    cleanUrl.toLowerCase().includes(kw.toLowerCase())
                );
            }
            
            if (isValid && filters.must_exclude && filters.must_exclude.length > 0) {
                isValid = !filters.must_exclude.some(kw => 
                    cleanUrl.toLowerCase().includes(kw.toLowerCase())
                );
            }
            
            if (!config.target_depth && currentDepth === 2) {
                 const defaultExcludes = ['mailto:', 'tel:', '/category/', '/author/', '/page/', 'about', 'contact'];
                 isValid = isValid && cleanUrl.includes('scholarship.com.ph') && 
                           !defaultExcludes.some(kw => cleanUrl.toLowerCase().includes(kw.toLowerCase()));
            }

            if (isValid) {
                nextDepthUrls.push(cleanUrl);
            }
        }
    });
});

for (const pSelector of paginationSelectors) {
    const pUrl = $(pSelector).attr('href');
    if (pUrl) {
        nextPage = pUrl.split('#')[0];
        break; 
    }
}

return {
    next_depth_urls: [...new Set(nextDepthUrls)],
    next_page: nextPage
};