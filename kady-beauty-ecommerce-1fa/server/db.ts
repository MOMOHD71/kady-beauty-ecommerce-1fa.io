import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "db.json");

export interface Database {
    users: Record<string, any>;
    products: any[];
    services: any[];
    orders: Record<string, any[]>;
    bookings: any[];
    deliveryRates: Record<string, number>;
    reviews: Record<string, any[]>;
    messages: any[];
    siteSettings: {
        ownerTitle: string;
        ownerImage: string;
        siteLogo: string;
    };
    models: any[];
    revenueOffset?: number;
}

const DEFAULT_DB: Database = {
    users: {
        "admin@kadybeauty.com": { password: "root KADY_Beauty.admin.001", role: "admin" }
    },
    products: [
        {
            id: 1,
            name: "Sérum Éclat Vitamine C",
            price: 15000,
            category: "Soins Visage",
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop",
            discount: 10
        }
    ],
    services: [
        {
            id: 1,
            name: "Soins du Visage",
            price: 32000,
            description: "Soins faciaux professionnels utilisant des produits haut de gamme.",
            image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=400&auto=format&fit=crop",
            discount: 0
        },
        {
            id: 2,
            name: "Coiffure",
            price: 39000,
            description: "Coupes, coloration et traitements d'experts.",
            image: "https://images.unsplash.com/photo-1560869713-7d0a29430039?q=80&w=400&auto=format&fit=crop",
            discount: 10
        }
    ],
    orders: {},
    bookings: [],
    deliveryRates: {
        abidjan: 1500,
        near: 2000,
        rest: 3000
    },
    reviews: {},
    messages: [],
    siteSettings: {
        ownerTitle: "Propriétaire du site",
        ownerImage: "/owner.png",
        siteLogo: "/logo.png"
    },
    models: [],
    revenueOffset: 0
};

export const loadDB = (): Database => {
    try {
        if (fs.existsSync(DB_PATH)) {
            const data = fs.readFileSync(DB_PATH, "utf-8");
            const loaded = JSON.parse(data);
            // Robust merging: ensure all keys from DEFAULT_DB exist
            return { ...DEFAULT_DB, ...loaded, siteSettings: { ...DEFAULT_DB.siteSettings, ...(loaded.siteSettings || {}) } };
        }
    } catch (err) {
        console.error("Error loading DB, using defaults:", err);
    }
    return DEFAULT_DB;
};

export const saveDB = (db: Database) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
    } catch (err) {
        console.error("Error saving DB:", err);
    }
};

// Initialize the file if it doesn't exist
const initialDB = loadDB();
saveDB(initialDB);
