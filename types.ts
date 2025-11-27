import { Database } from "./database.types";

export type Landmark = Database["public"]["Tables"]["landmarks"]["Row"];

export type AddLandmark = Omit<Omit<Landmark, "id">, "created_at">;