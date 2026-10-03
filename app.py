from flask import Flask, render_template, request, jsonify, send_from_directory
from PIL import Image
from transformers import pipeline
import io
import os
import json

app = Flask(__name__)

print("Loading AI image model...")

image_classifier = pipeline(
    "zero-shot-image-classification",
    model="openai/clip-vit-base-patch32"
)

print("AI image model loaded successfully.")


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/evidence.json")
@app.route("/api/evidence")
def get_evidence():
    evidence_path = os.path.join(app.root_path, "evidence.json")
    if os.path.exists(evidence_path):
        with open(evidence_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return jsonify(data)
    return jsonify([])


@app.route("/<path:filename>")
def serve_static_fallback(filename):
    static_file_path = os.path.join(app.static_folder, filename)
    if os.path.exists(static_file_path):
        return send_from_directory(app.static_folder, filename)
    return jsonify({"error": "File not found"}), 404


@app.route("/api/analyze", methods=["POST"])
def analyze():

    claim = request.form.get("claim", "").strip()
    image = request.files.get("image")

    if not claim:
        return jsonify({
            "success": False,
            "message": "Please enter a claim."
        }), 400

    disaster_words = {
        "flood": [
            "flood",
            "flooding",
            "water",
            "inundated"
        ],
        "rain": [
            "rain",
            "rainfall",
            "heavy rain"
        ],
        "storm": [
            "storm",
            "cyclone",
            "hurricane",
            "typhoon"
        ],
        "fire": [
            "fire",
            "burning",
            "flames"
        ],
        "accident": [
            "accident",
            "crash",
            "collision"
        ],
        "earthquake": [
            "earthquake",
            "collapsed building",
            "building collapse"
        ]
    }

    if not image or image.filename == '':
        claim_lower = claim.lower()
        matched_category = None

        for category, words in disaster_words.items():
            if any(word in claim_lower for word in words):
                matched_category = category
                break

        if matched_category:
            verdict = "SUPPORTED"
            explanation = (
                f"The claim references a recognized event category ('{matched_category}'). "
                f"Upload a supporting image for visual provenance analysis."
            )
            confidence = 75
        else:
            verdict = "UNVERIFIED"
            explanation = (
                "The claim could not be matched with known disaster categories in the database."
            )
            confidence = 50

        return jsonify({
            "success": True,
            "verdict": verdict,
            "confidence": confidence,
            "claim": claim,
            "image": None,
            "detected_scene": matched_category or "none",
            "visual_score": 0.0,
            "explanation": explanation
        })

    try:
        image_bytes = image.read()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Candidate visual categories
        labels = [
            "a photo showing flooding",
            "a photo showing heavy rain",
            "a photo showing a cyclone or storm",
            "a photo showing a fire",
            "a photo showing a road accident",
            "a photo showing an earthquake or collapsed building",
            "a normal outdoor photograph",
            "a photograph unrelated to a disaster"
        ]

        predictions = image_classifier(
            img,
            candidate_labels=labels
        )

        top_prediction = predictions[0]

        detected_scene = top_prediction["label"]
        visual_score = float(top_prediction["score"])

        # Check whether the claim matches the visual result
        claim_lower = claim.lower()

        matched_category = None

        for category, words in disaster_words.items():
            if any(word in claim_lower for word in words):
                matched_category = category
                break

        # Determine whether the detected image scene matches the claim
        if matched_category == "flood":
            claim_match = "flooding" in detected_scene

        elif matched_category == "rain":
            claim_match = (
                "heavy rain" in detected_scene
                or "flooding" in detected_scene
            )

        elif matched_category == "storm":
            claim_match = "cyclone" in detected_scene or "storm" in detected_scene

        elif matched_category == "fire":
            claim_match = "fire" in detected_scene

        elif matched_category == "accident":
            claim_match = "accident" in detected_scene

        elif matched_category == "earthquake":
            claim_match = "earthquake" in detected_scene

        else:
            claim_match = False

        # Calculate a simple prototype confidence
        confidence = round(visual_score * 100)

        if claim_match and visual_score >= 0.40:
            verdict = "SUPPORTED"
            explanation = (
                f"The AI image model identified the uploaded image as "
                f"'{detected_scene}' with approximately {confidence}% "
                f"visual confidence. This is consistent with the claim."
            )

        elif claim_match:
            verdict = "MIXED"
            explanation = (
                f"The AI image model identified the image as "
                f"'{detected_scene}', but the visual confidence is "
                f"relatively low."
            )

        else:
            verdict = "UNVERIFIED"
            explanation = (
                f"The AI image model identified the image primarily as "
                f"'{detected_scene}'. This does not clearly match the "
                f"claim, so the claim cannot be visually supported."
            )

        result = {
            "success": True,
            "verdict": verdict,
            "confidence": confidence,
            "claim": claim,
            "image": image.filename,
            "detected_scene": detected_scene,
            "visual_score": round(visual_score * 100, 2),
            "explanation": explanation
        }

        return jsonify(result)

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Unable to analyze the uploaded image.",
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)

