from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class People(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(20), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    answer = db.Column(db.String(200))


    def to_dict(self):
        return {
            'id': self.id,
            'phone': self.phone,
            'name': self.name,
            'answer': self.answer,
        }
