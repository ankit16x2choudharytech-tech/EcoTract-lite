import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";
import {
  ELECTRICITY_FACTORS,
  FOOD_FACTORS,
  TRANSPORT_FACTORS,
  WASTE_FACTORS,
  BADGE_DEFS,
} from "@/lib/carbon";

// Seed demo users + logs so the leaderboard looks alive. Idempotent.
export async function POST() {
  try {
    // ─── Seed badge definitions ────────────────────────
    try {
      const badgeDefsSnap = await firestore.collection("badgeDefs").get();
      if (badgeDefsSnap.empty) {
        for (const def of BADGE_DEFS) {
          let criteria = "manual";
          let threshold = 0;

          if (def.name === "Green Starter") {
            criteria = "loggedDays";
            threshold = 1;
          } else if (def.name === "Eco Explorer") {
            criteria = "loggedDays";
            threshold = 5;
          } else if (def.name === "Carbon Fighter") {
            criteria = "loggedDays";
            threshold = 25;
          } else if (def.name === "Planet Protector") {
            criteria = "streak";
            threshold = 30;
          }

          await firestore.collection("badgeDefs").add({
            name: def.name,
            description: def.description,
            icon: def.icon,
            criteria,
            threshold,
            isDefault: true,
            createdAt: new Date().toISOString(),
          });
        }
        console.log("✅ Badge definitions seeded");
      }
    } catch (badgeErr) {
      console.warn("Could not seed badge definitions:", badgeErr);
    }

    const usersSnap = await firestore.collection("users").get();
    if (usersSnap.size >= 5) {
      return NextResponse.json({ seeded: false, message: "Already seeded." });
    }

    const demoUsers = [
      { name: "Aarav Sharma", xp: 1240, streak: 21, diet: "veg", vehicle: "metro" },
      { name: "Priya Nair", xp: 980, streak: 14, diet: "vegan", vehicle: "cycling" },
      { name: "Rohan Mehta", xp: 760, streak: 9, diet: "nonveg", vehicle: "car" },
      { name: "Sara Khan", xp: 640, streak: 7, diet: "veg", vehicle: "bus" },
      { name: "Dev Patel", xp: 520, streak: 5, diet: "nonveg", vehicle: "bike" },
      { name: "Isha Verma", xp: 410, streak: 3, diet: "vegan", vehicle: "walking" },
    ];

    const modes = ["car", "bike", "bus", "metro", "train", "walking", "cycling"];
    const diets = ["veg", "vegan", "nonveg"] as const;

    for (let i = 0; i < demoUsers.length; i++) {
      const d = demoUsers[i];
      const email = `demo${i + 1}@ecotrack.app`;

      const existing = await firestore
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!existing.empty) continue;

      const userRef = await firestore.collection("users").add({
        email,
        name: d.name,
        xp: d.xp,
        streak: d.streak,
        diet: d.diet,
        vehicle: d.vehicle,
        country: "India",
        city: "Mumbai",
        occupation: i % 2 === 0 ? "Working Professional" : "Student",
        onboarded: true,
        isAdmin: false,
        createdAt: new Date().toISOString(),
      });

      for (let day = 1; day <= 24; day++) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        const dateStr = date.toISOString().slice(0, 10);

        const mode = modes[(i + day) % modes.length];
        const km = mode === "walking" || mode === "cycling" ? 2 : 8 + ((day * (i + 1)) % 18);
        const transportCarbon = Math.round(km * (TRANSPORT_FACTORS[mode] ?? 0) * 100) / 100;

        const acHours = (day % 6) + 1;
        const fanHours = 6;
        const lightHours = 4;
        const laptopHours = 5;
        const tvHours = 2;
        const electricityCarbon = Math.round(
          (acHours * ELECTRICITY_FACTORS.ac +
            fanHours * ELECTRICITY_FACTORS.fan +
            lightHours * ELECTRICITY_FACTORS.light +
            laptopHours * ELECTRICITY_FACTORS.laptop +
            tvHours * ELECTRICITY_FACTORS.tv) * 100
        ) / 100;

        const diet = diets[(i + day) % diets.length];
        const vegMeals = diet === "veg" ? 2 : 1;
        const veganMeals = diet === "vegan" ? 2 : 0;
        const nonVegMeals = diet === "nonveg" ? 2 : 0;
        const foodCarbon = Math.round(
          (vegMeals * FOOD_FACTORS.veg +
            veganMeals * FOOD_FACTORS.vegan +
            nonVegMeals * FOOD_FACTORS.nonveg) * 100
        ) / 100;

        const plasticBags = day % 3;
        const wasteCarbon = Math.round(
          (plasticBags * WASTE_FACTORS.plasticBag +
            (day % 2 === 0 ? WASTE_FACTORS.recyclingCredit : 0)) * 100
        ) / 100;

        const total = Math.round(
          (transportCarbon + electricityCarbon + foodCarbon + wasteCarbon) * 100
        ) / 100;

        await firestore
          .collection("users")
          .doc(userRef.id)
          .collection("dailyLogs")
          .add({
            date: dateStr,
            transportMode: mode,
            transportKm: km,
            acHours,
            fanHours,
            lightHours,
            laptopHours,
            tvHours,
            vegMeals,
            veganMeals,
            nonVegMeals,
            plasticBags,
            glassItems: day % 2,
            paperItems: 1,
            recycling: day % 2 === 0,
            composting: false,
            transportCarbon,
            electricityCarbon,
            foodCarbon,
            wasteCarbon,
            totalCarbon: total,
            userId: userRef.id,
          });
      }
    }

    // Ensure an admin account exists
    const adminEmail = "admin@ecotrack.app";
    const existingAdmin = await firestore
      .collection("users")
      .where("email", "==", adminEmail)
      .limit(1)
      .get();

    if (existingAdmin.empty) {
      await firestore.collection("users").add({
        email: adminEmail,
        name: "EcoTrack Admin",
        country: "India",
        city: "Mumbai",
        occupation: "Administrator",
        diet: "veg",
        vehicle: "metro",
        onboarded: true,
        isAdmin: true,
        xp: 5000,
        streak: 99,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      seeded: true,
      count: demoUsers.length,
      admin: { email: adminEmail, password: "admin1234" },
    });
  } catch (err) {
    console.error("POST /seed error:", err);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
