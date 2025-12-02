from flask import Flask, request, jsonify
import os
# Gerekli AI Studio/Gemini kütüphanenizi içe aktarın
from google import genai 

# Uygulamayı başlat
app = Flask(__ekofarm__)

# API Anahtarını Ortam Değişkeninden Al
# Vercel'de ayarladığınız GEMINI_API_KEY değişkenini burada okuyacak.
API_KEY = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=API_KEY)

# Ana Sayfa Rotası (Opsiyonel: Uygulamanın çalışıp çalışmadığını kontrol etmek için)
@app.route('/')
def home():
    return "AI Studio Uygulaması Flask üzerinde çalışıyor!"

# API Servisi Rotası (Bu, Vercel'in çağıracağı ana noktadır)
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # 1. Gelen Veriyi Al
        data = request.json
        prompt = data.get('prompt', 'Varsayılan bir sorgu')
        
        # 2. AI Modelini Çalıştır
        response = client.models.generate_content(
            model='gemini-2.5-flash', # Kullandığınız modeli buraya yazın
            contents=prompt
        )

        # 3. Sonucu Geri Gönder
        return jsonify({
            'success': True,
            'result': response.text
        })
    except Exception as e:
        # Hata Yönetimi
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Opsiyonel: Flask uygulamasını yerelde test etmek için
# if __name__ == '__main__':
#     app.run(debug=True)