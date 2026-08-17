let extractedResults = [];

// 1. Scoped Extraction: Target only main article cards to ignore sidebars/tickers
$('#main-content article.mh-posts-list-item').each((index, element) => {
    const linkEl = $(element).find('h3.entry-title a');
    const url = linkEl.attr('href');
    const title = linkEl.text().trim();
    
    // Extract category badge and excerpt snippet for potential Stage 2 context
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

// 2. Find the Pagination Link
// The provided HTML uses a <link rel="next"> tag in the head, which is highly reliable
const nextUrl = $('link[rel="next"]').attr('href') || $('a.next.page-numbers').attr('href');

// 3. Return the payload to the Interaction Code
return {
    results: extractedResults,
    next_page: nextUrl
};