import DBConnect from '../../utils/DBConnect';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { wallet, qty } = req.body;

        try {

            if (!wallet || !qty) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const { db } = await DBConnect();

            await db.collection('purchases').insertOne({ wallet, qty });

            return res.status(200).json({ qty, wallet });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}