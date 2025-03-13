import DBConnect from '../../utils/DBConnect';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { code } = req.query;

        try {

            if (!code) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const { db } = await DBConnect();

            const data = await db.collection('discountCodes').findOne({ code });
            if (!data) {
                return res.status(404).json({ error: 'Code not found' });
            }
            return res.status(200).json({ data });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

    }
    else if (req.method === 'POST') {
        const { code, wallet } = req.body;

        try {

            if (!code || !wallet) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const { db } = await DBConnect();

            // Save the used wallet
            await db.collection('discountCodes').updateOne({ code }, { $set: { used: true, usedBy: wallet } });

            return res.status(200).json({ code, used: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}
