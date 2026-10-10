from flask import Flask, render_template, jsonify, request
import numpy as np
import urllib.request
import json

app = Flask(__name__)

TARGETS = [
    {"name": "Tokyo, Japan", "lat": 35.6762, "lon": 139.6503},
    {"name": "New York, USA", "lat": 40.7128, "lon": -74.0060},
    {"name": "London, United Kingdom", "lat": 51.5074, "lon": -0.1278},
    {"name": "Sydney, Australia", "lat": -33.8688, "lon": 151.2093},
    {"name": "Paris, France", "lat": 48.8566, "lon": 2.3522}
]

@app.route('/')
def index():
    return render_template('index.html', targets=TARGETS)

@app.route('/api/compute-circuit', methods=['POST'])
def compute_circuit():
    data = request.json
    lat = float(data.get('lat', 0))
    lon = float(data.get('lon', 0))

    theta = (90.0 - lat) * (np.pi / 180.0)
    phi = (lon + 180.0) * (np.pi / 180.0)

    circuit = []
    if abs(theta) > 0.01:
        circuit.append({"gate": "RY", "angle": f"{theta:.2f}"})
    if abs(phi) > 0.01:
        circuit.append({"gate": "RZ", "angle": f"{phi:.2f}"})
    if not circuit:
        circuit.append({"gate": "I", "angle": "0.00"})

    return jsonify({
        "theta": float(theta),
        "phi": float(phi),
        "circuit": circuit
    })

@app.route('/api/random-state', methods=['GET'])
def random_state():
    theta = float(np.random.uniform(0, np.pi))
    phi = float(np.random.uniform(0, 2 * np.pi))

    lat = float(90.0 - (theta * (180.0 / np.pi)))
    lon = float((phi * (180.0 / np.pi)) - 180.0)
    if lon > 180:
        lon -= 360

    photos = []
    try:
        # Dynamically query Wikimedia Commons / Wikipedia images matching these precise coordinates
        wiki_url = f"https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord={lat}|{lon}&gsradius=50000&gslimit=4&format=json"
        req = urllib.request.Request(wiki_url, headers={'User-Agent': 'QuantumGlobeNavigator/2.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            pages = data.get('query', {}).get('geosearch', [])
            for p in pages:
                pageid = p['pageid']
                detail_url = f"https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|imageinfo&pithumbsize=400&pageids={pageid}&format=json"
                req_detail = urllib.request.Request(detail_url, headers={'User-Agent': 'QuantumGlobeNavigator/2.0'})
                with urllib.request.urlopen(req_detail) as resp_detail:
                    detail_data = json.loads(resp_detail.read().decode())
                    page_info = detail_data.get('query', {}).get('pages', {}).get(str(pageid), {})
                    if 'thumbnail' in page_info:
                        photos.append(page_info['thumbnail']['source'])
    except Exception as e:
        print("Geo-photo fetch error:", e)

    # Fallback contextual imagery if local geotagged photos are sparse in oceans/deserts
    if not photos:
        photos = [
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&auto=format&fit=crop&q=60"
        ]

    return jsonify({
        "theta": theta,
        "phi": phi,
        "lat": lat,
        "lon": lon,
        "photos": photos[:3]
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)