// Открытие дополнительных комментариев
$("#reviews-more").on("click tap", () => {
    $("#reviews-more").remove()
    $(".review.phone-hide").removeClass("phone-hide")
})