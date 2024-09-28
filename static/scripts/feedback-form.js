// Маска ввода номера телефона
const FBPhoneMask = IMask($("#feedback-phone").get(0), {mask: "000 000 00 00"})

// Поле name, удаление лишних пробелов
$("#feedback-name").on("change", () => {
    $("#feedback-name").val($("#feedback-name").val().replace(/ +/g, " ").trim())
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
        $("#feedback-form-submit").attr("disabled", true)
        
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
            success: () => {
                localStorage.FBFormSuccess = "true"
                FBFormSuccess()
            }
        })

        localStorage.FBFormSuccess = "true"
        FBFormSuccess()
    })
    .catch(error => {
        // Показываем ошибку под конкретной формой
        $("#feedback-form-error").text(error).show()
    })
})

// Отображаем текст после отправки формы
function FBFormSuccess() {
    $(".feedback__form").remove()
    $(".feedback__form-success").remove() // Фикс бага с двойным отображением текста
    $(".feedback-inner").append(`
        <div class="feedback__form-success">
            <h2>Заявка успешно отправлена!</h2>
            <h3>Ожидайте звонка в ближайшее время</h3>
        </div>
    `)
}

// Если форма отправлена
if (localStorage.FBFormSuccess) {
    FBFormSuccess()
} else {
    $(".feedback__form").css("visibility", "visible")
}