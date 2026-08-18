const depth = input.depth || 1;
const categoryUrls = [];
const articleUrls = [];
let nextPage = null;

if (depth === 1 || depth === 2) {
    $('#main-content article.mh-posts-list-item').each((i, el) => {
        const url = $(el).find('h3.entry-title a').attr('href');
        
        if (url) {
            const cleanUrl = url.split('#')[0];
            
            if (cleanUrl.includes('/category/')) {
                categoryUrls.push(cleanUrl);
            } else {
                articleUrls.push(cleanUrl);
            }
        }
    });

    if (depth === 1) {
        $('a').each((i, el) => {
            const url = $(el).attr('href');
            if (url && url.includes('/category/')) {
                categoryUrls.push(url.split('#')[0]);
            }
        });
    }
    
    nextPage = $('link[rel="next"]').attr('href') || $('a.next.page-numbers').attr('href');
}

return {
    category_urls: [...new Set(categoryUrls)],
    article_urls: [...new Set(articleUrls)],
    next_page: nextPage
};