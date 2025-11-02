import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import vision from "@google-cloud/vision";

initializeApp();
const db = getFirestore();
const storage = getStorage();
const visionClient = new vision.ImageAnnotatorClient();

export const studentCardVerifier = onObjectFinalized(
  { bucket: "ton-bucket.appspot.com" },
  async (event) => {
    const filePath = event.data.name;
    if (!filePath.startsWith("student_cards/")) return;

    const userId = filePath.split("/")[1].split(".")[0];
    const bucket = storage.bucket(event.data.bucket);
    const file = bucket.file(filePath);

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 10 * 60 * 1000,
    });

    try {
      const [result] = await visionClient.textDetection(url);
      const detections = result.textAnnotations;
      const fullText = detections?.[0]?.description?.toLowerCase() || "";

      const hasCarteEtudiante = fullText.includes("carte étudiante");
      const yearMatch = fullText.match(/20\d{2}/g);
      let isYearValid = false;

      if (yearMatch) {
        const now = new Date();
        const month = now.getMonth() + 1;
        for (const y of yearMatch.map(Number)) {
          const start = new Date(y, 8, 1); // Septembre
          const end = new Date(y + 1, 7, 31); // Août suivant
          if (now >= start && now <= end) {
            isYearValid = true;
            break;
          }
        }
      }

      const isValid = hasCarteEtudiante && isYearValid;

      await db.collection("users").doc(userId).update({
        studentVerificationStatus: isValid ? "verified" : "rejected",
        verificationCheckedAt: new Date(),
      });

      console.log(
        `Carte ${userId} → ${isValid ? "✅ Vérifiée" : "❌ Refusée"}`
      );
    } catch (err) {
      console.error(err);
      await db.collection("users").doc(userId).update({
        studentVerificationStatus: "rejected",
        verificationError: err.message,
      });
    }
  }
);
