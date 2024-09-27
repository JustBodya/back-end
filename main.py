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
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')



@app.before_request
def redirect_non_www():
    if request.host == "igorsavelievsocialstudies.ru":
        return redirect(f"http://www.igorsavelievsocialstudies.ru{request.path}", code=301)
    

@app.route('/')
def index():
    return render_template('index.html')


def send_to_telegram(message):
    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
    data = {
        'chat_id': TELEGRAM_CHAT_ID,
        'text': message
    }
    response = requests.post(url, data=data)
    return response.status_code == 200


@app.route('/people', methods=['GET'])
def get_people():
    people = People.query.all()
    return jsonify([i.to_dict() for i in people])


@app.route('/people', methods=['POST'])
def post_people():

    data = request.get_json()

    if 'phone' not in data or 'name' not in data or 'answer' not in data:
        abort(400, description="Необходимо указать все поля!")

    person = People(phone=data['phone'], name=data['name'], answer=data['answer'])
    db.session.add(person)
    db.session.commit()

    message = f"Добавлен новый человек:\nИмя: {person.name}\nТелефон: {person.phone}\nВопрос: {person.answer}"
    if send_to_telegram(message):
        return jsonify(person.to_dict()), 201
    else:
        return jsonify({"error": "Не удалось отправить сообщение в Telegram"}), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000)
