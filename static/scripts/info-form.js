// Функция проверки валидности полей
function validateForm(name, phone, question) {
    return new Promise((resolve, reject) => {
        // Если поле имя не заполнено
        if (!name.length) reject("Вы не заполнили поле имя!")

        // Проверка максимальной длины имени
        if (name.length > 80) reject("Длина имени не может превышать 80 символов!")

        // Проверка поля Номер телефона на регулярном выражении (является ли значение числом) или не равен 10 символам
        let rePhone = /^-?\d+$/
        if (!rePhone.test(phone) || phone.length !== 10) {
            reject("Неверный формат номера телефона!")
        }

        // Проверка максимальной длины вопроса
        if (question.length > 200) reject("Длина вопроса не может превышать 200 символов!")

        resolve() // Если прошло все проверки
    })
}

// Маска ввода номера телефона
const infoPhoneMask = IMask($("#info-phone").get(0), {mask: "000 000 00 00"})

// Поле name, удаление лишних пробелов
$("#info-name").on("change", () => {
    $("#info-name").val($("#info-name").val().replace(/ +/g, " ").trim())
})

// Автоматические скрытие ошибки при обновлении инпутов
$(".info__form input").on("input", () => {
    $(".form-error").hide() // Прячем ошибку
})

$(".info__form").submit((event) => {
    event.preventDefault() // Отключение базового перехода
    $(".form-error").hide() // Прячем ошибку

    // Получаем поля из фомы
    const formData = new FormData($(".info__form").get(0))
    const formName = formData.get("info-name").trim()
    const formPhone = infoPhoneMask.unmaskedValue.trim()
    const formQuestion = "Без вопроса"

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
            success: () => {
                localStorage.infoFormSuccess = "true"
                infoFormSuccess()
            }
        })

        localStorage.infoFormSuccess = "true"
        infoFormSuccess()
    })
    .catch(error => {
        // Показываем ошибку под конкретной формой
        $("#info-form-error").text(error).show()
    })
})

// Отображаем текст после отправки формы
function infoFormSuccess() {
    $(".info__form").remove()
    $(".info-inner p").remove()
    $(".info__form-success").remove() // Фикс бага с двойным отображением текста
    $(".info-inner").append(`
        <div class="info__form-success">
            <h3>Заявка успешно отправлена!</h3>
            <p>Ожидайте звонка в ближайшее время</p>
        </div>
    `)
}

// Если форма отправлена
if (localStorage.infoFormSuccess) {
    infoFormSuccess()
} else {
    $(".info__form").css("visibility", "visible")
    $(".info-inner p").css("visibility", "visible")
}