// Открытие ответов
$(".question button").on("click tap", function() {
    $(this).parent().siblings().removeClass("opened");
    $(this).parent().toggleClass("opened");
})