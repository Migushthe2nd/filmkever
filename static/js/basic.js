// import {getCorrectEventName} from '@material/animation';
// const eventToListenFor = getCorrectEventName(window, 'animationstart');
// $(document).ready(function () {
//     $(".item").hover(function () {
//         $('.actions', this).addClass("hover");
//     }, function () {
//         $('.actions', this).removeClass("hover");
//     });
// })

function actionPost(post_, mediatypeID, ids, value) {
    let query =
        "&mediatypeID=" + mediatypeID +
        "&ids=" + JSON.stringify(ids)
    console.log(`/api/post/${post_}/${value ? "add" : "remove"}`, query)
    $.ajax({
        type: "POST",
        url: `/api/post/${post_}/${value ? "add" : "remove"}`,
        data: query
    });
}

function itemTogglePost(element) {
    var mediatypeID
    var ids
    if (typeof summary !== 'undefined') {
        mediatypeID = summary.mediatypeID
        ids = summary.ids
    } else {
        console.log($(element).closest('.hover_box'))
        let type = $(element).closest('.hover_box').attr('type')
        if (type == 'movie') { mediatypeID = 1 }
        else if (type == 'show') { mediatypeID = 2 }
        ids = {
            trakt: $(element).closest('.hover_box').data('traktID'),
            slug: $(element).closest('.hover_box').data('slug'),
            tvdb: $(element).closest('.hover_box').data('tvdbID'),
            imdb: $(element).closest('.hover_box').data('imdbID'),
            tmdb: $(element).closest('.hover_box').data('tmdbID')
        }
    }

    $(element).toggleClass("on")
    if ($(element).hasClass("on")) {
        actionPost($(element).attr("post_"), mediatypeID, ids, true)
    } else {
        actionPost($(element).attr("post_"), mediatypeID, ids, false)
    }
    // $(element).tooltip('enable')
    $(element).addClass("disabled");
    setTimeout(function () {
        // $(element).tooltip('disable')
        $(element).removeClass("disabled");
    }, 1000);
}