$(document).ready(() => {
    $('#submit').click(() => {
        $.ajax({
        dataType: 'json',
        url: '/scrape',
        success: function(data) {
                console.log(JSON.parse(data));
            }
        })
    })
});