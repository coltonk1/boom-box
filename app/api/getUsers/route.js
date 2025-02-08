import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("sample_mflix");

        const users = await db.collection("users").find({}).toArray();

        return Response.json(users, { status: 200 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
