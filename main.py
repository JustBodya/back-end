from flask import Flask, request, jsonify, abort, render_template, redirect
from flask_cors import CORS
from models import People, db
import requests
import os

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///people.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

CORS(app)

TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

subscribed_users = set()


# Отоброжение главной страницы
@app.route('/')
def index():
    return render_template('index.html')


# XML запрос
@app.route('/sitemap')
def sitemap():
    return app.send_static_file('sitemap.xml')


# Функция фитбэк для того, чтобы чат бот отправлял заявки каждому запустившему бот человеку
@app.route('/webhook', methods=['POST'])
def handle_telegram_webhook():
    data = request.get_json()
    print("Received webhook data:", data)  # Проверка данных, получаемых от Telegram

    if 'message' in data and 'chat' in data['message']:
        chat_id = data['message']['chat']['id']
        print(f"Chat ID added: {chat_id}")  # Проверка, добавляется ли chat_id
        subscribed_users.add(chat_id)
        return jsonify({"status": "ok"}), 200
    
    return jsonify({"error": "Invalid request"}), 400


# Функция отправки заявки в тг канал
def send_to_telegram(message):
    print("Sending message:", message)  # Проверка отправляемого сообщения
    success = True
    for chat_id in subscribed_users:
        url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
        data = {
            'chat_id': chat_id,
            'text': message
        }
        response = requests.post(url, data=data)
        print(f"Response from Telegram for chat_id {chat_id}: {response.status_code} - {response.text}")
        if response.status_code != 200:
            success = False
    
    return success


# Получение данных из БД
@app.route('/people', methods=['GET'])
def get_people():
    people = People.query.all()
    return jsonify([i.to_dict() for i in people])


# Добавление человека и его данных в БД
@app.route('/people', methods=['POST'])
def post_people():
    data = request.get_json()
    print("Received data for new person:", data)  # Проверка входящих данных

    if 'phone' not in data or 'name' not in data or 'answer' not in data:
        abort(400, description="Необходимо указать все поля!")

    person = People(phone=data['phone'], name=data['name'], answer=data['answer'])
    db.session.add(person)
    db.session.commit()

    message = f"Добавлен новый человек:\nИмя: {person.name}\nТелефон: {person.phone}\nВопрос: {person.answer}"
    if send_to_telegram(message):
        print("Message sent successfully.")  # Проверка успешной отправки
        return jsonify(person.to_dict()), 201
    else:
        print("Failed to send message.")  # Проверка неудачной отправки
        return jsonify({"error": "Не удалось отправить сообщение в Telegram"}), 500


# Создание БД и запуск сервера
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000)
