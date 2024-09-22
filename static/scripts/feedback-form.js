// Маска ввода номера телефона
const FBPhoneMask = IMask($("#feedback-phone").get(0), {mask: "000 000 00 00"})

// Поле name, удаление лишних пробелов
$("#feedback-name").on("change", () => {
    $("#info-name").val($("#info-name").val().replace(/ +/g, " ").trim())
})

// Автоматические скрытие ошибки при обновлении инпутов
$(".feedback__form input").on("input", () => {
    $(".form-error").hide() // Прячем ошибку
})

$(".feedback__form").submit((event) => {
    event.preventDefault() // Отключение базового перехода
    $(".form-error").hide() // Прячем ошибку

    // Получаем поля из фомы
    const formData = new FormData($(".feedback__form").get(0))
    const formName = formData.get("feedback-name").trim()
    const formPhone = FBPhoneMask.unmaskedValue.trim()
    const formQuestion = formData.get("feedback-question").trim() || "Без вопроса"

    // Проверяем валидность  полей
    validateForm(formName, formPhone, formQuestion).then(() => {
        // Если все проверки прошло - отключаем кнопку и ждем ответа от сервера
        $("#info-form-submit").attr("disabled", true)
        
        let data = {
            name: formName,
            phone: "+7" + formPhone,
            answer: formQuestion
        }
        
        $.ajax({
            url: urlPostPeople,
            method: "POST",
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            dataType: "json",
            success: (data) => {
                console.log(data);
                console.log("success");
            },
        })
    })
    .catch(error => {
        // Показываем ошибку под конкретной формой
        $("#feedback-form-error").text(error).show()
    })
})