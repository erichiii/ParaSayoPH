let extractedResults = [];

$('#main-content article.mh-posts-list-item').each((index, element) => {
    const linkEl = $(element).find('h3.entry-title a');
    const url = linkEl.attr('href');
    const title = linkEl.text().trim();
    const category = $(element).find('.mh-posts-list-caption').text().trim();
    const excerpt = $(element).find('.mh-excerpt p').text().trim();

    if (url) {
        extractedResults.push({
            url: url,
            title: title,
            category: category,
            excerpt: excerpt,
            source_page: input.url 
        });
    }
});

const nextUrl = $('link[rel="next"]').attr('href') || $('a.next.page-numbers').attr('href');

return {
    results: extractedResults,
    next_page: nextUrl
};